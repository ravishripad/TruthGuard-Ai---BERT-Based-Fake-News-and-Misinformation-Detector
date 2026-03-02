import os
import re
import time
from google import genai
from dotenv import load_dotenv
from typing import Optional, Dict, List

load_dotenv()

# Models to try in order (current stable models per docs.ai.google.dev/gemini-api/docs/models)
_CANDIDATE_MODELS = [
    "gemini-2.5-flash-lite",     # most budget-friendly + fastest, separate quota pool
    "gemini-2.5-flash",          # best price-performance fallback
    "gemini-2.0-flash",          # deprecated but still available as last resort
]

_MAX_RETRIES = 3
_RETRY_DELAY = 30  # seconds to wait on quota error

class AIFactChecker:
    def __init__(self):
        api_key = os.getenv('AI_API_KEY')
        self.enabled = os.getenv('ENABLE_AI_CHECK', 'true').lower() == 'true'
        self._client = None
        self._model_id = None

        if api_key and api_key != 'your_api_key_here' and len(api_key) > 10:
            try:
                # New google-genai SDK uses a Client object
                self._client = genai.Client(api_key=api_key)
                # Pick the first model that doesn't raise on a list call
                self._model_id = _CANDIDATE_MODELS[0]  # will be confirmed on first call
                self.enabled = True
                print(f"✓ Gemini AI (google-genai SDK) ready — primary model: {self._model_id}")
            except Exception as e:
                print(f"⚠ Failed to initialise Gemini AI: {e}")
                self._client = None
                self._model_id = None
                self.enabled = False
        else:
            self._client = None
            self._model_id = None
            self.enabled = False
            print("⚠ AI API key not configured, using BERT model only")

    # ── robust response parser ─────────────────────────────────────────────────
    def _parse_response(self, text_response: str) -> Optional[Dict]:
        """
        Parse Gemini's structured response.
        Uses strict regex to avoid false-fake from lines like 'REAL (not FAKE)'.
        """
        print(f"[Gemini raw response]:\n{text_response}\n---")

        # Strict match: look for CLASSIFICATION line
        # Valid values: REAL, FAKE, UNVERIFIED (UNVERIFIED → treated as REAL with capped confidence)
        classification = "real"  # default — bias toward real to avoid over-flagging
        unverified = False
        for line in text_response.split('\n'):
            if 'CLASSIFICATION' in line.upper():
                after_colon = line.split(':', 1)[-1].strip().upper()
                if re.search(r'\bFAKE\b', after_colon) and not re.search(r'\bNOT\s+FAKE\b', after_colon):
                    classification = "fake"
                elif re.search(r'\b(UNVERIFIED|UNCERTAIN|UNCLEAR|MISLEADING)\b', after_colon):
                    # UNVERIFIED = can't confirm but can't deny → give benefit of the doubt
                    classification = "real"
                    unverified = True
                elif re.search(r'\bREAL\b', after_colon):
                    classification = "real"
                break

        # UNVERIFIED gets a lower base confidence (0.60) instead of 0.75
        confidence = 0.60 if unverified else 0.75
        for line in text_response.split('\n'):
            if 'CONFIDENCE' in line.upper():
                match = re.search(r'(\d+(?:\.\d+)?)', line)
                if match:
                    confidence = float(match.group(1)) / 100.0
                    if unverified:
                        confidence = min(confidence, 0.68)  # cap UNVERIFIED so it stays low-confidence
                    confidence = min(max(confidence, 0.50), 0.99)
                break

        return {
            "prediction": classification,
            "confidence": confidence,
            "probabilities": {
                "fake": confidence if classification == "fake" else round(1 - confidence, 4),
                "real": confidence if classification == "real" else round(1 - confidence, 4),
            },
            "is_fake": classification == "fake",
            "ai_reasoning": text_response,
            "ai_enabled": True,
        }

    # ── context-aware primary prediction ──────────────────────────────────────
    def predict_with_context(
        self,
        text: str,
        news_articles: Optional[List[Dict]] = None,
    ) -> Optional[Dict]:
        """
        PRIMARY predictor. Gemini receives:
          - The user's claim / headline
          - Real news articles (title + description + fetched body snippet + URL)
        Uses evidence to decide REAL vs FAKE.
        """
        if not self.enabled or not self._client:
            return None

        try:
            # ── Build evidence block ──────────────────────────────────────────
            evidence_block = ""
            usable_articles = [a for a in (news_articles or []) if a.get("title")]
            if usable_articles:  # noqa: SIM102
                lines = []
                for i, art in enumerate(usable_articles[:5], 1):
                    title    = art.get("title", "").strip()
                    source   = art.get("source", "Unknown")
                    url      = art.get("url", "")
                    pub_date = (art.get("published_at") or "").strip()
                    desc     = (art.get("description") or art.get("snippet") or "").strip()[:300]
                    snippet  = (art.get("fetched_snippet") or "").strip()[:500]

                    entry  = f"[Article {i}] {source}\n"
                    if pub_date:
                        entry += f"  Published: {pub_date}\n"
                    entry += f"  Headline : {title}\n"
                    if desc:
                        entry += f"  Summary  : {desc}\n"
                    if snippet:
                        entry += f"  Body text: {snippet}\n"
                    if url:
                        entry += f"  URL      : {url}\n"
                    lines.append(entry)

                evidence_block = (
                    "\n=== LIVE NEWS ARTICLES RETRIEVED FROM THE WEB ===\n"
                    + "\n".join(lines)
                    + "=== END OF RETRIEVED ARTICLES ===\n"
                )

            # ── Prompt ────────────────────────────────────────────────────────
            if evidence_block:
                prompt = f"""You are an expert fact-checker. Assess whether the following claim is TRUE, FALSE, or UNVERIFIED.

CLAIM TO VERIFY: "{text}"

REAL NEWS ARTICLES RETRIEVED FROM THE WEB:
{evidence_block}

CLASSIFICATION RULES — read carefully before deciding:

• REAL — Use this when:
  - The retrieved articles confirm the core factual event happened.
  - The claim is consistent with the articles, even if the headline uses dramatic or opinionated language.
  - Sensationalist phrasing of a real event is NOT fake news.

• FAKE — Use this ONLY when:
  - The retrieved articles DIRECTLY CONTRADICT the specific factual assertion (e.g. the event did not happen, the wrong person is named, the statistic is fabricated).
  - There is clear, direct evidence of misinformation — not just missing confirmation.
  - Do NOT choose FAKE simply because the claim is surprising, alarming, or uses strong language.

• UNVERIFIED — Use this when:
  - The retrieved articles cover a related topic but do NOT specifically confirm or deny the claim.
  - The claim is about a very recent event (2025–2026) that may not be fully reported yet.
  - You cannot determine truth or falsehood from the available evidence.
  - When in doubt between FAKE and UNVERIFIED, always choose UNVERIFIED.

IMPORTANT: The retrieved articles may only cover part of the story. Absence of full confirmation is NOT evidence of fakeness.

YOU MUST RESPOND IN EXACTLY THIS FORMAT — no preamble, no extra lines:
CLASSIFICATION: REAL
CONFIDENCE: 85%
REASONING: Brief explanation referencing the articles.

Valid classifications: REAL, FAKE, UNVERIFIED"""
            else:
                prompt = f"""You are an expert fact-checker.

CLAIM TO VERIFY: "{text}"

No live news articles were retrieved for this claim.

INSTRUCTIONS:
- For events in 2024–2026, default to UNVERIFIED — they may simply be outside your training data.
- Choose FAKE ONLY for claims with clearly impossible statistics, demonstrably established hoaxes,
  direct logical impossibilities, or classic misinformation patterns you know with high certainty.
- Choose REAL only if you have strong, specific knowledge confirming this exact claim.
- When uncertain: UNVERIFIED is always safer than FAKE.

YOU MUST RESPOND IN EXACTLY THIS FORMAT — no preamble:
CLASSIFICATION: UNVERIFIED
CONFIDENCE: 60%
REASONING: Brief explanation here.

Valid classifications: REAL, FAKE, UNVERIFIED"""

            # ── Call Gemini — try each model, fall to next on quota error ────
            last_error = None
            for attempt in range(_MAX_RETRIES):
                all_quota = True
                for model_id in _CANDIDATE_MODELS:
                    try:
                        response = self._client.models.generate_content(
                            model=model_id,
                            contents=prompt,
                        )
                        self._model_id = model_id
                        result = self._parse_response(response.text)
                        if result:
                            result["context_articles_used"] = len(usable_articles)
                        return result
                    except Exception as model_err:
                        err_str = str(model_err)
                        last_error = model_err
                        is_quota = (
                            "quota" in err_str.lower()
                            or "429" in err_str
                            or "resource_exhausted" in err_str.lower()
                        )
                        if is_quota:
                            # Parse suggested retry delay from error body
                            delay_match = re.search(r'retry in (\d+(?:\.\d+)?)s', err_str.lower())
                            suggested = int(float(delay_match.group(1))) + 2 if delay_match else _RETRY_DELAY
                            print(f"⚠ Quota on {model_id} (attempt {attempt+1}), trying next model…")
                            # DO NOT sleep here — try next model first
                            continue  # ← try next model immediately
                        else:
                            all_quota = False
                            print(f"⚠ Model {model_id} error: {err_str[:120]}")
                            continue  # try next model

                # All models failed this attempt
                if all_quota and attempt < _MAX_RETRIES - 1:
                    wait = suggested if 'suggested' in dir() else _RETRY_DELAY
                    print(f"⚠ All models quota-exhausted. Waiting {wait}s before retry {attempt+2}/{_MAX_RETRIES}…")
                    time.sleep(wait)

            print(f"Gemini: all {len(_CANDIDATE_MODELS)} models failed after {_MAX_RETRIES} attempts. Last error: {str(last_error)[:200]}")
            return None

        except Exception as e:
            print(f"Gemini unexpected error: {e}")
            return None

    # ── backwards-compat wrappers ──────────────────────────────────────────────
    def predict(self, text: str) -> Optional[Dict]:
        return self.predict_with_context(text, news_articles=None)

    def check_claim(self, text: str) -> Optional[Dict]:
        return self.predict(text)

    def reconcile_predictions(self, bert_prediction: Dict, ai_result: Optional[Dict]) -> Dict:
        if ai_result and self.enabled:
            return {
                "text": bert_prediction.get("text", ""),
                "prediction": ai_result["prediction"],
                "confidence": ai_result["confidence"],
                "probabilities": ai_result["probabilities"],
                "is_fake": ai_result["is_fake"],
                "classification_type": "binary",
            }
        return {**bert_prediction, "is_fake": bert_prediction["prediction"] == "fake"}


# Global instance
ai_checker = AIFactChecker()


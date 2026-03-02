import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional, Dict, List

# Load environment variables
load_dotenv()

class AIFactChecker:
    def __init__(self):
        api_key = os.getenv('AI_API_KEY')
        self.enabled = os.getenv('ENABLE_AI_CHECK', 'true').lower() == 'true'

        if api_key and api_key != 'your_api_key_here' and len(api_key) > 10:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                self.enabled = True
                print("✓ Gemini AI initialized successfully")
            except Exception as e:
                print(f"⚠ Failed to initialize Gemini AI: {e}")
                self.model = None
                self.enabled = False
        else:
            self.model = None
            self.enabled = False
            print("⚠ AI API key not configured, using BERT model only")

    # ── internal parser ────────────────────────────────────────────────────────
    def _parse_response(self, text_response: str) -> Optional[Dict]:
        """Parse the structured Gemini response into a result dict."""
        classification = "real"  # default to real to avoid bias
        for line in text_response.upper().split('\n'):
            if 'CLASSIFICATION' in line:
                if 'FAKE' in line:
                    classification = "fake"
                break

        confidence = 0.75
        for line in text_response.split('\n'):
            if 'CONFIDENCE' in line.upper():
                match = re.search(r'(\d+)', line)
                if match:
                    confidence = float(match.group(1)) / 100.0
                    confidence = min(max(confidence, 0.5), 0.99)
                break

        return {
            "prediction": classification,
            "confidence": confidence,
            "probabilities": {
                "fake": confidence if classification == "fake" else 1 - confidence,
                "real": confidence if classification == "real" else 1 - confidence,
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
        PRIMARY predictor.  Gemini receives:
          1. The user's claim / headline
          2. Real news articles fetched by NewsAPI / Google News / SerpAPI
             (title, source, description, URL, and any fetched snippet)

        Gemini uses this real-world evidence to decide REAL vs FAKE.
        Falls back to knowledge-only if no articles were found.
        """
        if not self.enabled or not self.model:
            return None

        try:
            # ── Build the evidence block from fetched articles ────────────────
            evidence_block = ""
            if news_articles:
                lines = []
                for i, art in enumerate(news_articles[:5], 1):
                    title   = art.get("title", "").strip()
                    source  = art.get("source", "Unknown source")
                    url     = art.get("url", "")
                    desc    = (art.get("description") or art.get("snippet") or "").strip()[:300]
                    snippet = (art.get("fetched_snippet") or "").strip()[:400]

                    entry = f"[Article {i}]\n"
                    entry += f"  Source : {source}\n"
                    entry += f"  Title  : {title}\n"
                    if desc:
                        entry += f"  Summary: {desc}\n"
                    if snippet:
                        entry += f"  Content: {snippet}\n"
                    if url:
                        entry += f"  URL    : {url}\n"
                    lines.append(entry)

                if lines:
                    evidence_block = (
                        "\n--- REAL NEWS ARTICLES RETRIEVED FROM THE WEB ---\n"
                        + "\n".join(lines)
                        + "\n--- END OF RETRIEVED ARTICLES ---\n"
                    )

            # ── Compose prompt ────────────────────────────────────────────────
            if evidence_block:
                prompt = f"""You are an expert fact-checker with access to real-time news.

A user submitted the following claim/headline for verification:
\"{text}\"

I have retrieved the following real news articles from the web that may be related:
{evidence_block}

Your task:
1. Read the claim carefully.
2. Cross-reference it with the retrieved articles above.
3. Decide whether the claim is REAL (factually accurate / reported by credible sources) or FAKE (misinformation / not corroborated / contradicted by evidence).

Key rules:
- If multiple credible sources report this or something very similar → lean REAL.
- If the claim exaggerates, distorts, or contradicts what the articles say → lean FAKE.
- If no articles are directly relevant, use your general knowledge.
- Recent news from 2024–2026 may be outside your training data — trust the retrieved articles in that case.
- Do NOT mark something fake just because it sounds surprising. Real events can be surprising.

Respond in this EXACT format (nothing else):
CLASSIFICATION: [REAL or FAKE]
CONFIDENCE: [number between 0 and 100]%
REASONING: [2-3 sentences explaining your decision based on the evidence above]"""
            else:
                # No articles found — use knowledge only
                prompt = f"""You are an expert fact-checker.

A user submitted the following claim/headline for verification:
\"{text}\"

No relevant news articles were found via live search. Use your general knowledge to evaluate this claim.

Key rules:
- Be balanced. Real news exists — do not default to fake.
- Consider whether reputable outlets would plausibly report this.
- Flag clear misinformation patterns (impossible claims, emotional manipulations, implausible statistics).

Respond in this EXACT format (nothing else):
CLASSIFICATION: [REAL or FAKE]
CONFIDENCE: [number between 0 and 100]%
REASONING: [2-3 sentences explaining your decision]"""

            response = self.model.generate_content(prompt)
            result = self._parse_response(response.text)
            if result:
                result["context_articles_used"] = len(news_articles) if news_articles else 0
            return result

        except Exception as e:
            print(f"Gemini API error: {e}")
            return None

    # ── backwards-compat wrapper ───────────────────────────────────────────────
    def predict(self, text: str) -> Optional[Dict]:
        """Legacy call — no news context. Prefer predict_with_context()."""
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

import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional, Dict

# Load environment variables
load_dotenv()

class AIFactChecker:
    def __init__(self):
        api_key = os.getenv('AI_API_KEY')
        self.enabled = os.getenv('ENABLE_AI_CHECK', 'true').lower() == 'true'
        
        if api_key and api_key != 'your_api_key_here' and len(api_key) > 10:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-flash-latest')
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
    
    def predict(self, text: str) -> Optional[Dict]:
        """
        Use AI as the PRIMARY predictor for fake news detection.
        
        Args:
            text: The claim/statement to fact-check
            
        Returns:
            Dict with AI's prediction or None if disabled/error
        """
        if not self.enabled or not self.model:
            return None
        
        try:
            prompt = f"""You are a professional fact-checker. Analyze the following news statement and determine if it's REAL or FAKE news.

Statement: "{text}"

Respond in this EXACT format:
CLASSIFICATION: [REAL or FAKE]
CONFIDENCE: [number between 0 and 100]%
REASONING: [One sentence explanation]

Consider:
- Is this factually accurate based on your knowledge?
- Does it follow common misinformation patterns?
- Is it logically consistent?
- Would reputable news sources report this?

Be balanced - don't assume everything is fake. Real news exists too."""

            response = self.model.generate_content(prompt)
            text_response = response.text
            
            # Parse classification
            classification = "real"  # Default to real to avoid bias
            lines = text_response.upper().split('\n')
            for line in lines:
                if 'CLASSIFICATION' in line:
                    if 'FAKE' in line:
                        classification = "fake"
                    elif 'REAL' in line:
                        classification = "real"
                    break
            
            # Parse confidence
            confidence = 0.75  # Default confidence
            import re
            for line in text_response.split('\n'):
                if 'CONFIDENCE' in line.upper():
                    match = re.search(r'(\d+)', line)
                    if match:
                        confidence = float(match.group(1)) / 100.0
                        confidence = min(max(confidence, 0.5), 0.99)  # Clamp between 50-99%
                    break
            
            return {
                "prediction": classification,
                "confidence": confidence,
                "probabilities": {
                    "fake": confidence if classification == "fake" else 1 - confidence,
                    "real": confidence if classification == "real" else 1 - confidence
                },
                "is_fake": classification == "fake",
                "ai_reasoning": text_response,
                "ai_enabled": True
            }
        
        except Exception as e:
            print(f"AI API error: {e}")
            return None
    
    def check_claim(self, text: str) -> Optional[Dict]:
        """Alias for predict() for backwards compatibility"""
        return self.predict(text)
    
    def reconcile_predictions(self, bert_prediction: Dict, ai_result: Optional[Dict]) -> Dict:
        """
        Use AI as PRIMARY predictor. Fall back to BERT only if AI fails.
        
        Args:
            bert_prediction: The prediction from BERT model (fallback)
            ai_result: The result from AI (primary)
            
        Returns:
            Final prediction - AI if available, else BERT
        """
        # If AI prediction is available, use it as primary
        if ai_result and self.enabled:
            return {
                "text": bert_prediction.get("text", ""),
                "prediction": ai_result["prediction"],
                "confidence": ai_result["confidence"],
                "probabilities": ai_result["probabilities"],
                "is_fake": ai_result["is_fake"],
                "classification_type": "binary"
            }
        
        # Fallback to BERT if AI not available
        return {
            **bert_prediction,
            "is_fake": bert_prediction["prediction"] == "fake"
        }

# Global instance
ai_checker = AIFactChecker()

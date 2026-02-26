from pydantic import BaseModel, Field
from typing import Optional

class PredictionRequest(BaseModel):
    title: str = Field(..., description="News headline/title to analyze", min_length=5)
    text: Optional[str] = Field(default=None, description="Full article text (optional, improves accuracy)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Scientists Discover New Treatment for Cancer",
                "text": "Researchers at Johns Hopkins University have announced a breakthrough in cancer treatment."
            }
        }

class PredictionResponse(BaseModel):
    text: str = Field(..., description="Original input text")
    prediction: str = Field(..., description="Predicted label (e.g., fake, real)")
    confidence: float = Field(..., description="Confidence score for the prediction", ge=0, le=1)
    probabilities: dict[str, float] = Field(..., description="Probabilities for all labels")
    is_fake: bool = Field(..., description="Whether the news is considered fake")
    classification_type: str = Field(default="binary", description="Type of classification (binary or multi-class)")
    
    # Prediction source tracking
    prediction_source: str | None = Field(default=None, description="Source of prediction (bert_model, gemini_ai, or bert_model+gemini_ai)")
    override_reason: str | None = Field(default=None, description="Reason if prediction was overridden by news sources")
    
    # News validation fields
    news_validation: dict | None = Field(default=None, description="News source validation results")
    news_insight: str | None = Field(default=None, description="Insight from news validation")
    verification_boost: float | None = Field(default=None, description="Confidence adjustment from news validation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Breaking news: Scientists have discovered a new planet in our solar system.",
                "prediction": "fake",
                "confidence": 0.85,
                "probabilities": {
                    "real": 0.15,
                    "fake": 0.85
                },
                "is_fake": True,
                "classification_type": "binary",
                "news_validation": {
                    "verification_status": "not_found",
                    "total_articles_found": 0
                },
                "news_insight": "No news coverage found"
            }
        }

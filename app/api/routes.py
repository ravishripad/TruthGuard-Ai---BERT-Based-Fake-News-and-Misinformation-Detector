from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.models.bert_model import get_model, predict_fake_news
from app.utils.ai_verification import ai_checker
from app.utils.news_validator import news_validator
from app.auth import get_current_user
from app.database import get_predictions_collection

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Predict whether a news article is fake or real.
    Flow: BERT Model (primary) → Gemini AI (verification) → News Sources (override)
    Requires authentication.
    
    Args:
        request: PredictionRequest containing the news title and optional text
        
    Returns:
        PredictionResponse with prediction label, confidence, and probabilities
    """
    try:
        # Format input: combine title and text with [SEP] like training data
        if request.text:
            formatted_input = f"{request.title} [SEP] {request.text}"
        else:
            # Only title provided - duplicate for model compatibility
            formatted_input = f"{request.title} [SEP] {request.title}"
        
        # STEP 1: BERT Model prediction (PRIMARY)
        model, tokenizer, checkpoint = get_model()
        bert_result = predict_fake_news(formatted_input, model, tokenizer, checkpoint)
        bert_result["text"] = request.title
        
        final_result = {
            **bert_result,
            "is_fake": bert_result["prediction"] == "fake",
            "prediction_source": "bert_model"
        }
        
        # STEP 2: Gemini AI verification (can adjust prediction)
        ai_result = ai_checker.predict(request.title)
        
        if ai_result:
            # If BERT and Gemini disagree, use the one with higher confidence
            bert_confidence = bert_result["confidence"]
            ai_confidence = ai_result["confidence"]
            
            if bert_result["prediction"] != ai_result["prediction"]:
                # Disagreement - use higher confidence prediction
                if ai_confidence > bert_confidence:
                    final_result["prediction"] = ai_result["prediction"]
                    final_result["confidence"] = ai_confidence
                    final_result["probabilities"] = ai_result["probabilities"]
                    final_result["is_fake"] = ai_result["is_fake"]
                    final_result["prediction_source"] = "gemini_ai"
                    final_result["ai_override"] = True
                # else keep BERT prediction
            else:
                # Agreement - boost confidence
                final_result["confidence"] = min(0.98, (bert_confidence + ai_confidence) / 2 + 0.1)
                final_result["prediction_source"] = "bert_model+gemini_ai"
        
        # STEP 3: News validation (can OVERRIDE based on evidence)
        news_validation = news_validator.validate_claim(request.title)
        
        # Add news validation insights - this can override both BERT and Gemini
        final_result = news_validator.enhance_prediction(final_result, ai_result, news_validation)
        
        # Save prediction to history
        predictions_collection = get_predictions_collection()
        prediction_record = {
            "user_id": str(current_user["_id"]),
            "text": request.title[:500],  # Store title
            "prediction": final_result["prediction"],
            "confidence": final_result["confidence"],
            "is_fake": final_result["is_fake"],
            "created_at": datetime.utcnow()
        }
        await predictions_collection.insert_one(prediction_record)
        
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch-predict")
async def batch_predict(
    texts: list[str],
    current_user: dict = Depends(get_current_user)
):
    """
    Predict multiple news articles at once.
    Flow: BERT Model (primary) → Gemini AI (verification) → News Sources (override)
    Requires authentication.
    
    Args:
        texts: List of news article texts
        
    Returns:
        List of predictions
    """
    try:
        model, tokenizer, checkpoint = get_model()
        results = []
        predictions_collection = get_predictions_collection()
        
        for text in texts:
            # Format input for BERT
            formatted_input = f"{text} [SEP] {text}"
            
            # STEP 1: BERT Model prediction (PRIMARY)
            bert_result = predict_fake_news(formatted_input, model, tokenizer, checkpoint)
            bert_result["text"] = text
            final_result = {
                **bert_result,
                "is_fake": bert_result["prediction"] == "fake",
                "prediction_source": "bert_model"
            }
            
            # STEP 2: Gemini AI verification
            ai_result = ai_checker.predict(text)
            if ai_result:
                if bert_result["prediction"] != ai_result["prediction"]:
                    if ai_result["confidence"] > bert_result["confidence"]:
                        final_result["prediction"] = ai_result["prediction"]
                        final_result["confidence"] = ai_result["confidence"]
                        final_result["is_fake"] = ai_result["is_fake"]
                        final_result["prediction_source"] = "gemini_ai"
            
            # STEP 3: Validate against news sources
            news_validation = news_validator.validate_claim(text)
            final_result = news_validator.enhance_prediction(final_result, ai_result, news_validation)
            results.append(final_result)
            
            # Save to history
            prediction_record = {
                "user_id": str(current_user["_id"]),
                "text": text[:500],
                "prediction": final_result["prediction"],
                "confidence": final_result["confidence"],
                "is_fake": final_result["is_fake"],
                "created_at": datetime.utcnow()
            }
            await predictions_collection.insert_one(prediction_record)
        
        return {"predictions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

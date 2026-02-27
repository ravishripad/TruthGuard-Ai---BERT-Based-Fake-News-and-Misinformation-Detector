from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.schemas.prediction import PredictionRequest, PredictionResponse, ImagePredictionRequest, ImageExtractionResponse
from app.models.bert_model import get_model, predict_fake_news
from app.utils.ai_verification import ai_checker
from app.utils.news_validator import news_validator
from app.utils.image_ocr import image_ocr
from app.auth import get_current_user
from app.database import get_predictions_collection
from app.utils.logger import get_logger

logger = get_logger(__name__)
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
        user_id = str(current_user["_id"])
        logger.info("[predict] user=%s | title='%.80s'", user_id, request.title)

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

        logger.info(
            "[predict] DONE user=%s | result=%s | confidence=%.2f | source=%s",
            user_id,
            final_result["prediction"].upper(),
            final_result["confidence"],
            final_result.get("prediction_source", "unknown"),
        )
        return final_result
    except Exception as e:
        logger.error("[predict] ERROR user=%s | %s", str(current_user.get("_id", "?")), e, exc_info=True)
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
        user_id = str(current_user["_id"])
        logger.info("[batch-predict] user=%s | count=%d", user_id, len(texts))
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
        
        logger.info("[batch-predict] DONE user=%s | processed=%d", user_id, len(results))
        return {"predictions": results}
    except Exception as e:
        logger.error("[batch-predict] ERROR user=%s | %s", str(current_user.get("_id", "?")), e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@router.post("/image-predict")
async def image_predict(
    request: ImagePredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Extract text from a news image and predict if it's fake or real.
    Uses OCR to extract title and text, then runs through the prediction pipeline.
    
    Args:
        request: ImagePredictionRequest containing base64 encoded image
        
    Returns:
        Dict with extracted text and prediction results
    """
    try:
        user_id = str(current_user["_id"])
        logger.info("[image-predict] user=%s | mime=%s", user_id, request.mime_type)
        # Step 1: Extract text from image using OCR
        if not image_ocr.enabled:
            raise HTTPException(status_code=503, detail="Image OCR service not available. Check AI API key.")
        
        extraction_result = image_ocr.extract_from_base64(request.image, request.mime_type)
        
        if not extraction_result or not extraction_result.get("extraction_success"):
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from image. Please ensure the image contains readable news text."
            )
        
        title = extraction_result.get("title", "")
        text = extraction_result.get("text", "")
        
        # Use title if found, otherwise use first part of text
        if title == "NOT_FOUND" or not title:
            if text and text != "NOT_FOUND":
                title = text[:200]  # Use first 200 chars of text as title
            else:
                raise HTTPException(status_code=400, detail="No readable text found in image.")
        
        # Step 2: Format input for BERT model
        if text and text != "NOT_FOUND":
            formatted_input = f"{title} [SEP] {text}"
        else:
            formatted_input = f"{title} [SEP] {title}"
        
        # Step 3: BERT Model prediction (PRIMARY)
        model, tokenizer, checkpoint = get_model()
        bert_result = predict_fake_news(formatted_input, model, tokenizer, checkpoint)
        bert_result["text"] = title
        
        final_result = {
            **bert_result,
            "is_fake": bert_result["prediction"] == "fake",
            "prediction_source": "bert_model",
            "extracted_from_image": True
        }
        
        # Step 4: Gemini AI verification
        ai_result = ai_checker.predict(title)
        
        if ai_result:
            bert_confidence = bert_result["confidence"]
            ai_confidence = ai_result["confidence"]
            
            if bert_result["prediction"] != ai_result["prediction"]:
                if ai_confidence > bert_confidence:
                    final_result["prediction"] = ai_result["prediction"]
                    final_result["confidence"] = ai_confidence
                    final_result["probabilities"] = ai_result["probabilities"]
                    final_result["is_fake"] = ai_result["is_fake"]
                    final_result["prediction_source"] = "gemini_ai"
            else:
                final_result["confidence"] = min(0.98, (bert_confidence + ai_confidence) / 2 + 0.1)
                final_result["prediction_source"] = "bert_model+gemini_ai"
        
        # Step 5: News validation
        news_validation = news_validator.validate_claim(title)
        final_result = news_validator.enhance_prediction(final_result, ai_result, news_validation)
        
        # Add extraction metadata
        final_result["image_extraction"] = {
            "title": title,
            "text": text if text != "NOT_FOUND" else None,
            "source": extraction_result.get("source") if extraction_result.get("source") != "NOT_FOUND" else None,
            "date": extraction_result.get("date") if extraction_result.get("date") != "NOT_FOUND" else None
        }
        
        # Save to history
        predictions_collection = get_predictions_collection()
        prediction_record = {
            "user_id": str(current_user["_id"]),
            "text": title[:500],
            "prediction": final_result["prediction"],
            "confidence": final_result["confidence"],
            "is_fake": final_result["is_fake"],
            "from_image": True,
            "created_at": datetime.utcnow()
        }
        await predictions_collection.insert_one(prediction_record)

        logger.info(
            "[image-predict] DONE user=%s | title='%.60s' | result=%s | confidence=%.2f",
            user_id, title,
            final_result["prediction"].upper(),
            final_result["confidence"],
        )
        return final_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[image-predict] ERROR user=%s | %s", str(current_user.get("_id", "?")), e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image prediction error: {str(e)}")


@router.post("/extract-image-text", response_model=ImageExtractionResponse)
async def extract_image_text(
    request: ImagePredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Extract text from an image without making a prediction.
    Useful for previewing extracted content before verification.
    
    Args:
        request: ImagePredictionRequest containing base64 encoded image
        
    Returns:
        ImageExtractionResponse with extracted title and text
    """
    try:
        if not image_ocr.enabled:
            raise HTTPException(status_code=503, detail="Image OCR service not available.")
        
        result = image_ocr.extract_from_base64(request.image, request.mime_type)
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to process image.")
        
        return ImageExtractionResponse(
            title=result.get("title", "NOT_FOUND"),
            text=result.get("text", "NOT_FOUND"),
            source=result.get("source") if result.get("source") != "NOT_FOUND" else None,
            date=result.get("date") if result.get("date") != "NOT_FOUND" else None,
            extraction_success=result.get("extraction_success", False)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction error: {str(e)}")

from fastapi import APIRouter, HTTPException, status, Depends, Request
from datetime import datetime, timedelta
from bson import ObjectId
from app.database import get_users_collection, get_predictions_collection
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.limiter import limiter
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserCreate):
    """
    Register a new user account.
    
    - **email**: Valid email address (must be unique)
    - **username**: Username (3-50 characters, must be unique)
    - **password**: Password (min 6 characters)
    - **full_name**: Optional full name
    """
    users_collection = get_users_collection()
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    new_user = {
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "hashed_password": get_password_hash(user_data.password),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)
    logger.info("[register] New user: id=%s | username=%s | email=%s", user_id, user_data.username, user_data.email)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_id, "email": user_data.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            email=new_user["email"],
            username=new_user["username"],
            full_name=new_user["full_name"],
            created_at=new_user["created_at"],
            is_active=new_user["is_active"]
        )
    )


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin):
    """
    Login with email and password to get access token.
    
    - **email**: Registered email address
    - **password**: Account password
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user:
        logger.warning("[login] FAILED (unknown email) | email=%s", credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        logger.warning("[login] FAILED (wrong password) | email=%s", credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Create access token
    user_id = str(user["_id"])
    logger.info("[login] SUCCESS | id=%s | username=%s | email=%s", user_id, user["username"], user["email"])
    access_token = create_access_token(
        data={"sub": user_id, "email": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            email=user["email"],
            username=user["username"],
            full_name=user.get("full_name"),
            created_at=user["created_at"],
            is_active=user.get("is_active", True)
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    Requires valid JWT token in Authorization header.
    """
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        created_at=current_user["created_at"],
        is_active=current_user.get("is_active", True)
    )


@router.get("/history")
async def get_prediction_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's prediction history.
    Returns the last N predictions made by the user.
    """
    predictions_collection = get_predictions_collection()
    user_id = str(current_user["_id"])
    
    cursor = predictions_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    
    predictions = []
    async for prediction in cursor:
        prediction["_id"] = str(prediction["_id"])
        predictions.append(prediction)
    
    return {"predictions": predictions, "count": len(predictions)}


@router.delete("/history/{prediction_id}")
async def delete_prediction_history_item(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete one prediction history item for the current user.
    """
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid history item id")

    predictions_collection = get_predictions_collection()
    user_id = str(current_user["_id"])

    result = await predictions_collection.delete_one({
        "_id": ObjectId(prediction_id),
        "user_id": user_id,
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")

    logger.info("[history-delete] user=%s | prediction_id=%s", user_id, prediction_id)
    return {"message": "History item deleted", "deleted_count": result.deleted_count}


@router.delete("/history")
async def clear_prediction_history(current_user: dict = Depends(get_current_user)):
    """
    Delete all prediction history for the current user.
    """
    predictions_collection = get_predictions_collection()
    user_id = str(current_user["_id"])

    result = await predictions_collection.delete_many({"user_id": user_id})
    logger.info("[history-clear] user=%s | deleted=%d", user_id, result.deleted_count)

    return {"message": "History cleared", "deleted_count": result.deleted_count}


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """
    Get user's prediction statistics.
    Returns total checks, real count, and fake count.
    """
    predictions_collection = get_predictions_collection()
    user_id = str(current_user["_id"])
    
    # Count total predictions
    total_checks = await predictions_collection.count_documents({"user_id": user_id})
    
    # Count real predictions
    real_count = await predictions_collection.count_documents({
        "user_id": user_id,
        "is_fake": False
    })
    
    # Count fake predictions
    fake_count = await predictions_collection.count_documents({
        "user_id": user_id,
        "is_fake": True
    })
    
    return {
        "total_checks": total_checks,
        "real_count": real_count,
        "fake_count": fake_count
    }


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user (client should discard the token).
    """
    logger.info("[logout] user=%s | username=%s", str(current_user["_id"]), current_user.get("username"))
    return {"message": "Successfully logged out"}

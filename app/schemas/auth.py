from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    full_name: Optional[str] = Field(None, description="Full name")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    username: str = Field(..., description="Username")
    full_name: Optional[str] = Field(None, description="Full name")
    created_at: datetime = Field(..., description="Account creation date")
    is_active: bool = Field(default=True, description="Whether user is active")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "created_at": "2024-01-15T10:30:00Z",
                "is_active": True
            }
        }


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "507f1f77bcf86cd799439011",
                    "email": "user@example.com",
                    "username": "johndoe",
                    "full_name": "John Doe",
                    "created_at": "2024-01-15T10:30:00Z",
                    "is_active": True
                }
            }
        }


class TokenData(BaseModel):
    """Schema for decoded token data"""
    user_id: Optional[str] = None
    email: Optional[str] = None

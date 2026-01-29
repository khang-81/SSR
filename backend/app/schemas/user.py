"""
Pydantic schemas for User.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    """Request schema for user registration."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")
    role: UserRole = Field(default=UserRole.BUYER, description="User role (BUYER or SELLER)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "role": "BUYER"
            }
        }


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: int
    email: str
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True  # Pydantic v2: orm_mode renamed


class UserRegisterResponse(BaseModel):
    """Response schema for user registration."""
    message: str
    user: UserResponse


class UserLoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }


class UserLoginResponse(BaseModel):
    """Response schema for user login."""
    message: str
    user: UserResponse

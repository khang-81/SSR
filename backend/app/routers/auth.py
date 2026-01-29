"""
Authentication endpoints: register, login, etc.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.user import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserLoginRequest,
    UserLoginResponse,
    UserResponse
)
from app.services.auth_service import create_user, authenticate_user

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)


@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. Role can be BUYER or SELLER."
)
async def register(
    user_data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: User email (must be unique)
    - **password**: User password (min 6 characters)
    - **role**: User role (BUYER or SELLER, default: BUYER)
    
    Returns created user information (without password).
    """
    user = await create_user(db, user_data)
    
    return UserRegisterResponse(
        message="User registered successfully",
        user=UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        )
    )


@router.post(
    "/login",
    response_model=UserLoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticate user and set JWT token in HttpOnly cookie."
)
async def login(
    user_data: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Login user with email and password.
    
    - **email**: User email
    - **password**: User password
    
    On success, sets JWT token in HttpOnly cookie and returns user information.
    """
    # Authenticate user
    user = await authenticate_user(db, user_data.email, user_data.password)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value
        },
        expires_delta=access_token_expires
    )
    
    # Set token in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
        httponly=True,  # HttpOnly: JavaScript cannot access
        secure=settings.cookie_secure,  # Secure in production (HTTPS only)
        samesite=settings.cookie_samesite,  # CSRF protection
        path="/"
    )
    
    return UserLoginResponse(
        message="Login successful",
        user=UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        )
    )

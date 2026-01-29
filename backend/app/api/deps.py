"""
FastAPI dependencies for authentication and authorization.
"""
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.services.auth_service import get_user_by_email


async def get_current_user(
    access_token: str | None = Cookie(None, alias="access_token"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token in cookie.
    
    Args:
        access_token: JWT token from HttpOnly cookie
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: If token is missing, invalid, or user not found
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = decode_token(access_token)
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user = await get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_current_seller(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get current authenticated seller.
    Only users with role SELLER can access seller endpoints.
    
    Args:
        current_user: Current authenticated user from get_current_user
        
    Returns:
        Current authenticated seller
        
    Raises:
        HTTPException: If user is not a seller
    """
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can perform this action"
        )
    
    return current_user

"""
Authentication service: user registration and authentication logic.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.user import UserRegisterRequest
from app.core.security import hash_password, verify_password


async def create_user(
    db: AsyncSession,
    user_data: UserRegisterRequest
) -> User:
    """
    Create a new user.
    
    Args:
        db: Database session
        user_data: User registration data
        
    Returns:
        Created user object
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


async def get_user_by_email(
    db: AsyncSession,
    email: str
) -> User | None:
    """
    Get user by email.
    
    Args:
        db: Database session
        email: User email
        
    Returns:
        User object or None if not found
    """
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str
) -> User:
    """
    Authenticate user by email and password.
    
    Args:
        db: Database session
        email: User email
        password: Plain text password
        
    Returns:
        User object if authentication successful
        
    Raises:
        HTTPException: If email not found or password incorrect
    """
    user = await get_user_by_email(db, email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    return user

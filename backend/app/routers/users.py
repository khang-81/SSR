"""
User endpoints: get current user, etc.
"""
from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user."
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    
    Requires authentication via JWT token in HttpOnly cookie.
    Returns user information (id, email, role, created_at).
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at
    )

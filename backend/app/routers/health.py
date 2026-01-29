"""
Health check endpoint.
"""
from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
async def health_check():
    """
    Health check endpoint.
    Returns API status and version.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }

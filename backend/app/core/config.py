"""
Application configuration settings.

Uses Pydantic Settings for environment variable management with validation.
All settings can be overridden via environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings can be overridden via environment variables.
    Example: DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
    """
    
    # Application
    APP_NAME: str = "E-Commerce API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_HOSTS: List[str] = ["*"]  # Configure in production
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def cookie_secure(self) -> bool:
        """Use secure cookies in production (HTTPS only)."""
        return self.is_production
    
    @property
    def cookie_samesite(self) -> str:
        """Cookie SameSite attribute for CSRF protection."""
        return "lax" if not self.is_production else "strict"
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()

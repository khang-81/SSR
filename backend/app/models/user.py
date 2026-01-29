"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    BUYER = "BUYER"
    SELLER = "SELLER"


class User(Base):
    """
    User model.
    
    Represents a user in the system (can be Buyer or Seller).
    - Buyer: Can browse products, add to cart, place orders
    - Seller: Can manage products, view orders related to their products
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.BUYER)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship: One seller has many products
    products = relationship("Product", back_populates="seller", lazy="selectin")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

"""
Category model for product categorization.
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    """
    Category model.
    
    Represents a product category (e.g., Electronics, Clothing, Books).
    """
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    
    # Relationship: One category has many products
    products = relationship("Product", back_populates="category", lazy="selectin")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name})>"

"""
Product model for e-commerce products.
"""
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    """
    Product model.
    
    Represents a product in the e-commerce system.
    - Belongs to a Seller (User with role SELLER)
    - Belongs to a Category
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)  # Decimal with 2 decimal places
    stock = Column(Integer, nullable=False, default=0)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    seller = relationship("User", back_populates="products", lazy="selectin")
    category = relationship("Category", back_populates="products", lazy="selectin")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, price={self.price}, seller_id={self.seller_id})>"

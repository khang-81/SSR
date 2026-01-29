"""
Cart model for shopping cart items.
"""
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class CartItem(Base):
    """
    Cart Item model.
    
    Represents an item in a user's shopping cart.
    - Each user has their own cart
    - One cart item = one product with quantity
    - Unique constraint: one user can only have one cart item per product
    """
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Relationships
    user = relationship("User", back_populates="cart_items", lazy="selectin")
    product = relationship("Product", lazy="selectin")
    
    # Unique constraint: one user can only have one cart item per product
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_user_product'),
    )
    
    def __repr__(self):
        return f"<CartItem(id={self.id}, user_id={self.user_id}, product_id={self.product_id}, quantity={self.quantity})>"

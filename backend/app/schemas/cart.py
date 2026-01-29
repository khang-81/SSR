"""
Pydantic schemas for Cart.
"""
from pydantic import BaseModel, Field
from typing import Optional

from app.schemas.product import ProductResponse


class CartItemBase(BaseModel):
    """Base schema for Cart Item."""
    product_id: int = Field(..., description="Product ID")
    quantity: int = Field(..., ge=1, description="Quantity (must be >= 1)")


class CartItemCreate(CartItemBase):
    """Schema for creating a cart item."""
    pass


class CartItemUpdate(BaseModel):
    """Schema for updating a cart item."""
    quantity: int = Field(..., ge=1, description="Quantity (must be >= 1)")


class CartItemResponse(CartItemBase):
    """Response schema for cart item."""
    id: int
    user_id: int
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """Response schema for user's cart."""
    items: list[CartItemResponse]
    total_items: int = Field(..., description="Total number of items in cart")
    
    class Config:
        from_attributes = True

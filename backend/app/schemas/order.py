"""
Pydantic schemas for Order.
"""
from decimal import Decimal
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.models.order import OrderStatus
from app.schemas.product import ProductResponse


class OrderItemResponse(BaseModel):
    """Response schema for order item."""
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: Decimal
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Response schema for order."""
    id: int
    user_id: int
    total_price: Decimal
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: Optional[list[OrderItemResponse]] = None
    
    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Response schema for order list."""
    orders: list[OrderResponse]
    total: int = Field(..., description="Total number of orders")
    
    class Config:
        from_attributes = True

"""
Order endpoints: Create and manage orders.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.order import OrderResponse, OrderListResponse
from app.services.order_service import (
    create_order_from_cart,
    get_user_orders
)

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create order from cart",
    description="Create an order from the current user's cart. Cart will be cleared after order is created."
)
async def create_order(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create order from cart.
    
    Process:
    - Get all items from user's cart
    - Validate stock availability
    - Create order and order items
    - Update product stock
    - Clear cart
    
    Returns created order with all items.
    """
    order = await create_order_from_cart(db, current_user)
    return order


@router.get(
    "",
    response_model=OrderListResponse,
    summary="Get user's orders",
    description="Get all orders for the current user."
)
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's orders.
    
    Returns all orders for the current user, ordered by creation date (newest first).
    """
    orders = await get_user_orders(db, current_user)
    
    return OrderListResponse(
        orders=orders,
        total=len(orders)
    )

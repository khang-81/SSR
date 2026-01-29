"""
Cart endpoints: CRUD operations for shopping cart.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartResponse
)
from app.services.cart_service import (
    get_cart_items,
    add_to_cart,
    update_cart_item,
    remove_from_cart
)

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
)


@router.post(
    "",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add product to cart",
    description="Add a product to cart or update quantity if already exists."
)
async def add_product_to_cart(
    cart_data: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add product to cart.
    
    - **product_id**: Product ID to add
    - **quantity**: Quantity to add (must be >= 1)
    
    If product already exists in cart, quantity will be added.
    Returns cart item information.
    """
    cart_item = await add_to_cart(db, cart_data, current_user)
    return cart_item


@router.get(
    "",
    response_model=CartResponse,
    summary="Get user's cart",
    description="Get all items in the current user's cart."
)
async def get_user_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's cart.
    
    Returns all items in the current user's cart with product details.
    """
    cart_items = await get_cart_items(db, current_user)
    
    return CartResponse(
        items=cart_items,
        total_items=len(cart_items)
    )


@router.put(
    "/{cart_item_id}",
    response_model=CartItemResponse,
    summary="Update cart item quantity",
    description="Update the quantity of a specific cart item."
)
async def update_cart_item_quantity(
    cart_item_id: int,
    cart_data: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update cart item quantity.
    
    - **cart_item_id**: Cart item ID
    - **quantity**: New quantity (must be >= 1)
    
    Only the owner of the cart item can update it.
    Returns updated cart item information.
    """
    cart_item = await update_cart_item(db, cart_item_id, cart_data, current_user)
    return cart_item


@router.delete(
    "/{cart_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove item from cart",
    description="Remove a specific item from the cart."
)
async def remove_item_from_cart(
    cart_item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove item from cart.
    
    - **cart_item_id**: Cart item ID
    
    Only the owner of the cart item can remove it.
    Returns 204 No Content on success.
    """
    await remove_from_cart(db, cart_item_id, current_user)
    return None

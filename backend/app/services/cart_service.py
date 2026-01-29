"""
Cart service: CRUD operations for shopping cart.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate


async def get_cart_items(
    db: AsyncSession,
    user: User
) -> list[CartItem]:
    """
    Get all cart items for a user.
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        List of cart items
    """
    stmt = select(CartItem).where(CartItem.user_id == user.id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_cart_item_by_id(
    db: AsyncSession,
    cart_item_id: int,
    user: User
) -> CartItem:
    """
    Get cart item by ID (only if it belongs to the user).
    
    Args:
        db: Database session
        cart_item_id: Cart item ID
        user: User object
        
    Returns:
        Cart item object
        
    Raises:
        HTTPException: If cart item not found or doesn't belong to user
    """
    stmt = select(CartItem).where(
        CartItem.id == cart_item_id,
        CartItem.user_id == user.id
    )
    result = await db.execute(stmt)
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    return cart_item


async def add_to_cart(
    db: AsyncSession,
    cart_data: CartItemCreate,
    user: User
) -> CartItem:
    """
    Add product to cart or update quantity if already exists.
    
    Args:
        db: Database session
        cart_data: Cart item data
        user: User object
        
    Returns:
        Cart item object
        
    Raises:
        HTTPException: If product not found or stock insufficient
    """
    # Verify product exists
    stmt = select(Product).where(Product.id == cart_data.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check stock availability
    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock}"
        )
    
    # Check if item already exists in cart
    stmt = select(CartItem).where(
        CartItem.user_id == user.id,
        CartItem.product_id == cart_data.product_id
    )
    result = await db.execute(stmt)
    existing_item = result.scalar_one_or_none()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += cart_data.quantity
        
        # Check total quantity doesn't exceed stock
        if existing_item.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {product.stock}, Requested: {existing_item.quantity}"
            )
        
        await db.commit()
        await db.refresh(existing_item)
        return existing_item
    else:
        # Create new cart item
        new_cart_item = CartItem(
            user_id=user.id,
            product_id=cart_data.product_id,
            quantity=cart_data.quantity
        )
        
        db.add(new_cart_item)
        await db.commit()
        await db.refresh(new_cart_item)
        return new_cart_item


async def update_cart_item(
    db: AsyncSession,
    cart_item_id: int,
    cart_data: CartItemUpdate,
    user: User
) -> CartItem:
    """
    Update cart item quantity.
    
    Args:
        db: Database session
        cart_item_id: Cart item ID
        cart_data: Cart item update data
        user: User object
        
    Returns:
        Updated cart item object
        
    Raises:
        HTTPException: If cart item not found, doesn't belong to user, or stock insufficient
    """
    # Get cart item
    cart_item = await get_cart_item_by_id(db, cart_item_id, user)
    
    # Get product to check stock
    stmt = select(Product).where(Product.id == cart_item.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check stock availability
    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock}"
        )
    
    # Update quantity
    cart_item.quantity = cart_data.quantity
    
    await db.commit()
    await db.refresh(cart_item)
    
    return cart_item


async def remove_from_cart(
    db: AsyncSession,
    cart_item_id: int,
    user: User
) -> None:
    """
    Remove item from cart.
    
    Args:
        db: Database session
        cart_item_id: Cart item ID
        user: User object
        
    Raises:
        HTTPException: If cart item not found or doesn't belong to user
    """
    # Get cart item
    cart_item = await get_cart_item_by_id(db, cart_item_id, user)
    
    await db.delete(cart_item)
    await db.commit()

"""
Order service: Create and manage orders.
"""
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User


async def create_order_from_cart(
    db: AsyncSession,
    user: User
) -> Order:
    """
    Create order from user's cart.
    
    Process:
    1. Get all cart items
    2. Validate cart is not empty
    3. Check stock availability for all products
    4. Create order and order items (transaction)
    5. Update product stock
    6. Delete cart items
    7. Commit transaction
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        Created order object
        
    Raises:
        HTTPException: If cart is empty, product not found, or stock insufficient
    """
    # Get all cart items
    stmt = select(CartItem).where(CartItem.user_id == user.id)
    result = await db.execute(stmt)
    cart_items = result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Validate stock and calculate total price
    total_price = Decimal("0")
    order_items_data = []
    
    for cart_item in cart_items:
        # Get product
        stmt = select(Product).where(Product.id == cart_item.product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {cart_item.product_id} not found"
            )
        
        # Check stock
        if cart_item.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.stock}, Requested: {cart_item.quantity}"
            )
        
        # Calculate item total
        item_total = Decimal(str(product.price)) * cart_item.quantity
        total_price += item_total
        
        # Store order item data
        order_items_data.append({
            "product": product,
            "cart_item": cart_item,
            "quantity": cart_item.quantity,
            "price": product.price
        })
    
    # Create order and order items in transaction
    try:
        # Create order
        new_order = Order(
            user_id=user.id,
            total_price=total_price,
            status=OrderStatus.PENDING
        )
        db.add(new_order)
        await db.flush()  # Flush to get order.id
        
        # Create order items and update stock
        for item_data in order_items_data:
            # Create order item
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                price=item_data["price"]
            )
            db.add(order_item)
            
            # Update product stock
            item_data["product"].stock -= item_data["quantity"]
        
        # Delete cart items
        for cart_item in cart_items:
            await db.delete(cart_item)
        
        # Commit transaction
        await db.commit()
        await db.refresh(new_order)
        
        return new_order
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


async def get_user_orders(
    db: AsyncSession,
    user: User
) -> list[Order]:
    """
    Get all orders for a user.
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        List of orders
    """
    stmt = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_order_by_id(
    db: AsyncSession,
    order_id: int,
    user: User
) -> Order:
    """
    Get order by ID (only if it belongs to the user).
    
    Args:
        db: Database session
        order_id: Order ID
        user: User object
        
    Returns:
        Order object
        
    Raises:
        HTTPException: If order not found or doesn't belong to user
    """
    stmt = select(Order).where(
        Order.id == order_id,
        Order.user_id == user.id
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

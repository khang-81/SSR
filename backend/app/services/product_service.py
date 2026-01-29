"""
Product service: CRUD operations for products.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from decimal import Decimal

from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    keyword: str | None = None,
    category_id: int | None = None
) -> tuple[list[Product], int]:
    """
    Get list of products with search, filter, and pagination.
    
    Args:
        db: Database session
        page: Page number (1-based)
        limit: Maximum number of records to return
        keyword: Search keyword for product name (case-insensitive)
        category_id: Optional category filter
        
    Returns:
        Tuple of (list of products, total count)
    """
    # Base query
    stmt = select(Product)
    count_stmt = select(func.count()).select_from(Product)
    
    # Apply filters
    conditions = []
    
    if keyword:
        # Case-insensitive search in product name
        conditions.append(Product.name.ilike(f"%{keyword}%"))
    
    if category_id:
        conditions.append(Product.category_id == category_id)
    
    # Apply conditions to both queries
    if conditions:
        for condition in conditions:
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)
    
    # Get total count
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    skip = (page - 1) * limit
    stmt = stmt.order_by(Product.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(stmt)
    products = result.scalars().all()
    
    return products, total


async def get_product_by_id(
    db: AsyncSession,
    product_id: int
) -> Product:
    """
    Get product by ID.
    
    Args:
        db: Database session
        product_id: Product ID
        
    Returns:
        Product object
        
    Raises:
        HTTPException: If product not found
    """
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


async def create_product(
    db: AsyncSession,
    product_data: ProductCreate,
    seller: User
) -> Product:
    """
    Create a new product.
    
    Args:
        db: Database session
        product_data: Product creation data
        seller: Seller user (must be SELLER role)
        
    Returns:
        Created product object
        
    Raises:
        HTTPException: If category not found
    """
    # Verify category exists
    stmt = select(Category).where(Category.id == product_data.category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Create product
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        seller_id=seller.id,
        category_id=product_data.category_id
    )
    
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    return new_product


async def update_product(
    db: AsyncSession,
    product_id: int,
    product_data: ProductUpdate,
    seller: User
) -> Product:
    """
    Update a product (only by its seller).
    
    Args:
        db: Database session
        product_id: Product ID
        product_data: Product update data
        seller: Seller user (must be owner of product)
        
    Returns:
        Updated product object
        
    Raises:
        HTTPException: If product not found or seller is not owner
    """
    # Get product
    product = await get_product_by_id(db, product_id)
    
    # Verify seller owns this product
    if product.seller_id != seller.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own products"
        )
    
    # Update fields
    update_data = product_data.model_dump(exclude_unset=True)
    
    if "category_id" in update_data:
        # Verify category exists
        stmt = select(Category).where(Category.id == update_data["category_id"])
        result = await db.execute(stmt)
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return product


async def delete_product(
    db: AsyncSession,
    product_id: int,
    seller: User
) -> None:
    """
    Delete a product (only by its seller).
    
    Args:
        db: Database session
        product_id: Product ID
        seller: Seller user (must be owner of product)
        
    Raises:
        HTTPException: If product not found or seller is not owner
    """
    # Get product
    product = await get_product_by_id(db, product_id)
    
    # Verify seller owns this product
    if product.seller_id != seller.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products"
        )
    
    await db.delete(product)
    await db.commit()

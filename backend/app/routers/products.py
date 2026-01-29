"""
Product endpoints: CRUD operations for products.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_seller
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse
)
from app.services.product_service import (
    get_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product
)

router = APIRouter(
    prefix="/products",
    tags=["products"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
    summary="Get list of products",
    description="Get paginated list of products. Optional category filter."
)
async def list_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of products.
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records (1-100)
    - **category_id**: Optional category filter
    
    Returns paginated list of products.
    """
    products = await get_products(db, skip=skip, limit=limit, category_id=category_id)
    return products


@router.get(
    "/{product_id}",
    response_model=ProductDetailResponse,
    summary="Get product by ID",
    description="Get detailed information about a specific product."
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product by ID.
    
    - **product_id**: Product ID
    
    Returns detailed product information including seller and category.
    """
    product = await get_product_by_id(db, product_id)
    return product


@router.post(
    "",
    response_model=ProductDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product. Only sellers can create products."
)
async def create_new_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    seller: User = Depends(get_current_seller)
):
    """
    Create a new product.
    
    - **name**: Product name
    - **description**: Product description (optional)
    - **price**: Product price (must be > 0)
    - **stock**: Stock quantity (must be >= 0)
    - **category_id**: Category ID
    
    Only sellers can create products.
    Returns created product information.
    """
    product = await create_product(db, product_data, seller)
    return product


@router.put(
    "/{product_id}",
    response_model=ProductDetailResponse,
    summary="Update a product",
    description="Update a product. Only the seller who owns the product can update it."
)
async def update_existing_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    seller: User = Depends(get_current_seller)
):
    """
    Update a product.
    
    - **product_id**: Product ID
    - **name**: Product name (optional)
    - **description**: Product description (optional)
    - **price**: Product price (optional, must be > 0)
    - **stock**: Stock quantity (optional, must be >= 0)
    - **category_id**: Category ID (optional)
    
    Only the seller who owns the product can update it.
    Returns updated product information.
    """
    product = await update_product(db, product_id, product_data, seller)
    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Delete a product. Only the seller who owns the product can delete it."
)
async def delete_existing_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    seller: User = Depends(get_current_seller)
):
    """
    Delete a product.
    
    - **product_id**: Product ID
    
    Only the seller who owns the product can delete it.
    Returns 204 No Content on success.
    """
    await delete_product(db, product_id, seller)
    return None

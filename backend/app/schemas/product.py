"""
Pydantic schemas for Product.
"""
from decimal import Decimal
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.schemas.category import CategoryResponse
from app.schemas.user import UserResponse


class ProductBase(BaseModel):
    """Base schema for Product."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=2000, description="Product description")
    price: Decimal = Field(..., gt=0, description="Product price (must be > 0)")
    stock: int = Field(..., ge=0, description="Product stock quantity (must be >= 0)")
    category_id: int = Field(..., description="Category ID")


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    price: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    """Response schema for product."""
    id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True


class ProductDetailResponse(ProductResponse):
    """Detailed response schema for product (includes seller info)."""
    seller: Optional[UserResponse] = None


class ProductListResponse(BaseModel):
    """Response schema for paginated product list."""
    products: list[ProductResponse]
    total: int = Field(..., description="Total number of products")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
    
    class Config:
        from_attributes = True

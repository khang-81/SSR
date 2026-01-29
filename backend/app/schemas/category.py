"""
Pydantic schemas for Category.
"""
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base schema for Category."""
    name: str = Field(..., min_length=1, max_length=255, description="Category name")


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


class CategoryResponse(CategoryBase):
    """Response schema for category."""
    id: int
    
    class Config:
        from_attributes = True

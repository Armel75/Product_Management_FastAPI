from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.category import CategoryOut

class ProductBase(BaseModel):
    name: str = Field(..., max_length=150)
    description: str | None = None
    price: Decimal = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    category_id: int | None = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, max_length=150)
    description: str | None = None
    price: Decimal | None = Field(None, gt=0)
    stock_quantity: int | None = Field(None, ge=0)
    category_id: int | None = None

class ProductOut(ProductBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None

    model_config = ConfigDict(from_attributes=True)

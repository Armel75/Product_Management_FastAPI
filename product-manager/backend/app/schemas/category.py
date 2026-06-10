from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

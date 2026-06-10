from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class UserBase(BaseModel):
    email: str = Field(..., max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

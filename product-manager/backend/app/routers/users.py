from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut
from app.models.user import User
from app.routers.auth import get_current_user
from app.services import auth_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{id}", response_model=UserOut)
def get_user(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = auth_service.get_user_by_id(db, user_id=id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

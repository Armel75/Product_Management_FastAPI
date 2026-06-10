from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.category import CategoryCreate, CategoryOut
from app.routers.auth import get_current_user
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])

# --- Category Routes ---
@router.get("/categories", response_model=list[CategoryOut])
def list_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.get_categories(db, skip=skip, limit=limit)

@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_category = product_service.get_category_by_name(db, name=category_in.name)
    if db_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    return product_service.create_category(db, category_in=category_in)

# --- Product Routes ---
@router.get("", response_model=list[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.get_products(db, skip=skip, limit=limit)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if product_in.category_id is not None:
        category = product_service.get_category_by_id(db, category_id=product_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
            
    return product_service.create_product(db, product_in=product_in, user_id=current_user.id)

@router.get("/{id}", response_model=ProductOut)
def read_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = product_service.get_product_by_id(db, product_id=id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.put("/{id}", response_model=ProductOut)
def update_product(
    id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = product_service.get_product_by_id(db, product_id=id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    if product_in.category_id is not None:
        category = product_service.get_category_by_id(db, category_id=product_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
            
    return product_service.update_product(db, db_product=db_product, product_in=product_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = product_service.get_product_by_id(db, product_id=id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product_service.delete_product(db, db_product=db_product)
    return None

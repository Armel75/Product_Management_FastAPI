from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.category import CategoryCreate

# --- Category CRUD ---
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()

def get_category_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_name(db: Session, name: str) -> Category | None:
    return db.query(Category).filter(Category.name == name).first()

def create_category(db: Session, category_in: CategoryCreate) -> Category:
    db_category = Category(
        name=category_in.name,
        description=category_in.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# --- Product CRUD ---
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product_in: ProductCreate, user_id: int) -> Product:
    db_product = Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity,
        category_id=product_in.category_id,
        created_by=user_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: Product, product_in: ProductUpdate) -> Product:
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, db_product: Product) -> None:
    db.delete(db_product)
    db.commit()

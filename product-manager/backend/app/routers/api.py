from fastapi import APIRouter

from app.routers import auth, products, users

router = APIRouter(prefix="/api", tags=["api"])

# Expose existing routers under /api/*
router.include_router(auth.router)     # -> /api/auth/*
router.include_router(users.router)    # -> /api/users/*
router.include_router(products.router) # -> /api/products/*

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, users, products
from app.database import engine, Base

# Attempt auto database table creation for seamless local execution
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database tables could not be pre-created on startup: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="A secure enterprise Product Manager full-stack API"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to point specifically to requirements
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "documentation": "/docs"
    }

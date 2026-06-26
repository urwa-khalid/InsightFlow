from fastapi import APIRouter
from app.api.v1 import auth, query, datasets

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])

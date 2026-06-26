import time
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import InsightFlowException
from app.api.v1 import api_router
from app.core.database import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware integration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Request Correlation ID and latency tracker middleware
@app.middleware("http")
async def correlation_and_time_tracker_middleware(request: Request, call_next):
    # Retrieve X-Correlation-ID header if sent, else generate a new UUID
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    
    # Store correlation_id in request state context
    request.state.correlation_id = correlation_id
    
    start_time = time.time()
    response: Response = await call_next(request)
    duration = time.time() - start_time
    
    # Inject headers in response metadata
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Process-Time"] = f"{duration:.4f}s"
    return response

# Custom exception handler mapping
@app.exception_handler(InsightFlowException)
async def insightflow_exception_handler(request: Request, exc: InsightFlowException):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
            "correlation_id": correlation_id
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please contact system administrators.",
            "correlation_id": correlation_id
        }
    )

# App startup hooks (mostly for dev/local table creations)
@app.on_event("startup")
async def on_startup():
    if settings.ENV == "development":
        await init_db()

# Register routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "InsightFlow API Gateway is online"}

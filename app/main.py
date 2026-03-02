from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import time
from app.api import routes, auth_routes
from app.database import connect_to_mongodb, close_mongodb_connection
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle - connect/disconnect from MongoDB"""
    logger.info("Starting up TruthLens API...")
    await connect_to_mongodb()
    logger.info("MongoDB connected. API is ready.")
    yield
    logger.info("Shutting down TruthLens API...")
    await close_mongodb_connection()
    logger.info("MongoDB disconnected. Goodbye.")


app = FastAPI(
    title="Fake News Detection API",
    description="API for detecting fake news using fine-tuned BERT model with user authentication",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS – reads ALLOWED_ORIGINS from env (comma-separated) for production
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:80,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
)
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request/response logging middleware ──────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info(
        "%s %s | status=%d | %.1fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# Include API routes
app.include_router(auth_routes.router, prefix="/api", tags=["authentication"])
app.include_router(routes.router, prefix="/api", tags=["predictions"])

@app.get("/")
async def root():
    return {
        "message": "Fake News Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

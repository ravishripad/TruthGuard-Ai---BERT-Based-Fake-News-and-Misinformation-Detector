from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

# Configure CORS - update origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React dev server
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"                           # Remove in production
    ],
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

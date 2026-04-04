import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine
from app.core.redis import close_redis
from app.models.url import User, URL, Click
from app.core.database import Base
from app.routers import auth_router, urls_router, redirect_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Skip migrations for memory efficiency - tables will be created automatically
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    yield

    await close_redis()
    logger.info("Shutdown complete")

app = FastAPI(
    title="SnipURL",
    description="Lightweight URL shortener optimized for low memory",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(urls_router)
app.include_router(redirect_router)

@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "version": app.version}

@app.get("/", tags=["meta"])
async def root():
    return {
        "name": "SnipURL",
        "version": app.version,
        "docs": "/docs",
    }

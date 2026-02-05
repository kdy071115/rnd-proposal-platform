"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.services.init_data import init_rd_data
from app.core.database import SessionLocal
from app.api.v1 import auth, companies, documents, team, generate, recommendations

# Create FastAPI app
app = FastAPI(title="R&D SaaS Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
def startup():
    """Initialize database and sample data on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_rd_data(db)
    db.close()


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(team.router, prefix="/team", tags=["team"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])


# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "R&D SaaS Platform API is running"}

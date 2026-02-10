"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.services.data_sync import init_rd_notices_if_empty
from app.api.v1 import auth, companies, documents, team, generate, recommendations, users

# Create FastAPI app
app = FastAPI(title="R&D SaaS Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Startup event
@app.on_event("startup")
def startup():
    """Initialize database and R&D notices on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_rd_notices_if_empty(db)
    db.close()


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(team.router, prefix="/team", tags=["team"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(users.router, prefix="/users", tags=["users"])
from app.api.v1 import websocket
app.include_router(websocket.router, tags=["websocket"])


# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "R&D SaaS Platform API is running"}

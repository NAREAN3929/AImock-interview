import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.routers import (
    auth, 
    interview, 
    resume, 
    admin, 
    roadmap, 
    onboarding, 
    websocket, 
    code, 
    tpo, 
    p2p_ws
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready API server for AI Mock Interview Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(interview.router, prefix=settings.API_V1_STR)
app.include_router(resume.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router, prefix=settings.API_V1_STR)
app.include_router(code.router, prefix=settings.API_V1_STR)
app.include_router(tpo.router, prefix=settings.API_V1_STR)
app.include_router(p2p_ws.router, prefix=settings.API_V1_STR)

@app.get("/")

def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/v1/health")
def health():
    try:
        from app.services.gemini_service import GeminiService
        s = GeminiService()
        gemini_status = s.get_status()
    except Exception as e:
        gemini_status = {"configured": False, "status": "offline", "error": str(e)}
    return {
        "status": "healthy",
        "gemini": gemini_status
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

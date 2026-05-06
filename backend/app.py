import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routes.auth import router as auth_router
from routes.interview import router as interview_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI Interview Simulator",
    description="AI-powered interview practice platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Build CORS origins from env (comma-separated) + local dev defaults
cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
allowed_origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(interview_router, prefix="/api/interview", tags=["Interview"])


@app.get("/")
async def root():
    return {"message": "AI Interview Simulator API", "status": "running"}

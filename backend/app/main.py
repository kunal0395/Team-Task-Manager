from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_client
from app.routers import auth, projects, tasks, dashboard
from app.utils.seed_admin import seed_admin

app = FastAPI(title="Team Task Manager API")

print("Allowed CORS origins:", settings.CLIENT_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CLIENT_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/favicon.ico")
async def favicon():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await seed_admin()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_client()

@app.get("/")
async def root():
    return {"message": "API running"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

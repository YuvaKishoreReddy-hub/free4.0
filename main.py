import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .seed_data import seed_database
from .routers import (
    auth, dashboard, fitness, activities, tasks, habits,
    quests, player, alya, calendar, focus, learning,
    sleep, community, notifications
)

app = FastAPI(
    title="ASCEND 4.0 — The Ultimate Personal Evolution System",
    description="Your Life. Your Evolution. Featuring ALYA (Advanced Life Assistant).",
    version="4.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database tables and initial seed data
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

# Include API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(fitness.router)
app.include_router(activities.router)
app.include_router(tasks.router)
app.include_router(habits.router)
app.include_router(quests.router)
app.include_router(player.router)
app.include_router(alya.router)
app.include_router(calendar.router)
app.include_router(focus.router)
app.include_router(learning.router)
app.include_router(sleep.router)
app.include_router(community.router)
app.include_router(notifications.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "ASCEND 4.0",
        "companion": "ALYA (Advanced Life Assistant)",
        "protocol": "Quantum Evolution Online"
    }

# Mount static frontend directory
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import random
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title="VIDYA OS 2.0 API",
    description="Sovereign Multi-Agent Campus Intelligence — Bharat-First, Global Standard",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Vercel frontend and local dev
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.FRONTEND_URL == "*" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket for Campus Intelligence
@app.websocket("/ws/campus")
async def websocket_campus(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send mock live updates
            data = {
                "kpis": {
                    "total_footfall": random.randint(1200, 5000),
                    "total_energy_kwh": random.randint(300, 600),
                    "active_spaces": random.randint(4, 8),
                    "air_quality_aqi": random.randint(20, 110)
                },
                "buildings": [
                    {"id": "lib-1", "name": "Main Library", "occupancy": random.randint(10, 95)},
                    {"id": "lab-2", "name": "AI Lab", "occupancy": random.randint(10, 95)},
                    {"id": "caf-3", "name": "Student Cafe", "occupancy": random.randint(10, 95)},
                    {"id": "gym-4", "name": "Tech Gym", "occupancy": random.randint(10, 95)},
                    {"id": "aud-5", "name": "Grand Hall", "occupancy": random.randint(10, 95)},
                    {"id": "res-6", "name": "Hostel A", "occupancy": random.randint(10, 95)},
                    {"id": "res-7", "name": "Hostel B", "occupancy": random.randint(10, 95)},
                    {"id": "fac-8", "name": "Faculty Block", "occupancy": random.randint(10, 95)}
                ],
                "alerts": [
                    {"severity": "warning", "location": "Tech Gym", "time": "Just now", "message": "Energy spike detected!"}
                ] if random.random() > 0.9 else []
            }
            await websocket.send_json(data)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "VIDYA OS 2.0 Sovereign AI Engine Online",
        "model": settings.HF_MODEL_ID,
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "engine": "HuggingFace Inference API",
        "model": settings.HF_MODEL_ID,
        "version": "2.0.0"
    }

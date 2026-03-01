from fastapi import APIRouter
import random
from datetime import datetime

router = APIRouter()

@router.get("/metrics")
async def get_metrics():
    return {
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
            {"severity": "warning", "location": "Tech Gym", "time": "2 mins ago", "message": "Unusual energy spike detected in cooling system."}
        ] if random.random() > 0.7 else []
    }

@router.get("/history")
async def get_history():
    return {
        "history": [
            {"hour": f"{h}:00", "energy": random.randint(20, 60), "footfall": random.randint(100, 800)}
            for h in range(24)
        ]
    }

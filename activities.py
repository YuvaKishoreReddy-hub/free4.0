import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Activity
from ..schemas import ActivityCreate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/activities", tags=["Activities & GPS"])

@router.post("")
def record_activity(
    req: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate XP reward based on distance and duration
    xp_to_award = int(req.distance_km * 50) + int(req.duration_seconds / 60 * 2)
    xp_to_award = max(50, xp_to_award)

    activity = Activity(
        user_id=current_user.id,
        activity_type=req.activity_type.lower(),
        distance_km=req.distance_km,
        duration_seconds=req.duration_seconds,
        pace_min_per_km=req.pace_min_per_km,
        speed_kmh=req.speed_kmh,
        calories=req.calories,
        elevation_m=req.elevation_m or 0.0,
        route_coords_json=req.route_coords_json or "[]",
        is_simulation=req.is_simulation or False,
        notes=req.notes or ""
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    # Award XP and Agility attribute boosts
    xp_result = add_xp(current_user, xp_to_award, req.activity_type.lower(), db, credits_amount=40)
    check_achievements(current_user, db)

    return {
        "status": "success",
        "activity_id": activity.id,
        "xp_earned": xp_to_award,
        "gamification": xp_result
    }

@router.get("")
def list_activities(
    activity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(Activity.user_id == current_user.id)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type.lower())
    
    activities = query.order_by(Activity.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "type": a.activity_type,
            "distance_km": a.distance_km,
            "duration_seconds": a.duration_seconds,
            "pace_min_per_km": a.pace_min_per_km,
            "speed_kmh": a.speed_kmh,
            "calories": a.calories,
            "elevation_m": a.elevation_m,
            "route_coords": json.loads(a.route_coords_json) if a.route_coords_json else [],
            "is_simulation": a.is_simulation,
            "notes": a.notes,
            "created_at": a.created_at.isoformat()
        }
        for a in activities
    ]

@router.get("/records")
def get_personal_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acts = db.query(Activity).filter(Activity.user_id == current_user.id).all()
    
    records = {
        "running": {"longest_distance_km": 0.0, "fastest_pace": 0.0, "total_km": 0.0},
        "walking": {"longest_distance_km": 0.0, "total_km": 0.0},
        "cycling": {"longest_distance_km": 0.0, "max_speed_kmh": 0.0, "total_km": 0.0}
    }

    for a in acts:
        t = a.activity_type
        if t in records:
            records[t]["total_km"] = round(records[t]["total_km"] + a.distance_km, 2)
            if a.distance_km > records[t]["longest_distance_km"]:
                records[t]["longest_distance_km"] = a.distance_km
            if t == "running" and (records["running"]["fastest_pace"] == 0 or a.pace_min_per_km < records["running"]["fastest_pace"]):
                records["running"]["fastest_pace"] = a.pace_min_per_km
            if t == "cycling" and a.speed_kmh > records["cycling"]["max_speed_kmh"]:
                records["cycling"]["max_speed_kmh"] = a.speed_kmh

    return records

@router.get("/{activity_id}/export-gpx")
def export_gpx(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    coords = json.loads(a.route_coords_json) if a.route_coords_json else []
    trkpts = ""
    for pt in coords:
        lat = pt.get("lat", 0.0)
        lng = pt.get("lng", 0.0)
        trkpts += f'<trkpt lat="{lat}" lon="{lng}"></trkpt>\n'
        
    gpx_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ASCEND 4.0 Personal Evolution System">
  <metadata>
    <name>ASCEND {a.activity_type.title()} Session</name>
    <time>{a.created_at.isoformat()}Z</time>
  </metadata>
  <trk>
    <name>{a.activity_type.title()} - {a.distance_km} km</name>
    <trkseg>
      {trkpts}
    </trkseg>
  </trk>
</gpx>"""
    return Response(content=gpx_xml, media_type="application/gpx+xml", headers={
        "Content-Disposition": f"attachment; filename=ascend_{a.activity_type}_{a.id}.gpx"
    })

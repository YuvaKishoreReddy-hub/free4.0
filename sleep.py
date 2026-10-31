from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, SleepRecord
from ..schemas import SleepRecordCreate
from ..auth import get_current_user

router = APIRouter(prefix="/api/sleep", tags=["Sleep & Recovery"])

@router.get("/records")
def list_sleep_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(SleepRecord).filter(SleepRecord.user_id == current_user.id).order_by(SleepRecord.date.desc()).all()
    avg_sleep = round(sum(r.sleep_hours for r in records) / len(records), 1) if records else 7.5
    avg_recovery = int(sum(r.recovery_score for r in records) / len(records)) if records else 88

    return {
        "summary": {
            "average_sleep_hours": avg_sleep,
            "average_recovery_score": avg_recovery,
            "disclaimer": "Wellness indices are self-reported personal optimization metrics and do not constitute clinical or medical diagnosis."
        },
        "history": [
            {
                "id": r.id,
                "date": r.date,
                "sleep_hours": r.sleep_hours,
                "sleep_quality": r.sleep_quality,
                "resting_heart_rate": r.resting_heart_rate,
                "recovery_score": r.recovery_score,
                "mood": r.mood,
                "energy_level": r.energy_level,
                "notes": r.notes
            }
            for r in records
        ]
    }

@router.post("/records")
def record_sleep(req: SleepRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(SleepRecord).filter(SleepRecord.user_id == current_user.id, SleepRecord.date == req.date).first()
    if existing:
        existing.sleep_hours = req.sleep_hours
        existing.sleep_quality = req.sleep_quality
        existing.resting_heart_rate = req.resting_heart_rate
        existing.recovery_score = req.recovery_score
        existing.mood = req.mood
        existing.energy_level = req.energy_level
        existing.notes = req.notes
        db.commit()
        return {"status": "updated", "record_id": existing.id}

    rec = SleepRecord(
        user_id=current_user.id,
        date=req.date,
        sleep_hours=req.sleep_hours,
        sleep_quality=req.sleep_quality,
        resting_heart_rate=req.resting_heart_rate,
        recovery_score=req.recovery_score,
        mood=req.mood or "Energetic",
        energy_level=req.energy_level or 8,
        notes=req.notes or ""
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"status": "success", "record_id": rec.id}

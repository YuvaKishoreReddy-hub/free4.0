from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LearningRecord
from ..schemas import LearningRecordCreate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/learning", tags=["Learning Tracker"])

@router.get("/records")
def list_learning_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(LearningRecord).filter(LearningRecord.user_id == current_user.id).order_by(LearningRecord.created_at.desc()).all()
    total_hours = sum(r.hours_spent for r in records)
    subjects_map = {}
    for r in records:
        subjects_map[r.subject] = subjects_map.get(r.subject, 0.0) + r.hours_spent

    return {
        "total_study_hours": round(total_hours, 2),
        "subjects": subjects_map,
        "history": [
            {
                "id": r.id,
                "subject": r.subject,
                "topic": r.topic,
                "hours_spent": r.hours_spent,
                "notes": r.notes,
                "milestone_completed": r.milestone_completed,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]
    }

@router.post("/records")
def record_learning(req: LearningRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = LearningRecord(
        user_id=current_user.id,
        subject=req.subject,
        topic=req.topic or "",
        hours_spent=req.hours_spent,
        notes=req.notes or "",
        milestone_completed=req.milestone_completed or False
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    xp_reward = int(req.hours_spent * 80)
    xp_result = add_xp(current_user, xp_reward, "learning", db, credits_amount=25)
    check_achievements(current_user, db)

    return {"status": "success", "record_id": rec.id, "gamification": xp_result}

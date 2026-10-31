from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, FocusSession
from ..schemas import FocusSessionCreate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/focus", tags=["Focus Mode"])

@router.get("/sessions")
def list_focus_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(FocusSession).filter(FocusSession.user_id == current_user.id).order_by(FocusSession.created_at.desc()).all()
    total_minutes = sum(s.duration_minutes for s in sessions if s.completed)
    return {
        "total_focus_minutes": total_minutes,
        "completed_sessions": len(sessions),
        "history": [
            {
                "id": s.id,
                "mode": s.mode,
                "duration_minutes": s.duration_minutes,
                "completed": s.completed,
                "notes": s.notes,
                "created_at": s.created_at.isoformat()
            }
            for s in sessions
        ]
    }

@router.post("/sessions")
def record_focus_session(req: FocusSessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sess = FocusSession(
        user_id=current_user.id,
        mode=req.mode or "pomodoro",
        duration_minutes=req.duration_minutes,
        completed=req.completed if req.completed is not None else True,
        notes=req.notes or ""
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)

    xp_reward = req.duration_minutes * 3
    xp_result = add_xp(current_user, xp_reward, "focus", db, credits_amount=15)
    check_achievements(current_user, db)

    return {"status": "success", "session_id": sess.id, "gamification": xp_result}

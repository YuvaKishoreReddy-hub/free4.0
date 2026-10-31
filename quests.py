from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Quest
from ..schemas import QuestCreate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/quests", tags=["Quests & Missions"])

@router.get("")
def list_quests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quests = db.query(Quest).filter(Quest.user_id == current_user.id).all()
    daily = [q for q in quests if not q.is_weekly]
    weekly = [q for q in quests if q.is_weekly]
    
    def quest_dict(q: Quest):
        return {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "category": q.category,
            "difficulty": q.difficulty,
            "progress": q.progress,
            "target": q.target,
            "unit": q.unit,
            "xp_reward": q.xp_reward,
            "credits_reward": q.credits_reward,
            "is_completed": q.is_completed,
            "is_weekly": q.is_weekly
        }

    return {
        "daily": [quest_dict(q) for q in daily],
        "weekly": [quest_dict(q) for q in weekly]
    }

@router.post("")
def create_quest(req: QuestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quest = Quest(
        user_id=current_user.id,
        title=req.title,
        description=req.description or "",
        category=req.category or "Custom",
        difficulty=req.difficulty or "Normal",
        progress=0,
        target=req.target or 1,
        unit=req.unit or "times",
        xp_reward=req.xp_reward or 150,
        credits_reward=req.credits_reward or 50,
        is_weekly=req.is_weekly or False
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return {"status": "success", "quest_id": quest.id}

@router.post("/{quest_id}/progress")
def increment_quest_progress(quest_id: int, step: int = 1, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    if quest.is_completed:
        return {"status": "already_completed", "progress": quest.progress}

    quest.progress = min(quest.target, quest.progress + step)
    if quest.progress >= quest.target:
        quest.is_completed = True
        xp_result = add_xp(current_user, quest.xp_reward, quest.category.lower(), db, credits_amount=quest.credits_reward)
        check_achievements(current_user, db)
        db.commit()
        return {"status": "completed", "progress": quest.progress, "gamification": xp_result}

    db.commit()
    return {"status": "in_progress", "progress": quest.progress}

@router.post("/{quest_id}/claim")
def claim_quest_reward(quest_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if not quest.is_completed:
        raise HTTPException(status_code=400, detail="Quest is not yet completed")

    xp_result = add_xp(current_user, quest.xp_reward, quest.category.lower(), db, credits_amount=quest.credits_reward)
    check_achievements(current_user, db)
    return {"status": "claimed", "gamification": xp_result}

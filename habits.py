import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Habit, HabitLog
from ..schemas import HabitCreate, HabitCheckIn
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/habits", tags=["Habits"])

@router.get("")
def list_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    today_str = datetime.date.today().isoformat()

    result = []
    for h in habits:
        is_done_today = (h.last_completed == today_str)
        result.append({
            "id": h.id,
            "title": h.title,
            "category": h.category,
            "frequency": h.frequency,
            "streak": h.streak,
            "best_streak": h.best_streak,
            "is_done_today": is_done_today,
            "xp_reward": h.xp_reward,
            "last_completed": h.last_completed
        })
    return result

@router.post("")
def create_habit(req: HabitCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = Habit(
        user_id=current_user.id,
        title=req.title,
        category=req.category or "Fitness",
        frequency=req.frequency or "daily",
        streak=0,
        best_streak=0,
        xp_reward=req.xp_reward or 30
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"status": "success", "habit_id": habit.id}

@router.post("/{habit_id}/check-in")
def check_in_habit(habit_id: int, req: HabitCheckIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    date_str = req.date or datetime.date.today().isoformat()
    if habit.last_completed == date_str:
        return {"status": "already_checked_in", "streak": habit.streak}

    habit.streak += 1
    if habit.streak > habit.best_streak:
        habit.best_streak = habit.streak
    habit.last_completed = date_str

    log = HabitLog(habit_id=habit.id, user_id=current_user.id, completed_date=date_str)
    db.add(log)

    xp_result = add_xp(current_user, habit.xp_reward, "habit", db, credits_amount=10)
    check_achievements(current_user, db)

    db.commit()
    return {"status": "success", "streak": habit.streak, "gamification": xp_result}

@router.get("/heatmap")
def get_habit_heatmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return activity counts per day over the past 60 days for cyber matrix heatmap rendering."""
    logs = db.query(HabitLog).filter(HabitLog.user_id == current_user.id).all()
    heatmap = {}
    for log in logs:
        heatmap[log.completed_date] = heatmap.get(log.completed_date, 0) + 1
    return heatmap

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"status": "success"}

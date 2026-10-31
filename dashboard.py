import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Task, Habit, Quest, WorkoutSession, Activity, CalendarEvent, Notification
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today_str = datetime.date.today().isoformat()
    
    # Tasks summary
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    tasks_pending = [t for t in tasks if t.status != "done"]
    tasks_done = [t for t in tasks if t.status == "done"]

    # Habits summary
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    habits_completed_today = sum(1 for h in habits if h.last_completed == today_str)
    habit_pct = int((habits_completed_today / len(habits) * 100)) if habits else 0

    # Quests summary
    quests = db.query(Quest).filter(Quest.user_id == current_user.id).all()
    active_quests = [q for q in quests if not q.is_completed]

    # Workout & Running summary
    recent_workouts = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).order_by(WorkoutSession.created_at.desc()).limit(3).all()
    recent_activities = db.query(Activity).filter(Activity.user_id == current_user.id).order_by(Activity.created_at.desc()).limit(5).all()

    running_activities = [a for a in recent_activities if a.activity_type == "running"]
    total_running_km = sum(a.distance_km for a in running_activities) if running_activities else 5.12
    total_calories = sum(a.calories for a in recent_activities) + sum(w.calories_burned for w in recent_workouts) or 1240

    # Calendar events for today
    cal_events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).limit(4).all()

    # Notifications
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(5).all()

    return {
        "user": {
            "username": current_user.username,
            "level": current_user.level,
            "rank": current_user.rank,
            "xp": current_user.xp,
            "xp_needed": current_user.level * 300,
            "xp_pct": int(current_user.xp / (current_user.level * 300) * 100),
            "credits": current_user.credits,
            "shards": current_user.shards,
            "attributes": {
                "strength": current_user.strength,
                "agility": current_user.agility,
                "intelligence": current_user.intelligence,
                "consistency": current_user.consistency,
                "focus": current_user.focus,
                "creativity": current_user.creativity
            }
        },
        "alya_briefing": {
            "title": "ALYA Daily Protocol",
            "message": f"Welcome back, {current_user.username}! All systems are operating at peak efficiency. Let's reach new heights together!",
            "quote": "Train your body. Build your mind. Complete your quests. Evolve every day."
        },
        "stats": {
            "running_km": round(total_running_km, 2),
            "calories_burned": total_calories,
            "habits_completion_pct": habit_pct or 95,
            "tasks_pending_count": len(tasks_pending),
            "habits_count": len(habits),
            "active_quests_count": len(active_quests)
        },
        "today_schedule": [
            {"id": c.id, "title": c.title, "start_time": c.start_time, "category": c.category}
            for c in cal_events
        ],
        "active_quests": [
            {
                "id": q.id, "title": q.title, "category": q.category,
                "progress": q.progress, "target": q.target, "unit": q.unit,
                "xp_reward": q.xp_reward, "credits_reward": q.credits_reward
            }
            for q in active_quests[:3]
        ],
        "recent_activities": [
            {
                "id": a.id, "type": a.activity_type, "distance_km": a.distance_km,
                "duration_seconds": a.duration_seconds, "pace": a.pace_min_per_km,
                "calories": a.calories, "created_at": a.created_at.strftime("%H:%M")
            }
            for a in recent_activities
        ],
        "notifications": [
            {"id": n.id, "title": n.title, "message": n.message, "category": n.category, "is_read": n.is_read}
            for n in notifications
        ]
    }

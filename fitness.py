from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Exercise, WorkoutSession
from ..schemas import WorkoutSessionCreate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/fitness", tags=["Fitness & Gym"])

@router.get("/categories")
def get_categories():
    return [
        "Chest", "Back", "Shoulders", "Arms", "Legs",
        "Core", "Full body", "Mobility", "Stretching", "Cardio"
    ]

@router.get("/exercises")
def list_exercises(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)
    if category and category != "All":
        query = query.filter(Exercise.category == category)
    if difficulty and difficulty != "All":
        query = query.filter(Exercise.difficulty == difficulty)
    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))
    
    exercises = query.all()
    return [
        {
            "id": ex.id,
            "name": ex.name,
            "category": ex.category,
            "equipment": ex.equipment,
            "difficulty": ex.difficulty,
            "muscle_group": ex.muscle_group,
            "instructions": ex.instructions,
            "safety_tips": ex.safety_tips,
            "alternatives": ex.alternatives,
            "image_url": ex.image_url
        }
        for ex in exercises
    ]

@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex

@router.post("/workout/session")
def record_workout_session(
    req: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    xp_to_award = max(100, int(req.duration_seconds / 60 * 3))
    
    new_session = WorkoutSession(
        user_id=current_user.id,
        name=req.name,
        duration_seconds=req.duration_seconds,
        calories_burned=req.calories_burned,
        xp_earned=xp_to_award,
        exercises_logged_json=req.exercises_logged_json,
        notes=req.notes
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Award XP and attribute boosts
    xp_result = add_xp(current_user, xp_to_award, "fitness", db, credits_amount=50)
    check_achievements(current_user, db)

    return {
        "status": "success",
        "session_id": new_session.id,
        "xp_earned": xp_to_award,
        "gamification": xp_result
    }

@router.get("/workout/history")
def get_workout_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).order_by(WorkoutSession.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "duration_seconds": s.duration_seconds,
            "calories_burned": s.calories_burned,
            "xp_earned": s.xp_earned,
            "exercises_logged": s.exercises_logged_json,
            "notes": s.notes,
            "created_at": s.created_at.isoformat()
        }
        for s in sessions
    ]

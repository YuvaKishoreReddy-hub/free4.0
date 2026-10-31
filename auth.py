import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AlyaPreference, Notification
from ..schemas import UserRegister, UserLogin, TokenResponse, UserProfileUpdate, PasswordChange
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_pic": user.profile_pic,
        "age_range": user.age_range,
        "theme": user.theme,
        "level": user.level,
        "rank": user.rank,
        "xp": user.xp,
        "credits": user.credits,
        "shards": user.shards,
        "attributes": {
            "strength": user.strength,
            "agility": user.agility,
            "intelligence": user.intelligence,
            "consistency": user.consistency,
            "focus": user.focus,
            "creativity": user.creativity
        }
    }

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        age_range=req.age_range or "20-29",
        level=1,
        rank="E",
        xp=0,
        credits=300,
        shards=10
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default ALYA preferences
    alya_pref = AlyaPreference(user_id=new_user.id)
    db.add(alya_pref)
    
    # Welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="⚡ WELCOME TO ASCEND",
        message="Your personal evolution journey begins now. Complete your first quest to rank up!",
        category="system"
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token({"sub": new_user.username})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(new_user)}

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.username == req.username) | (User.email == req.username)).first()
    if not user or not verify_password(user.hashed_password, req.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == "AlexRiser").first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)

@router.put("/profile")
def update_profile(req: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.profile_pic is not None:
        current_user.profile_pic = req.profile_pic
    if req.age_range is not None:
        current_user.age_range = req.age_range
    if req.theme is not None:
        current_user.theme = req.theme

    db.commit()
    db.refresh(current_user)
    return user_to_dict(current_user)

@router.post("/change-password")
def change_password(req: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(current_user.hashed_password, req.old_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    current_user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully"}

@router.get("/export-data")
def export_user_data(current_user: User = Depends(get_current_user)):
    """Export complete user data in JSON format for privacy compliance and data portability."""
    return {
        "export_date": datetime.datetime.utcnow().isoformat(),
        "user_profile": user_to_dict(current_user),
        "tasks": [{"id": t.id, "title": t.title, "category": t.category, "status": t.status, "priority": t.priority} for t in current_user.tasks],
        "habits": [{"id": h.id, "title": h.title, "streak": h.streak, "best_streak": h.best_streak} for h in current_user.habits],
        "quests": [{"id": q.id, "title": q.title, "progress": q.progress, "target": q.target, "is_completed": q.is_completed} for q in current_user.quests],
        "workouts": [{"id": w.id, "name": w.name, "duration_seconds": w.duration_seconds, "calories": w.calories_burned} for w in current_user.workouts],
        "activities": [{"id": a.id, "type": a.activity_type, "distance_km": a.distance_km, "duration": a.duration_seconds, "pace": a.pace_min_per_km} for a in current_user.activities],
        "calendar_events": [{"id": c.id, "title": c.title, "start": c.start_time, "end": c.end_time} for c in current_user.calendar_events],
        "sleep_records": [{"date": s.date, "hours": s.sleep_hours, "recovery_score": s.recovery_score} for s in current_user.sleep_records]
    }

@router.delete("/delete-account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Allow user to permanently delete their account and associated data."""
    if current_user.username == "AlexRiser":
        raise HTTPException(status_code=400, detail="Demo account cannot be deleted, but you can delete created user accounts.")
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Account and all associated records permanently removed."}

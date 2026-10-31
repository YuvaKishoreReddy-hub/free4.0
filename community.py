from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CommunityChallenge, Notification
from ..auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["Community"])

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.level.desc(), User.xp.desc()).limit(20).all()
    # Add simulated elite cyber comrades for a rich leaderboard experience
    mock_elite = [
        {"rank_tier": "SSS", "username": "ValkyriePrime", "level": 98, "xp": 14200, "rank_pos": 1},
        {"rank_tier": "SS", "username": "KuroNeko_99", "level": 74, "xp": 8900, "rank_pos": 2},
        {"rank_tier": "S", "username": "CipherNova", "level": 55, "xp": 5600, "rank_pos": 3},
    ]

    leaderboard = []
    pos = 4
    for u in users:
        leaderboard.append({
            "rank_pos": pos if u.username != "AlexRiser" else 4,
            "username": u.username,
            "level": u.level,
            "rank_tier": u.rank,
            "xp": u.xp,
            "is_current_user": False
        })
        pos += 1

    # Combine
    combined = mock_elite + leaderboard
    return combined

@router.get("/challenges")
def get_challenges(db: Session = Depends(get_db)):
    challenges = db.query(CommunityChallenge).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "target_value": c.target_value,
            "current_value": c.current_value,
            "progress_pct": int(c.current_value / c.target_value * 100),
            "unit": c.unit,
            "participants_count": c.participants_count,
            "xp_reward": c.xp_reward,
            "end_date": c.end_date
        }
        for c in challenges
    ]

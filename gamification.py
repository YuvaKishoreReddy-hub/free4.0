from sqlalchemy.orm import Session
from .models import User, Notification, Achievement, UserAchievement

RANK_THRESHOLDS = [
    (1, "E"),
    (10, "D"),
    (20, "C"),
    (30, "B"),
    (40, "A"),
    (42, "S"),   # S-Rank starting tier (matching visual design AlexRiser Level 42 S-Rank)
    (65, "SS"),
    (85, "SSS")
]

def calculate_rank(level: int) -> str:
    current_rank = "E"
    for lvl, rank in RANK_THRESHOLDS:
        if level >= lvl:
            current_rank = rank
        else:
            break
    return current_rank

def xp_needed_for_level(level: int) -> int:
    return level * 300

def add_xp(user: User, xp_amount: int, category: str, db: Session, credits_amount: int = 0) -> dict:
    old_level = user.level
    old_rank = user.rank
    
    user.xp += xp_amount
    user.credits += credits_amount
    
    # Attribute increases based on action category
    if category in ["fitness", "workout", "gym"]:
        user.strength = min(100, user.strength + 1)
        user.agility = min(100, user.agility + 1)
    elif category in ["running", "walking", "cycling"]:
        user.agility = min(100, user.agility + 2)
        user.consistency = min(100, user.consistency + 1)
    elif category in ["coding", "learning", "study"]:
        user.intelligence = min(100, user.intelligence + 2)
        user.focus = min(100, user.focus + 1)
    elif category in ["task", "habit", "routine"]:
        user.consistency = min(100, user.consistency + 2)
        user.focus = min(100, user.focus + 1)
    elif category in ["creativity", "art", "music"]:
        user.creativity = min(100, user.creativity + 2)
        
    # Check level up
    leveled_up = False
    xp_req = xp_needed_for_level(user.level)
    while user.xp >= xp_req:
        user.xp -= xp_req
        user.level += 1
        user.credits += 100
        user.shards += 2
        leveled_up = True
        xp_req = xp_needed_for_level(user.level)
        
    new_rank = calculate_rank(user.level)
    rank_upgraded = new_rank != old_rank
    user.rank = new_rank
    
    if leveled_up:
        notif = Notification(
            user_id=user.id,
            title="⚡ LEVEL UP!",
            message=f"Congratulations! You reached Level {user.level} [{user.rank} Rank]! +100 Credits awarded.",
            category="rank"
        )
        db.add(notif)
        
    db.commit()
    db.refresh(user)
    
    return {
        "leveled_up": leveled_up,
        "rank_upgraded": rank_upgraded,
        "old_level": old_level,
        "new_level": user.level,
        "rank": user.rank,
        "xp": user.xp,
        "xp_needed": xp_needed_for_level(user.level),
        "credits": user.credits,
        "shards": user.shards
    }

def check_achievements(user: User, db: Session):
    """Scan user metrics and award any newly unlocked achievements."""
    unlocked_ids = {ua.achievement_id for ua in user.achievements}
    all_achievements = db.query(Achievement).all()
    
    for ach in all_achievements:
        if ach.id in unlocked_ids:
            continue
            
        unlocked = False
        if ach.id == "first_step" and (len(user.tasks) > 0 or len(user.habits) > 0):
            unlocked = True
        elif ach.id == "iron_body" and len(user.workouts) >= 1:
            unlocked = True
        elif ach.id == "cyber_runner" and any(a.activity_type == "running" for a in user.activities):
            unlocked = True
        elif ach.id == "habit_streak_5" and any(h.streak >= 5 for h in user.habits):
            unlocked = True
        elif ach.id == "rank_s_ascendant" and user.rank in ["S", "SS", "SSS"]:
            unlocked = True
        elif ach.id == "focus_initiate" and len(user.focus_sessions) >= 1:
            unlocked = True
        elif ach.id == "polymath" and len(user.learning_records) >= 1:
            unlocked = True
            
        if unlocked:
            ua = UserAchievement(user_id=user.id, achievement_id=ach.id)
            db.add(ua)
            user.xp += ach.xp_reward
            user.credits += ach.credits_reward
            
            notif = Notification(
                user_id=user.id,
                title="🏆 ACHIEVEMENT UNLOCKED!",
                message=f"Unlocked '{ach.title}'! +{ach.xp_reward} XP, +{ach.credits_reward} Credits.",
                category="quest"
            )
            db.add(notif)
            
    db.commit()

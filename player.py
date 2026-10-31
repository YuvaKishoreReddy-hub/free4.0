from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, SkillNode, UserSkill, Achievement, UserAchievement, StoreItem, UserInventory, AlyaPreference
from ..schemas import StoreBuyRequest
from ..auth import get_current_user

router = APIRouter(prefix="/api/player", tags=["Player RPG & Store"])

@router.get("/status")
def get_player_status(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "level": current_user.level,
        "rank": current_user.rank,
        "xp": current_user.xp,
        "xp_needed": current_user.level * 300,
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
    }

@router.get("/skills")
def get_skill_tree(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_skills = db.query(SkillNode).all()
    unlocked_ids = {us.skill_id for us in current_user.skills}

    nodes = []
    for s in all_skills:
        nodes.append({
            "id": s.id,
            "category": s.category,
            "name": s.name,
            "description": s.description,
            "tier": s.tier,
            "cost": s.cost,
            "icon": s.icon,
            "parent_id": s.parent_id,
            "attribute_bonus": s.attribute_bonus,
            "bonus_amount": s.bonus_amount,
            "is_unlocked": s.id in unlocked_ids
        })
    return nodes

@router.post("/skills/{skill_id}/unlock")
def unlock_skill(skill_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(SkillNode).filter(SkillNode.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    already_unlocked = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill_id).first()
    if already_unlocked:
        return {"status": "already_unlocked"}

    # Check parent requirement if any
    if skill.parent_id:
        parent_unlocked = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill.parent_id).first()
        if not parent_unlocked:
            raise HTTPException(status_code=400, detail="Prerequisite skill must be unlocked first")

    # Add skill
    user_skill = UserSkill(user_id=current_user.id, skill_id=skill_id)
    db.add(user_skill)

    # Apply attribute bonus
    attr = skill.attribute_bonus.lower()
    if hasattr(current_user, attr):
        curr_val = getattr(current_user, attr)
        setattr(current_user, attr, min(100, curr_val + skill.bonus_amount))

    db.commit()
    return {"status": "unlocked", "skill_id": skill_id, "bonus": f"+{skill.bonus_amount} {skill.attribute_bonus}"}

@router.get("/achievements")
def get_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_ach = db.query(Achievement).all()
    unlocked_map = {ua.achievement_id: ua.unlocked_at.isoformat() for ua in current_user.achievements}

    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "icon": a.icon,
            "category": a.category,
            "xp_reward": a.xp_reward,
            "credits_reward": a.credits_reward,
            "is_unlocked": a.id in unlocked_map,
            "unlocked_at": unlocked_map.get(a.id)
        }
        for a in all_ach
    ]

@router.get("/store")
def get_store_catalog(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(StoreItem).all()
    inventory = {inv.item_id: inv.is_equipped for inv in current_user.inventory}

    return [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "description": item.description,
            "cost_credits": item.cost_credits,
            "cost_shards": item.cost_shards,
            "asset_key": item.asset_key,
            "icon": item.icon,
            "is_owned": item.id in inventory,
            "is_equipped": inventory.get(item.id, False)
        }
        for item in items
    ]

@router.post("/store/buy")
def buy_store_item(req: StoreBuyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(StoreItem).filter(StoreItem.id == req.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check if already owned
    existing = db.query(UserInventory).filter(UserInventory.user_id == current_user.id, UserInventory.item_id == req.item_id).first()
    if existing:
        return {"status": "already_owned"}

    if current_user.credits < item.cost_credits or current_user.shards < item.cost_shards:
        raise HTTPException(status_code=400, detail="Insufficient credits or shards")

    current_user.credits -= item.cost_credits
    current_user.shards -= item.cost_shards

    inv = UserInventory(user_id=current_user.id, item_id=item.id, is_equipped=True)
    db.add(inv)

    # Automatically equip in ALYA preferences if applicable
    pref = db.query(AlyaPreference).filter(AlyaPreference.user_id == current_user.id).first()
    if pref:
        if item.category == "outfit":
            pref.outfit = item.asset_key
        elif item.category == "hairstyle":
            pref.hair_color = item.asset_key
        elif item.category == "accessory":
            pref.accessory = item.asset_key
        elif item.category == "aura":
            pref.aura_effect = item.asset_key

    db.commit()
    return {"status": "success", "item_id": item.id, "credits_left": current_user.credits}

@router.post("/store/{item_id}/equip")
def equip_item(item_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv_entry = db.query(UserInventory).filter(UserInventory.user_id == current_user.id, UserInventory.item_id == item_id).first()
    if not inv_entry:
        raise HTTPException(status_code=400, detail="Item not owned")

    item = inv_entry.item
    # Unequip others in same category
    other_items = db.query(UserInventory).join(StoreItem).filter(
        UserInventory.user_id == current_user.id,
        StoreItem.category == item.category
    ).all()
    for other in other_items:
        other.is_equipped = False

    inv_entry.is_equipped = True

    pref = db.query(AlyaPreference).filter(AlyaPreference.user_id == current_user.id).first()
    if pref:
        if item.category == "outfit":
            pref.outfit = item.asset_key
        elif item.category == "hairstyle":
            pref.hair_color = item.asset_key
        elif item.category == "accessory":
            pref.accessory = item.asset_key
        elif item.category == "aura":
            pref.aura_effect = item.asset_key

    db.commit()
    return {"status": "equipped", "item_id": item_id}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AlyaPreference, AlyaMessage
from ..schemas import AlyaChatRequest, AlyaPreferenceUpdate
from ..auth import get_current_user
from ..alya import generate_alya_response

router = APIRouter(prefix="/api/alya", tags=["ALYA AI & Studio"])

@router.post("/chat")
def chat_with_alya(req: AlyaChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Record user message
    user_msg = AlyaMessage(user_id=current_user.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Generate response
    ai_resp = generate_alya_response(req.message, current_user, db)
    
    # Record ALYA reply
    alya_msg = AlyaMessage(
        user_id=current_user.id,
        role="alya",
        content=ai_resp["reply"],
        action_type=ai_resp.get("action", ""),
        action_payload=str(ai_resp.get("payload", {}))
    )
    db.add(alya_msg)
    db.commit()

    return {
        "reply": ai_resp["reply"],
        "expression": ai_resp.get("expression", "happy"),
        "action": ai_resp.get("action", "chat"),
        "payload": ai_resp.get("payload", {})
    }

@router.get("/history")
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(AlyaMessage).filter(AlyaMessage.user_id == current_user.id).order_by(AlyaMessage.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "action_type": m.action_type,
            "created_at": m.created_at.isoformat()
        }
        for m in msgs
    ]

@router.delete("/clear")
def clear_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(AlyaMessage).filter(AlyaMessage.user_id == current_user.id).delete()
    db.commit()
    return {"status": "success", "message": "Conversation history cleared"}

@router.get("/preferences")
def get_alya_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(AlyaPreference).filter(AlyaPreference.user_id == current_user.id).first()
    if not pref:
        pref = AlyaPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return {
        "hairstyle": pref.hairstyle,
        "hair_color": pref.hair_color,
        "outfit": pref.outfit,
        "accessory": pref.accessory,
        "eye_glow": pref.eye_glow,
        "aura_effect": pref.aura_effect,
        "background_theme": pref.background_theme,
        "voice_enabled": pref.voice_enabled,
        "voice_pitch": pref.voice_pitch,
        "voice_rate": pref.voice_rate,
        "personality_style": pref.personality_style
    }

@router.put("/preferences")
def update_alya_preferences(req: AlyaPreferenceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(AlyaPreference).filter(AlyaPreference.user_id == current_user.id).first()
    if not pref:
        pref = AlyaPreference(user_id=current_user.id)
        db.add(pref)

    for field, val in req.dict(exclude_unset=True).items():
        if val is not None:
            setattr(pref, field, val)

    db.commit()
    db.refresh(pref)
    return {"status": "success", "preferences": {
        "hairstyle": pref.hairstyle,
        "hair_color": pref.hair_color,
        "outfit": pref.outfit,
        "accessory": pref.accessory,
        "eye_glow": pref.eye_glow,
        "aura_effect": pref.aura_effect,
        "background_theme": pref.background_theme,
        "voice_enabled": pref.voice_enabled,
        "voice_pitch": pref.voice_pitch,
        "voice_rate": pref.voice_rate,
        "personality_style": pref.personality_style
    }}

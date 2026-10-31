from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Notification
from ..auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    unread_count = sum(1 for n in notifs if not n.is_read)
    return {
        "unread_count": unread_count,
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "category": n.category,
                "is_read": n.is_read,
                "created_at": n.created_at.strftime("%b %d, %H:%M")
            }
            for n in notifs
        ]
    }

@router.post("/mark-all-read")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"status": "success"}

@router.post("/{notification_id}/read")
def mark_one_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

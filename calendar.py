from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CalendarEvent
from ..schemas import CalendarEventCreate
from ..auth import get_current_user

router = APIRouter(prefix="/api/calendar", tags=["Calendar & Schedule"])

@router.get("/events")
def list_calendar_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).order_by(CalendarEvent.start_time.asc()).all()
    return [
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "category": e.category,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "is_all_day": e.is_all_day,
            "recurrence": e.recurrence,
            "reminder_minutes": e.reminder_minutes
        }
        for e in events
    ]

@router.post("/events")
def create_calendar_event(req: CalendarEventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = CalendarEvent(
        user_id=current_user.id,
        title=req.title,
        description=req.description or "",
        category=req.category or "General",
        start_time=req.start_time,
        end_time=req.end_time,
        is_all_day=req.is_all_day or False,
        recurrence=req.recurrence or "none",
        reminder_minutes=req.reminder_minutes or 15
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"status": "success", "event_id": event.id}

@router.delete("/events/{event_id}")
def delete_calendar_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"status": "success"}

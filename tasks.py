import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Task
from ..schemas import TaskCreate, TaskUpdate
from ..auth import get_current_user
from ..gamification import add_xp, check_achievements

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("")
def list_tasks(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if category and category != "All":
        query = query.filter(Task.category == category)
    if status and status != "All":
        query = query.filter(Task.status == status)
    if priority and priority != "All":
        query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "due_date": t.due_date,
            "status": t.status,
            "subtasks_json": t.subtasks_json,
            "xp_reward": t.xp_reward,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "created_at": t.created_at.isoformat()
        }
        for t in tasks
    ]

@router.post("")
def create_task(
    req: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = Task(
        user_id=current_user.id,
        title=req.title,
        description=req.description or "",
        category=req.category or "Personal",
        priority=req.priority or "Medium",
        due_date=req.due_date or "",
        status=req.status or "todo",
        subtasks_json=req.subtasks_json or "[]",
        xp_reward=req.xp_reward or 50
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"status": "success", "task_id": task.id}

@router.put("/{task_id}")
def update_task(
    task_id: int,
    req: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    if req.title is not None:
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.category is not None:
        task.category = req.category
    if req.priority is not None:
        task.priority = req.priority
    if req.due_date is not None:
        task.due_date = req.due_date
    if req.status is not None:
        task.status = req.status
        if req.status == "done" and old_status != "done":
            task.completed_at = datetime.datetime.utcnow()
            add_xp(current_user, task.xp_reward, "task", db, credits_amount=15)
            check_achievements(current_user, db)
    if req.subtasks_json is not None:
        task.subtasks_json = req.subtasks_json

    db.commit()
    db.refresh(task)
    return {"status": "success", "task_id": task.id}

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"status": "success"}

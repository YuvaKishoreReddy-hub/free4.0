from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    age_range: Optional[str] = "20-29"

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    profile_pic: Optional[str] = None
    age_range: Optional[str] = None
    theme: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Personal"
    priority: Optional[str] = "Medium"
    due_date: Optional[str] = ""
    status: Optional[str] = "todo"
    subtasks_json: Optional[str] = "[]"
    xp_reward: Optional[int] = 50

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    subtasks_json: Optional[str] = None

# Habit Schemas
class HabitCreate(BaseModel):
    title: str
    category: Optional[str] = "Fitness"
    frequency: Optional[str] = "daily"
    xp_reward: Optional[int] = 30

class HabitCheckIn(BaseModel):
    date: Optional[str] = None

# Quest Schemas
class QuestCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Custom"
    difficulty: Optional[str] = "Normal"
    target: Optional[int] = 1
    unit: Optional[str] = "times"
    xp_reward: Optional[int] = 150
    credits_reward: Optional[int] = 50
    is_weekly: Optional[bool] = False

# Workout Schemas
class WorkoutSessionCreate(BaseModel):
    name: str
    duration_seconds: int
    calories_burned: int
    exercises_logged_json: str
    notes: Optional[str] = ""

# Activity Schemas
class ActivityCreate(BaseModel):
    activity_type: str  # running, walking, cycling
    distance_km: float
    duration_seconds: int
    pace_min_per_km: float
    speed_kmh: float
    calories: int
    elevation_m: Optional[float] = 0.0
    route_coords_json: Optional[str] = "[]"
    is_simulation: Optional[bool] = False
    notes: Optional[str] = ""

# Calendar Schemas
class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    start_time: str
    end_time: str
    is_all_day: Optional[bool] = False
    recurrence: Optional[str] = "none"
    reminder_minutes: Optional[int] = 15

# Focus & Learning Schemas
class FocusSessionCreate(BaseModel):
    mode: Optional[str] = "pomodoro"
    duration_minutes: int
    completed: Optional[bool] = True
    notes: Optional[str] = ""

class LearningRecordCreate(BaseModel):
    subject: str
    topic: Optional[str] = ""
    hours_spent: float
    notes: Optional[str] = ""
    milestone_completed: Optional[bool] = False

# Sleep Schemas
class SleepRecordCreate(BaseModel):
    date: str
    sleep_hours: float
    sleep_quality: int
    resting_heart_rate: int
    recovery_score: int
    mood: Optional[str] = "Energetic"
    energy_level: Optional[int] = 8
    notes: Optional[str] = ""

# ALYA Schemas
class AlyaChatRequest(BaseModel):
    message: str

class AlyaPreferenceUpdate(BaseModel):
    hairstyle: Optional[str] = None
    hair_color: Optional[str] = None
    outfit: Optional[str] = None
    accessory: Optional[str] = None
    eye_glow: Optional[str] = None
    aura_effect: Optional[str] = None
    background_theme: Optional[str] = None
    voice_enabled: Optional[bool] = None
    voice_pitch: Optional[float] = None
    voice_rate: Optional[float] = None
    personality_style: Optional[str] = None

# Store Buy Schema
class StoreBuyRequest(BaseModel):
    item_id: str

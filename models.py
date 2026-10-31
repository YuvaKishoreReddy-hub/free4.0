import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    profile_pic = Column(String(255), default="/assets/ascend_showcase_1.jpg")
    age_range = Column(String(50), default="20-29")
    theme = Column(String(50), default="cyber-dark")
    level = Column(Integer, default=1)
    rank = Column(String(10), default="E")
    xp = Column(Integer, default=0)
    credits = Column(Integer, default=250)
    shards = Column(Integer, default=10)
    
    # RPG Attributes (0 to 100 base)
    strength = Column(Integer, default=15)
    agility = Column(Integer, default=15)
    intelligence = Column(Integer, default=15)
    consistency = Column(Integer, default=15)
    focus = Column(Integer, default=15)
    creativity = Column(Integer, default=15)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    quests = relationship("Quest", back_populates="user", cascade="all, delete-orphan")
    workouts = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")
    learning_records = relationship("LearningRecord", back_populates="user", cascade="all, delete-orphan")
    sleep_records = relationship("SleepRecord", back_populates="user", cascade="all, delete-orphan")
    alya_pref = relationship("AlyaPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    alya_messages = relationship("AlyaMessage", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    inventory = relationship("UserInventory", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="Personal")  # Study, Coding, Fitness, Personal, Projects, Other
    priority = Column(String(20), default="Medium")    # Low, Medium, High, Urgent
    due_date = Column(String(50), default="")
    status = Column(String(20), default="todo")        # todo, in_progress, review, done
    subtasks_json = Column(Text, default="[]")
    xp_reward = Column(Integer, default=50)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="Fitness")
    frequency = Column(String(50), default="daily")
    streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_completed = Column(String(30), default="")
    xp_reward = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    completed_date = Column(String(30), nullable=False)  # YYYY-MM-DD

    habit = relationship("Habit", back_populates="logs")

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="Fitness")  # Fitness, Running, Coding, Learning, Habit, Productivity
    difficulty = Column(String(20), default="Normal")  # Easy, Normal, Hard, Elite
    progress = Column(Integer, default=0)
    target = Column(Integer, default=1)
    unit = Column(String(30), default="times")
    xp_reward = Column(Integer, default=150)
    credits_reward = Column(Integer, default=50)
    is_completed = Column(Boolean, default=False)
    is_weekly = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quests")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Chest, Back, Shoulders, Arms, Legs, Core, Full body, Mobility, Stretching, Cardio
    equipment = Column(String(50), default="Bodyweight")
    difficulty = Column(String(20), default="Beginner")
    muscle_group = Column(String(100), default="Full Body")
    instructions = Column(Text, default="")
    safety_tips = Column(Text, default="")
    alternatives = Column(Text, default="")
    image_url = Column(String(255), default="")

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="Cyber Strength Protocol")
    duration_seconds = Column(Integer, default=0)
    calories_burned = Column(Integer, default=0)
    xp_earned = Column(Integer, default=100)
    exercises_logged_json = Column(Text, default="[]")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="workouts")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(20), nullable=False)  # running, walking, cycling
    distance_km = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=0)
    pace_min_per_km = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=0.0)
    calories = Column(Integer, default=0)
    elevation_m = Column(Float, default=0.0)
    route_coords_json = Column(Text, default="[]")
    is_simulation = Column(Boolean, default=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")

class SkillNode(Base):
    __tablename__ = "skill_nodes"

    id = Column(String(50), primary_key=True)
    category = Column(String(50), nullable=False)  # Fitness, Learning, Coding, Creativity, Focus, Productivity, Consistency
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    tier = Column(Integer, default=1)
    cost = Column(Integer, default=1)
    icon = Column(String(50), default="zap")
    parent_id = Column(String(50), nullable=True)
    attribute_bonus = Column(String(30), default="strength")
    bonus_amount = Column(Integer, default=5)

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(50), ForeignKey("skill_nodes.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="skills")
    skill = relationship("SkillNode")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(50), primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, default="")
    icon = Column(String(50), default="award")
    category = Column(String(50), default="General")
    xp_reward = Column(Integer, default=200)
    credits_reward = Column(Integer, default=100)

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(String(50), ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

class StoreItem(Base):
    __tablename__ = "store_items"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # outfit, hairstyle, accessory, aura, room_decor, theme
    description = Column(Text, default="")
    cost_credits = Column(Integer, default=100)
    cost_shards = Column(Integer, default=0)
    asset_key = Column(String(100), nullable=False)
    icon = Column(String(50), default="sparkles")

class UserInventory(Base):
    __tablename__ = "user_inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(String(50), ForeignKey("store_items.id"), nullable=False)
    is_equipped = Column(Boolean, default=False)
    acquired_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="inventory")
    item = relationship("StoreItem")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="General")  # Workout, Study, Run, Meeting, Routine
    start_time = Column(String(50), nullable=False)   # ISO string or YYYY-MM-DD HH:MM
    end_time = Column(String(50), nullable=False)
    is_all_day = Column(Boolean, default=False)
    recurrence = Column(String(50), default="none")
    reminder_minutes = Column(Integer, default=15)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="calendar_events")

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String(50), default="pomodoro")  # pomodoro, deep_work, sprint
    duration_minutes = Column(Integer, default=25)
    completed = Column(Boolean, default=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="focus_sessions")

class LearningRecord(Base):
    __tablename__ = "learning_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(100), nullable=False)
    topic = Column(String(200), default="")
    hours_spent = Column(Float, default=1.0)
    notes = Column(Text, default="")
    milestone_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="learning_records")

class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(30), nullable=False)  # YYYY-MM-DD
    sleep_hours = Column(Float, default=7.5)
    sleep_quality = Column(Integer, default=85)  # 0-100%
    resting_heart_rate = Column(Integer, default=62)
    recovery_score = Column(Integer, default=88)  # 0-100%
    mood = Column(String(30), default="Energetic")
    energy_level = Column(Integer, default=8)    # 1-10
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sleep_records")

class AlyaPreference(Base):
    __tablename__ = "alya_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    hairstyle = Column(String(50), default="flowing_twin")
    hair_color = Column(String(50), default="ice_blue")
    outfit = Column(String(50), default="cyber_vanguard")
    accessory = Column(String(50), default="holo_visor")
    eye_glow = Column(String(50), default="cyan_nova")
    aura_effect = Column(String(50), default="quantum_orbit")
    background_theme = Column(String(50), default="orbital_command")
    voice_enabled = Column(Boolean, default=True)
    voice_pitch = Column(Float, default=1.1)
    voice_rate = Column(Float, default=1.0)
    personality_style = Column(String(50), default="playful_supportive")

    user = relationship("User", back_populates="alya_pref")

class AlyaMessage(Base):
    __tablename__ = "alya_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="alya")  # user, alya, system
    content = Column(Text, nullable=False)
    action_type = Column(String(50), default="")  # e.g. navigate, create_task, start_workout, camera_rotate
    action_payload = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alya_messages")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="system")  # quest, workout, habit, alya, rank
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class CommunityChallenge(Base):
    __tablename__ = "community_challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="Fitness")
    target_value = Column(Float, default=100.0)
    current_value = Column(Float, default=45.0)
    unit = Column(String(30), default="km")
    participants_count = Column(Integer, default=1240)
    xp_reward = Column(Integer, default=500)
    end_date = Column(String(30), default="2026-11-30")

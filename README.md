# ⚡ ASCEND 4.0 — THE ULTIMATE PERSONAL EVOLUTION SYSTEM
> **YOUR LIFE. YOUR EVOLUTION.**  
> *"Train your body. Build your mind. Complete your quests. Evolve every day."*

---

## 🌟 Overview

**ASCEND 4.0** is a full-stack, futuristic personal productivity, fitness, learning, and RPG gamification application inspired by premium sci-fi interfaces, intelligent AI companions, and progression systems.

At the core of the system is **ALYA (Advanced Life Assistant)**, an original fictional anime-inspired female AI companion featuring long flowing ice-blue hair, cyan glowing eyes, futuristic combat weave, real-time 3D orbital turntable rotation, gestures, facial expressions, and hands-free voice commands.

---

## 🚀 Key Features

### 1. ALYA 3D Character Studio & AI Companion
- **Real Three.js 3D WebGL Model**: Full 360° horizontal and vertical orbital rotation, drag to rotate, pinch/wheel to zoom, right-click to pan, double-click to reset.
- **Camera Presets**: Front, Back, Left, Right, 3/4 Dynamic, Face Close-up, Upper Body, and Full Body framing.
- **Auto-Rotate Turntable**: Configurable rotation speed with automatic pause on user interaction and resume after idle.
- **Expressions & Gestures**: Idle, Happy, Excited, Thinking, Calm, Surprised, Waving, Celebrating, and Lip-Sync Speaking.
- **Dynamic 3D Customization**: Switch hair colors (Ice Blue, Cyber Neon Cyan, Electric Violet, Starlight Gold, Quantum Silver, Hologram Pink), outfits (Cyber Vanguard, Nano Athletic, Stealth Ops, Celestial Valkyrie, Holo Luminary), and holographic accessories.
- **Hands-Free Voice Commands**: Speak naturally using Web Speech API: *"ALYA, face front"*, *"ALYA, turn left"*, *"ALYA, rotate 360 degrees"*, *"ALYA, zoom in"*, *"Add task: [Task Name]"*.

### 2. Physical Evolution
- **10-Category Exercise Library**: Chest, Back, Shoulders, Arms, Legs, Core, Full body, Mobility, Stretching, Cardio with detailed instructions, safety tips, and beginner alternatives.
- **Workout Planner & Live Protocol**: Active sets/reps logger, interactive rest countdown clock with audio chimes and companion voice encouragement.
- **GPS Running Tracker**: Real-time GPS coordinates via HTML5 Geolocation, simulated route mode, live distance, pace, speed, calories, SVG cyber map with glowing trails, and GPX activity export.
- **Walking & Cycling Trackers**: Dedicated cadence and elevation tracking.

### 3. Execution & Task Matrix
- **Life Command Center**: Interactive daily timeline from 06:00 to 22:00 with priority blocks and routine tracking.
- **Full Kanban Board**: To Do, In Progress, Review, Completed with drag-and-drop transitions, priority tags, and list views.
- **Habit Tracker & Momentum**: Daily check-ins, streak counters, and a 60-day cyber matrix heatmap. Never punishes users for missed days.
- **Daily Quests & Weekly Missions**: RPG-inspired quests rewarding Evolution XP and Credits.

### 4. RPG Progression & Gamification
- **Rank Hierarchy**: Progression across `E → D → C → B → A → S → SS → SSS`.
- **6 Core Attributes**: Strength, Agility, Intelligence, Consistency, Focus, and Creativity with transparent XP calculation and hexagonal radar charts.
- **Interactive Branching Skill Tree**: Unlockable proficiencies across Fitness, Coding, Focus, Consistency, and Creativity.
- **Milestone Achievements**: 15+ unlockable badges with XP rewards.
- **Rewards Store**: Spend virtual credits on 3D outfits, hairstyles, holographic auras, and room decors.

### 5. Mind, Recovery & Atmosphere
- **ALYA 3D Virtual Lounge**: Relaxing penthouse apartment overlooking a futuristic cyberpunk skyline, interactive robotic cyber cat pet, trophy showcase, and ambient synthwave music.
- **Procedural Web Audio Synthesizer**: Built-in cyberpunk synthwave engine with real-time audio spectrum canvas visualizer and Workout, Focus, and Relax playlists.
- **Focus Mode**: Pomodoro timer with glowing circular ring and focus statistics.
- **Learning Tracker**: Sprints, courses, topics, and study hours.
- **Sleep & Recovery Journal**: Sleep stages, resting pulse, and physiological recovery scores.
- **Global Community Leaderboards & Challenges**: Privacy-shielded leaderboards.

---

## 🛠️ Architecture & Technology Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, SQLite database, Pydantic, PyJWT, HTTPX.
- **Frontend**: Vanilla ES6+ Modular Single-Page Application, Three.js 3D Engine, Web Audio API procedural synthesizer, Web Speech API.
- **Design System**: Glassmorphic dark sci-fi palette (`#070B16` background, neon cyan `#00E5FF`, electric blue `#287CFF`, purple `#865CFF`, gold `#FFC857`), responsive across mobile, tablet, and desktop.

---

## 🏁 Quickstart Guide

### 1. Start the ASCEND Evolution Server
From the project root:
```bash
python -m backend.app.main
```
The server will initialize the SQLite database, seed default demo data (including **AlexRiser Level 42 S-Rank**), and serve both the REST API and the frontend at:
```
http://localhost:8000
```

### 2. Instant One-Click Demo
Visit `http://localhost:8000` in your browser. The app will automatically connect to your local backend and load your live telemetry!
- **Demo User:** `AlexRiser`
- **Level & Rank:** `Level 42 • S-Rank`
- **Password:** `ascend2026password`

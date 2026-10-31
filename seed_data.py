import json
import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    User, Exercise, Quest, SkillNode, Achievement, StoreItem,
    Task, Habit, HabitLog, WorkoutSession, Activity, CalendarEvent,
    AlyaPreference, AlyaMessage, Notification, CommunityChallenge,
    UserSkill, UserAchievement, UserInventory, SleepRecord
)
from .auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.username == "AlexRiser").first():
            return

        # 1. Create Core Demo User (matching visual design)
        user = User(
            username="AlexRiser",
            email="alex@ascend.io",
            hashed_password=hash_password("ascend2026password"),
            profile_pic="/assets/ascend_showcase_1.jpg",
            age_range="20-29",
            theme="cyber-dark",
            level=42,
            rank="S",
            xp=3850,
            credits=12450,
            shards=850,
            strength=95,
            agility=92,
            intelligence=90,
            consistency=94,
            focus=93,
            creativity=91
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # 2. Seed Exercise Library across 10 categories
        exercises_data = [
            # Chest
            ("Barbell Bench Press", "Chest", "Barbell", "Intermediate", "Pectoralis Major, Triceps, Anterior Deltoid",
             "Lie on the bench with eyes under barbell. Grip slightly wider than shoulder width. Lower bar smoothly to mid-chest, then drive upwards powerfully.",
             "Maintain 5 points of contact. Do not flare elbows past 75 degrees. Keep wrists straight.",
             "Dumbbell Bench Press, Push-Ups", "/assets/ascend_showcase_1.jpg"),
            ("Incline Dumbbell Press", "Chest", "Dumbbells", "Intermediate", "Upper Chest, Anterior Deltoid",
             "Set bench to 30-45 degrees. Press dumbbells upwards in an arc, feeling a deep stretch at the bottom.",
             "Avoid arching the lower back excessively. Lower with control.", "Incline Barbell Press, High Cable Fly", ""),
            ("Cable Crossover Flyes", "Chest", "Cable Machine", "Beginner", "Sternal Pectorals",
             "Stand with staggered stance. Bring cables together in an arc as if hugging a large tree.",
             "Keep a slight bend in elbows throughout the movement.", "Dumbbell Flyes, Resistance Band Flyes", ""),
            ("Bodyweight Push-Ups", "Chest", "Bodyweight", "Beginner", "Chest, Triceps, Core",
             "Hands slightly wider than shoulders. Maintain rigid plank posture from heels to neck.",
             "Engage glutes and core to prevent sagging hips.", "Incline Push-Ups, Knee Push-Ups", ""),

            # Back
            ("Conventional Barbell Deadlift", "Back", "Barbell", "Advanced", "Hamstrings, Glutes, Erector Spinae, Lats",
             "Stand with feet hip-width. Hinge at hips to grip bar. Lock lats, brace core, and drive floor away through heels.",
             "Keep bar close to shins. Never round the lumbar spine under load.", "Trap Bar Deadlift, Romanian Deadlift", ""),
            ("Wide Grip Pull-Ups", "Back", "Pull-Up Bar", "Intermediate", "Latissimus Dorsi, Biceps, Upper Back",
             "Hang with hands wider than shoulders. Pull chest up toward the bar, driving elbows down and back.",
             "Do not swing or kick legs. Full range of motion at bottom.", "Band-Assisted Pull-Ups, Lat Pulldowns", ""),
            ("Bent-Over Barbell Row", "Back", "Barbell", "Intermediate", "Rhomboids, Lats, Traps",
             "Hinge hips to a 45-degree angle. Pull bar towards belly button, squeezing shoulder blades together.",
             "Keep neck neutral with spine.", "Single-Arm Dumbbell Row, Cable Row", ""),

            # Shoulders
            ("Standing Overhead Barbell Press", "Shoulders", "Barbell", "Intermediate", "Deltoids, Upper Traps, Triceps",
             "Grip bar just outside shoulders. Press bar vertically overhead, clearing face by tucking chin slightly.",
             "Brace glutes and abs to avoid lumbar hyperextension.", "Dumbbell Shoulder Press, Seated Military Press", ""),
            ("Dumbbell Lateral Raises", "Shoulders", "Dumbbells", "Beginner", "Lateral Deltoid",
             "Stand upright with slight forward lean. Raise dumbbells to side until parallel to floor.",
             "Lead with elbows, not wrists. Do not use momentum.", "Cable Lateral Raises", ""),

            # Arms
            ("Barbell Bicep Curls", "Arms", "Barbell", "Beginner", "Biceps Brachii",
             "Stand tall with elbows pinned to ribs. Curl bar towards shoulders, squeezing at peak.",
             "Avoid rocking back and forth.", "Dumbbell Curls, EZ Bar Curls", ""),
            ("Tricep Rope Pushdowns", "Arms", "Cable Machine", "Beginner", "Triceps Brachii",
             "Grip rope attachment with elbows tucked. Push down and spread rope apart at bottom.",
             "Keep upper arms stationary.", "Overhead Cable Extension, Skull Crushers", ""),

            # Legs
            ("Barbell Back Squat", "Legs", "Barbell", "Intermediate", "Quadriceps, Glutes, Adductors",
             "Bar across upper traps. Descend until hips are below parallel, knees tracking over toes.",
             "Keep chest proud and drive up evenly through midfoot.", "Goblet Squats, Leg Press", ""),
            ("Romanian Deadlift", "Legs", "Barbell/Dumbbells", "Intermediate", "Hamstrings, Glutes",
             "Slight knee bend. Push hips back as far as possible until feeling hamstring stretch.",
             "Bar path stays glued to legs.", "Dumbbell RDL, Glute Ham Raise", ""),

            # Core
            ("Hollow Body Plank", "Core", "Bodyweight", "Beginner", "Rectus Abdominis, Transverse Abdominis",
             "Forearms on ground, elbows below shoulders. Contract core, glutes, and quads.",
             "Do not let hips sag or hike into pike.", "Knee Plank, RKC Plank", ""),
            ("Hanging Leg Raises", "Core", "Pull-Up Bar", "Intermediate", "Lower Abdominals, Hip Flexors",
             "Hang from bar. Raise toes towards bar without swinging.",
             "Control lowering phase.", "Captain's Chair Knee Raises", ""),

            # Full Body
            ("Kettlebell Clean & Press", "Full body", "Kettlebell", "Intermediate", "Total Kinetic Chain",
             "Hinge, clean kettlebell to rack position, then press explosively overhead.",
             "Absorb force smoothly in rack.", "Dumbbell Thrusters", ""),

            # Mobility & Stretching
            ("World's Greatest Stretch", "Mobility", "Bodyweight", "Beginner", "Thoracic Spine, Hip Flexors, Hamstrings",
             "Deep lunge forward, place same-side hand down and rotate torso towards ceiling.",
             "Breathe deeply into rotation.", "Cat-Cow, Hip 90/90", ""),
            ("Deep Hamstring & Hip Opener", "Stretching", "Bodyweight", "Beginner", "Posterior Chain",
             "Seated forward fold or standing hinge with relaxed neck.",
             "Never force beyond mild tension.", "Lying Hamstring Band Stretch", ""),

            # Cardio
            ("High-Intensity Cyber Sprints", "Cardio", "Treadmill/Track", "Intermediate", "Cardiovascular, Fast-Twitch Fibers",
             "Sprint for 30 seconds at 85-90% max speed, followed by 60 seconds slow walk recovery.",
             "Perform proper dynamic warm-up first.", "Rowing Machine Sprints, Assault Bike Intervals", "")
        ]

        for name, cat, eq, diff, musc, inst, safe, alt, img in exercises_data:
            ex = Exercise(
                name=name, category=cat, equipment=eq, difficulty=diff,
                muscle_group=musc, instructions=inst, safety_tips=safe,
                alternatives=alt, image_url=img
            )
            db.add(ex)
        db.commit()

        # 3. Quests (Daily & Weekly)
        quests_data = [
            ("Complete a workout", "Log any gym or fitness session in ASCEND", "Fitness", "Normal", 1, 1, "session", 200, 50, False, False),
            ("Run 3 km", "Hit the road or treadmill for a 3km cyber run", "Running", "Normal", 1, 3, "km", 300, 75, False, False),
            ("Read for 20 min", "Expand your mind with focused learning or reading", "Learning", "Easy", 0, 1, "session", 150, 40, False, False),
            ("Maintain 5 Habits", "Check in at least 5 habits today", "Habit", "Hard", 4, 5, "habits", 250, 60, False, False),
            ("Deep Work Sprint", "Complete 45 minutes of laser-focused coding or study", "Productivity", "Normal", 1, 1, "session", 180, 50, True, False),
            # Weekly Missions
            ("Master of Iron", "Complete 4 comprehensive strength workouts this week", "Fitness", "Elite", 3, 4, "sessions", 800, 250, False, True),
            ("Cyber Marathon", "Accumulate 20 km total running distance this week", "Running", "Elite", 12, 20, "km", 950, 300, False, True),
            ("Code Architect", "Log 8 hours of software development practice", "Learning", "Hard", 6, 8, "hours", 700, 200, False, True)
        ]

        for title, desc, cat, diff, prog, tgt, unit, xp_r, cr_r, is_c, is_w in quests_data:
            q = Quest(
                user_id=user.id, title=title, description=desc, category=cat,
                difficulty=diff, progress=prog, target=tgt, unit=unit,
                xp_reward=xp_r, credits_reward=cr_r, is_completed=is_c, is_weekly=is_w
            )
            db.add(q)
        db.commit()

        # 4. Skill Tree Nodes
        skills_data = [
            ("fit_1", "Fitness", "Hypertrophy Foundations", "Increases strength gains by 10%", 1, 1, "dumbbell", None, "strength", 5),
            ("fit_2", "Fitness", "Metabolic Engine", "Boosts cardiovascular endurance and agility", 2, 2, "flame", "fit_1", "agility", 8),
            ("fit_3", "Fitness", "Titan Conditioning", "Max strength threshold unlocked", 3, 3, "shield", "fit_2", "strength", 12),
            ("code_1", "Coding", "Algorithmic Thinking", "Boosts logical problem solving and focus", 1, 1, "code", None, "intelligence", 5),
            ("code_2", "Coding", "System Architecture", "Advanced full-stack mastery and mental models", 2, 2, "cpu", "code_1", "intelligence", 10),
            ("code_3", "Coding", "Cyber Cognition", "Peak flow-state coding velocity", 3, 3, "terminal", "code_2", "focus", 12),
            ("foc_1", "Focus", "Deep Work Initiate", "Extends undisturbed attention span to 45m", 1, 1, "target", None, "focus", 5),
            ("foc_2", "Focus", "Monk Protocol", "Blocks digital distractions effortlessly", 2, 2, "zap", "foc_1", "focus", 8),
            ("foc_3", "Focus", "Singularity Flow", "Induces instant deep focus on command", 3, 3, "eye", "foc_2", "focus", 12),
            ("hab_1", "Consistency", "Routine Lock", "Habit streaks generate bonus credits", 1, 1, "calendar", None, "consistency", 6),
            ("hab_2", "Consistency", "Unshakable Will", "Missed days no longer break momentum", 2, 2, "award", "hab_1", "consistency", 10),
            ("cre_1", "Creativity", "Cyber Synthesis", "Combines disparate domains into novel ideas", 1, 1, "palette", None, "creativity", 6),
            ("cre_2", "Creativity", "Holographic Vision", "Peak intuitive design and visionary output", 2, 2, "sparkles", "cre_1", "creativity", 10),
        ]

        for s_id, cat, name, desc, tier, cost, icon, parent, attr, bonus in skills_data:
            sn = SkillNode(
                id=s_id, category=cat, name=name, description=desc,
                tier=tier, cost=cost, icon=icon, parent_id=parent,
                attribute_bonus=attr, bonus_amount=bonus
            )
            db.add(sn)
        db.commit()

        # Unlock initial skills for AlexRiser
        for sid in ["fit_1", "fit_2", "code_1", "code_2", "foc_1", "hab_1", "cre_1"]:
            db.add(UserSkill(user_id=user.id, skill_id=sid))
        db.commit()

        # 5. Achievements
        achievements_data = [
            ("first_step", "First Evolution Step", "Complete your first task or habit in ASCEND", "zap", "General", 100, 50),
            ("iron_body", "Iron Form", "Log your first complete gym workout session", "activity", "Fitness", 250, 100),
            ("cyber_runner", "Neon Pavement", "Complete a GPS running activity", "compass", "Running", 250, 100),
            ("habit_streak_5", "Discipline Protocol", "Maintain a 5-day streak on any habit", "flame", "Consistency", 350, 150),
            ("rank_s_ascendant", "S-Rank Transcendent", "Reach S-Rank evolution status (Level 42+)", "award", "Progression", 1000, 500),
            ("focus_initiate", "Flow State Pioneer", "Complete your first deep Pomodoro session", "clock", "Focus", 200, 75),
            ("polymath", "Universal Mind", "Log learning hours across 3 distinct subjects", "book-open", "Learning", 300, 120),
            ("virtual_host", "Cyber Oasis", "Customize ALYA and visit her Virtual Lounge", "home", "Companion", 150, 50),
        ]

        for a_id, title, desc, icon, cat, xp_r, cr_r in achievements_data:
            ach = Achievement(
                id=a_id, title=title, description=desc, icon=icon,
                category=cat, xp_reward=xp_r, credits_reward=cr_r
            )
            db.add(ach)
        db.commit()

        # Unlock initial achievements for AlexRiser
        for aid in ["first_step", "iron_body", "cyber_runner", "habit_streak_5", "rank_s_ascendant"]:
            db.add(UserAchievement(user_id=user.id, achievement_id=aid))
        db.commit()

        # 6. Rewards Store Items
        store_items_data = [
            # Outfits
            ("outfit_vanguard", "Cyber Vanguard", "outfit", "Signature black, cyan, and silver combat suit", 0, 0, "cyber_vanguard", "shield"),
            ("outfit_nano", "Nano Athletic", "outfit", "Lightweight aerodynamic nanotech gym wear", 800, 0, "nano_athletic", "zap"),
            ("outfit_stealth", "Stealth Ops", "outfit", "Matte black tactical infiltration weave", 1200, 5, "stealth_ops", "crosshair"),
            ("outfit_valkyrie", "Celestial Valkyrie", "outfit", "Ethereal luminous white and gold armor", 2500, 15, "celestial_valkyrie", "star"),
            ("outfit_luminary", "Holo Luminary", "outfit", "Translucent prismatic holographic dress", 3500, 25, "holo_luminary", "sparkles"),

            # Hairstyles & Colors
            ("hair_twin_cyan", "Ice Blue Twin Tails", "hairstyle", "Flowing anime ice-blue twin tails", 0, 0, "ice_blue", "user"),
            ("hair_neon_violet", "Cyber Violet Waves", "hairstyle", "Luminescent electric purple flowing hair", 600, 0, "neon_violet", "feather"),
            ("hair_starlight_gold", "Starlight Gold Bob", "hairstyle", "Chic modern cut with gold shimmer highlights", 900, 2, "starlight_gold", "sun"),

            # Accessories & Holograms
            ("acc_visor", "Holo Cyber Visor", "accessory", "Cyan holographic HUD ocular display", 500, 0, "holo_visor", "eye"),
            ("acc_wings", "Quantum Wings", "accessory", "Floating neon cyan energy stabilizer wings", 1500, 10, "quantum_wings", "wind"),
            ("aura_pulse", "Electric Neon Pulse", "aura", "Radiating electric blue energy waves", 800, 2, "aura_pulse", "activity"),
            ("aura_matrix", "Matrix Data Cascade", "aura", "Green and cyan quantum code rain aura", 1400, 8, "aura_matrix", "code"),

            # Room Decors
            ("room_cyber_cat", "Cyber Pet Robo-Cat", "room_decor", "Autonomous robotic feline companion with blue LED eyes", 1000, 5, "cyber_cat", "smile"),
            ("room_holo_globe", "Holographic Terra Globe", "room_decor", "3D floating cyber-projection of planet Earth", 750, 0, "holo_globe", "globe"),
            ("room_synth_station", "Cyber Synthwave Rig", "room_decor", "Futuristic neon sound workstation with glowing keys", 1200, 5, "synth_rig", "music"),
            ("room_lounge_sofa", "Neo-Tokyo Luxury Sofa", "room_decor", "Deep purple and cyan illuminated lounge sofa", 0, 0, "luxury_sofa", "home"),
        ]

        for s_id, name, cat, desc, cost_cr, cost_sh, key, icon in store_items_data:
            si = StoreItem(
                id=s_id, name=name, category=cat, description=desc,
                cost_credits=cost_cr, cost_shards=cost_sh, asset_key=key, icon=icon
            )
            db.add(si)
        db.commit()

        # Give AlexRiser starter items
        for item_id in ["outfit_vanguard", "hair_twin_cyan", "acc_visor", "room_cyber_cat", "room_lounge_sofa"]:
            db.add(UserInventory(user_id=user.id, item_id=item_id, is_equipped=True))
        db.commit()

        # 7. Seed Tasks
        tasks_data = [
            ("Design Neural Architecture for ASCEND", "Implement transformer embedding layer for AI cognition module", "Coding", "Urgent", "2026-11-01", "in_progress", 80),
            ("Bench Press & Upper Body Session", "4 sets of 8 reps target 100kg + accessory work", "Fitness", "High", "2026-10-31", "todo", 60),
            ("5.12km Twilight Cyber Run", "Pace target 5:30/km across downtown route", "Fitness", "Medium", "2026-10-31", "done", 75),
            ("Quantum Computing Research Paper", "Read Chapter 4 on Shor's algorithm and qubit coherence", "Study", "Medium", "2026-11-02", "todo", 50),
            ("Voice Synthesis Waveform Tuning", "Calibrate ALYA's audio pitch and warmth curve", "Projects", "Low", "2026-11-03", "todo", 40),
            ("Grocery Re-supply: High Protein", "Chicken breast, Greek yogurt, salmon, blueberries", "Personal", "Low", "2026-10-31", "done", 30),
        ]

        for title, desc, cat, prio, due, st, xp_r in tasks_data:
            t = Task(
                user_id=user.id, title=title, description=desc, category=cat,
                priority=prio, due_date=due, status=st, xp_reward=xp_r
            )
            db.add(t)
        db.commit()

        # 8. Seed Habits & Daily Logs
        habits_data = [
            ("Morning Hydration & Electrolytes", "Fitness", "daily", 14, 28, "2026-10-31", 30),
            ("Cold Recovery Shower", "Fitness", "daily", 12, 12, "2026-10-31", 35),
            ("10,000 Evolution Steps", "Fitness", "daily", 22, 35, "2026-10-31", 40),
            ("30 Min Deep Coding / Reading", "Study", "daily", 18, 25, "2026-10-31", 45),
            ("Evening Digital Detox & Journal", "Personal", "daily", 9, 14, "2026-10-30", 30),
        ]

        today_str = datetime.date.today().isoformat()
        for title, cat, freq, streak, best, last_c, xp_r in habits_data:
            h = Habit(
                user_id=user.id, title=title, category=cat, frequency=freq,
                streak=streak, best_streak=best, last_completed=last_c, xp_reward=xp_r
            )
            db.add(h)
            db.commit()
            db.refresh(h)
            
            # Add past 7 days completion logs
            for days_ago in range(7):
                d = (datetime.date.today() - datetime.timedelta(days=days_ago)).isoformat()
                db.add(HabitLog(habit_id=h.id, user_id=user.id, completed_date=d))
        db.commit()

        # 9. Seed Activities (Running, Walking, Cycling) matching visual reference
        sample_coords = [
            {"lat": 37.7749, "lng": -122.4194},
            {"lat": 37.7760, "lng": -122.4180},
            {"lat": 37.7785, "lng": -122.4150},
            {"lat": 37.7810, "lng": -122.4120},
            {"lat": 37.7830, "lng": -122.4080},
            {"lat": 37.7820, "lng": -122.4040},
            {"lat": 37.7790, "lng": -122.4060},
            {"lat": 37.7760, "lng": -122.4100},
            {"lat": 37.7749, "lng": -122.4194}
        ]

        # 5.12 km Run (exact match to visual image 1 & 2!)
        run_act = Activity(
            user_id=user.id,
            activity_type="running",
            distance_km=5.12,
            duration_seconds=1716,  # 28:36
            pace_min_per_km=5.58,   # 5:36 /km
            speed_kmh=10.74,
            calories=432,
            elevation_m=48.5,
            route_coords_json=json.dumps(sample_coords),
            is_simulation=False,
            notes="Twilight cyber sprint. Consistent breathing, feeling powerful!"
        )
        db.add(run_act)

        # Walking session
        walk_act = Activity(
            user_id=user.id,
            activity_type="walking",
            distance_km=3.4,
            duration_seconds=2280,
            pace_min_per_km=11.17,
            speed_kmh=5.37,
            calories=180,
            elevation_m=12.0,
            route_coords_json=json.dumps(sample_coords[:5]),
            is_simulation=False,
            notes="Morning sunlight walk with ALYA podcast stream"
        )
        db.add(walk_act)

        # Cycling session
        cycle_act = Activity(
            user_id=user.id,
            activity_type="cycling",
            distance_km=14.8,
            duration_seconds=2400,
            pace_min_per_km=2.7,
            speed_kmh=22.2,
            calories=510,
            elevation_m=125.0,
            route_coords_json=json.dumps(sample_coords),
            is_simulation=False,
            notes="Interval hill climbs through neon district"
        )
        db.add(cycle_act)
        db.commit()

        # 10. Workout Session
        bench_session = WorkoutSession(
            user_id=user.id,
            name="Cyber Strength Protocol: Upper Heavy",
            duration_seconds=3120, # 52 minutes
            calories_burned=480,
            xp_earned=250,
            exercises_logged_json=json.dumps([
                {"name": "Barbell Bench Press", "sets": [{"reps": 8, "weight": 95}, {"reps": 8, "weight": 95}, {"reps": 7, "weight": 100}, {"reps": 6, "weight": 100}]},
                {"name": "Bent-Over Barbell Row", "sets": [{"reps": 10, "weight": 80}, {"reps": 10, "weight": 80}, {"reps": 8, "weight": 85}]},
                {"name": "Standing Overhead Barbell Press", "sets": [{"reps": 8, "weight": 60}, {"reps": 8, "weight": 60}, {"reps": 7, "weight": 60}]},
                {"name": "Tricep Rope Pushdowns", "sets": [{"reps": 12, "weight": 35}, {"reps": 12, "weight": 35}]}
            ]),
            notes="Excellent chest activation and solid lockout on final press set."
        )
        db.add(bench_session)
        db.commit()

        # 11. Calendar Events (matching visual screenshot)
        cal_events = [
            ("Gym Workout: Upper Strength", "Heavy bench press, rows, and shoulder accessories", "Workout", "2026-10-31 06:00", "2026-10-31 07:30", False, "daily"),
            ("Study Session: Quantum AI", "Deep research into transformer architectures", "Study", "2026-10-31 10:00", "2026-10-31 11:30", False, "none"),
            ("Evening Twilight Run", "5km rhythmic cardio recovery route", "Run", "2026-10-31 19:00", "2026-10-31 20:00", False, "daily"),
            ("Weekly Evolution Review with ALYA", "Review XP gains, rank progression, and weekly goals", "Routine", "2026-11-01 18:00", "2026-11-01 18:45", False, "weekly")
        ]

        for title, desc, cat, st, et, allday, rec in cal_events:
            ce = CalendarEvent(
                user_id=user.id, title=title, description=desc,
                category=cat, start_time=st, end_time=et,
                is_all_day=allday, recurrence=rec
            )
            db.add(ce)
        db.commit()

        # 12. Sleep Record
        sleep_rec = SleepRecord(
            user_id=user.id,
            date="2026-10-30",
            sleep_hours=7.5,
            sleep_quality=92,
            resting_heart_rate=58,
            recovery_score=94,
            mood="Invigorated",
            energy_level=9,
            notes="Deep REM sleep verified. Woke up refreshed before the alarm."
        )
        db.add(sleep_rec)
        db.commit()

        # 13. ALYA Preferences & Welcome Messages
        alya_pref = AlyaPreference(
            user_id=user.id,
            hairstyle="flowing_twin",
            hair_color="ice_blue",
            outfit="cyber_vanguard",
            accessory="holo_visor",
            eye_glow="cyan_nova",
            aura_effect="quantum_orbit",
            background_theme="orbital_command",
            voice_enabled=True,
            voice_pitch=1.1,
            voice_rate=1.0,
            personality_style="playful_supportive"
        )
        db.add(alya_pref)

        msg1 = AlyaMessage(
            user_id=user.id,
            role="alya",
            content="Welcome back, Alex! All evolution systems are online and primed. Level 42 S-Rank status synchronized. What shall we conquer today?",
            action_type="status_sync"
        )
        db.add(msg1)

        # 14. Notifications
        notifs = [
            ("⚡ S-RANK STABILITY", "Your performance metrics place you in the top 1% of Ascendants.", "rank"),
            ("🏆 QUEST COMPLETED", "Completed 'Complete a Workout' +200 XP, +50 Credits.", "quest"),
            ("🔥 HABIT MILESTONE", "14-day hydration streak achieved! Momentum bonus applied.", "habit"),
            ("💙 ALYA MESSAGE", "Remember to hydrate before your evening run. You've got this!", "alya")
        ]
        for title, msg, cat in notifs:
            db.add(Notification(user_id=user.id, title=title, message=msg, category=cat, is_read=False))

        # 15. Community Challenges
        challenges = [
            ("Cyber City Marathon", "Run a cumulative 50km with the global Ascend community", "Running", 50.0, 32.4, 3840, 1000, "2026-11-15"),
            ("Iron Mind 30-Day Protocol", "Check in all core habits for 30 consecutive days", "Habits", 30.0, 19.0, 5120, 1500, "2026-11-30"),
            ("One Million Push-Ups Collective", "Community collective total push-up challenge", "Fitness", 1000000.0, 742100.0, 18900, 2000, "2026-12-31")
        ]
        for title, desc, cat, tgt, curr, parts, xp_r, end_d in challenges:
            db.add(CommunityChallenge(
                title=title, description=desc, category=cat,
                target_value=tgt, current_value=curr,
                participants_count=parts, xp_reward=xp_r, end_date=end_d
            ))

        db.commit()
    finally:
        db.close()

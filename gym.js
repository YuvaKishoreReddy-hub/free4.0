// ==========================================================================
// ⚡ ASCEND 4.0 — GYM & WORKOUT PLANNER VIEW
// ==========================================================================

const GymView = {
  activeSession: null,
  restTimer: null,
  restSecondsLeft: 45,

  async render(container) {
    try {
      const history = await API.fitness.getHistory();
      const exercises = await API.fitness.getExercises();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">GYM & WORKOUT PLANNER</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Design your workout protocols, track live sets & reps, and calibrate rest intervals.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn btn-secondary" onclick="window.app.navigate('exercises')">📚 Exercise Library</button>
            <button class="cyber-btn" onclick="GymView.startNewWorkout()">⚡ Start Live Session</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Active Workout Panel -->
          <div class="cyber-card" id="gym-active-card">
            ${this.renderActiveWorkoutUI()}
          </div>

          <!-- Right: Recent Workout History -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Workout Stats -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📊</span> Fitness Telemetry</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; text-align: center;">
                <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md);">
                  <div style="font-size: 11px; color: var(--text-muted);">COMPLETED SESSIONS</div>
                  <div style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; color: var(--neon-cyan); margin-top: 4px;">${history.length}</div>
                </div>
                <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md);">
                  <div style="font-size: 11px; color: var(--text-muted);">AVG DURATION</div>
                  <div style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; color: var(--ascend-gold); margin-top: 4px;">48 min</div>
                </div>
              </div>
            </div>

            <!-- Workout History Logs -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📜</span> Session History</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
                ${history.length ? history.map(s => `
                  <div style="padding: 12px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${s.name}</span>
                      <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-family-display); font-weight: 700;">+${s.xp_earned} XP</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${Math.round(s.duration_seconds / 60)} min • ${s.calories_burned} kcal</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                `).join('') : `
                  <div style="color: var(--text-muted); font-size: 12px;">No logged sessions yet. Start your first session!</div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading gym planner.</div>`;
    }
  },

  renderActiveWorkoutUI() {
    if (!this.activeSession) {
      return `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🏋️‍♂️</div>
          <h2 style="font-family: var(--font-family-display); font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">NO ACTIVE WORKOUT IN PROGRESS</h2>
          <p style="color: var(--text-secondary); font-size: 13.5px; max-width: 480px; margin: 0 auto 24px;">Activate your protocol to log sets, track reps and weights, and enable ALYA's rest interval guidance.</p>
          <button class="cyber-btn" onclick="GymView.startNewWorkout()">⚡ Start Cyber Strength Protocol</button>
        </div>
      `;
    }

    const s = this.activeSession;
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <span style="padding: 3px 8px; border-radius: 6px; background: rgba(0, 229, 255, 0.15); color: var(--neon-cyan); font-size: 10px; font-weight: 700; font-family: var(--font-family-display);">LIVE PROTOCOL</span>
            <h2 style="font-family: var(--font-family-display); font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${s.name}</h2>
          </div>
          <button class="cyber-btn btn-danger cyber-btn-sm" onclick="GymView.finishWorkout()">Finish Workout ✓</button>
        </div>

        <!-- Exercise Focus & Rest Timer Display -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div style="padding: 16px; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-glow); border-radius: var(--radius-md);">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Current Focus</div>
            <div style="font-family: var(--font-family-display); font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">Barbell Bench Press</div>
            <div style="font-size: 12.5px; color: var(--neon-cyan); margin-top: 4px;">Set 2 / 4 • Target: 8 Reps @ 100kg</div>
            <div style="font-size: 11px; color: var(--matrix-green); margin-top: 8px;">ALYA: "Keep your chest high and drive powerfully from the bottom!"</div>
          </div>

          <!-- Rest Countdown Clock -->
          <div style="padding: 16px; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Rest Interval Countdown</div>
            <div style="font-family: var(--font-family-display); font-size: 36px; font-weight: 800; color: var(--neon-cyan); margin: 4px 0;" id="gym-rest-clock">
              00:${this.restSecondsLeft < 10 ? '0' : ''}${this.restSecondsLeft}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px;">
              <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="GymView.startRestTimer(45)">Reset 45s</button>
              <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="GymView.startRestTimer(90)">90s Heavy</button>
            </div>
          </div>
        </div>

        <!-- Sets Logger Table -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-family: var(--font-family-display); font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">COMPLETED SETS LOG</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(13, 22, 41, 0.5); border-radius: var(--radius-sm); border-left: 3px solid var(--matrix-green);">
              <span style="font-weight: 700;">Set 1</span>
              <span>100 kg × 8 reps</span>
              <span style="color: var(--matrix-green); font-size: 12px;">✓ Completed</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(13, 22, 41, 0.5); border-radius: var(--radius-sm); border-left: 3px solid var(--neon-cyan);">
              <span style="font-weight: 700;">Set 2</span>
              <span>100 kg × 8 reps</span>
              <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="GymView.logSet(2)">Log Set ✓</button>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(13, 22, 41, 0.3); border-radius: var(--radius-sm); color: var(--text-muted);">
              <span>Set 3</span>
              <span>100 kg × 7 reps</span>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  startNewWorkout() {
    this.activeSession = {
      name: "Cyber Strength Protocol: Upper Heavy",
      duration_seconds: 1800,
      calories_burned: 420,
      exercises: []
    };
    this.startRestTimer(45);
    window.store.showToast("Workout Started", "Cyber Strength protocol engaged. ALYA is monitoring your sets!", "success");
    const card = document.getElementById('gym-active-card');
    if (card) card.innerHTML = this.renderActiveWorkoutUI();
  },

  startRestTimer(seconds) {
    clearInterval(this.restTimer);
    this.restSecondsLeft = seconds;
    const clockEl = document.getElementById('gym-rest-clock');
    if (clockEl) clockEl.textContent = `00:${this.restSecondsLeft < 10 ? '0' : ''}${this.restSecondsLeft}`;

    this.restTimer = setInterval(() => {
      this.restSecondsLeft--;
      const el = document.getElementById('gym-rest-clock');
      if (el) el.textContent = `00:${this.restSecondsLeft < 10 ? '0' : ''}${this.restSecondsLeft}`;

      if (this.restSecondsLeft <= 3 && this.restSecondsLeft > 0) {
        window.store.playUiSound('beep');
      }

      if (this.restSecondsLeft <= 0) {
        clearInterval(this.restTimer);
        window.store.playUiSound('success');
        window.voiceSystem.speak("Rest interval complete! Time for the next set.");
        window.store.showToast("Rest Over", "Rest countdown finished. Time to crush the next set!", "info");
      }
    }, 1000);
  },

  logSet(setNum) {
    window.store.playUiSound('click');
    window.store.showToast("Set Recorded", `Set ${setNum} locked in! Starting rest timer.`, "success");
    this.startRestTimer(60);
  },

  async finishWorkout() {
    if (!this.activeSession) return;
    try {
      clearInterval(this.restTimer);
      const res = await API.fitness.recordWorkout({
        name: this.activeSession.name,
        duration_seconds: 2400,
        calories_burned: 460,
        exercises_logged_json: JSON.stringify([{"name": "Barbell Bench Press", "sets": 4}]),
        notes: "Solid push day. Form maintained across all sets."
      });

      this.activeSession = null;
      window.store.showToast("Workout Finished", `Session completed! +${res.xp_earned} Strength XP, +50 Credits.`, "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not save workout session.", "danger");
    }
  }
};

window.GymView = GymView;

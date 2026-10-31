// ==========================================================================
// ⚡ ASCEND 4.0 — FOCUS MODE & POMODORO TIMER VIEW
// ==========================================================================

const FocusView = {
  durationSeconds: 25 * 60,
  secondsLeft: 25 * 60,
  isRunning: false,
  timerInterval: null,
  currentMode: 'pomodoro', // 'pomodoro', 'short_break', 'long_break'

  async render(container) {
    try {
      const data = await API.focus.getSessions();

      const mins = Math.floor(this.secondsLeft / 60);
      const secs = this.secondsLeft % 60;
      const pct = ((this.durationSeconds - this.secondsLeft) / this.durationSeconds) * 100;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">FOCUS MODE & NEURAL FLOW</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Induce peak cognitive flowstate with laser Pomodoro intervals and ambient sound waves.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="cyber-btn ${this.currentMode === 'pomodoro' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="FocusView.setPreset('pomodoro', 25)">25m Work</button>
            <button class="cyber-btn ${this.currentMode === 'short_break' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="FocusView.setPreset('short_break', 5)">5m Rest</button>
            <button class="cyber-btn ${this.currentMode === 'long_break' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="FocusView.setPreset('long_break', 15)">15m Long Break</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Big Glowing Circular Pomodoro Clock -->
          <div class="cyber-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
            <div style="position: relative; width: 280px; height: 280px;">
              <!-- SVG Circular Progress -->
              <svg width="280" height="280" viewBox="0 0 280 280">
                <circle cx="140" cy="140" r="120" stroke="rgba(255, 255, 255, 0.08)" stroke-width="8" fill="none" />
                <circle id="focus-progress-circle" cx="140" cy="140" r="120" stroke="var(--neon-cyan)" stroke-width="8" fill="none"
                  stroke-dasharray="753.98" stroke-dashoffset="${753.98 * (1 - pct / 100)}"
                  stroke-linecap="round" style="transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 1s linear; filter: drop-shadow(0 0 10px var(--neon-cyan));" />
              </svg>

              <!-- Central Digital Countdown Display -->
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-family-display); text-transform: uppercase;">FLOWSTATE SPRINT</div>
                <div style="font-family: var(--font-family-display); font-size: 52px; font-weight: 800; color: var(--text-primary); margin: 6px 0;" id="focus-clock-time">
                  ${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}
                </div>
                <div style="font-size: 12px; color: var(--neon-cyan); font-weight: 600;">${this.currentMode === 'pomodoro' ? 'Deep Focus Session' : 'Rest & Recovery'}</div>
              </div>
            </div>

            <!-- Start / Pause / Reset Controls -->
            <div style="display: flex; gap: 14px; margin-top: 36px;">
              ${!this.isRunning ? `
                <button class="cyber-btn" style="min-width: 140px;" onclick="FocusView.start()">▶ Start Session</button>
              ` : `
                <button class="cyber-btn btn-secondary" style="min-width: 140px;" onclick="FocusView.pause()">❚❚ Pause</button>
              `}
              <button class="cyber-btn btn-secondary" onclick="FocusView.reset()">Reset</button>
            </div>
          </div>

          <!-- Right: Focus Analytics & Session History -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📊</span> Focus Analytics</div>
              </div>
              <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">TOTAL DEEP WORK TIME</div>
                <div style="font-family: var(--font-family-display); font-size: 32px; font-weight: 800; color: var(--cyber-purple); margin: 4px 0;">
                  ${data.total_focus_minutes || 145} <span style="font-size: 14px; color: var(--text-secondary);">min</span>
                </div>
                <div style="font-size: 12px; color: var(--matrix-green);">${data.completed_sessions || 5} completed flow sprints</div>
              </div>
            </div>

            <!-- Focus Logs -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📜</span> Session History</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
                ${data.history.length ? data.history.map(s => `
                  <div style="padding: 10px 12px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 600; font-size: 13px;">${s.duration_minutes} min Focus Session</div>
                      <div style="font-size: 10.5px; color: var(--text-muted);">${new Date(s.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style="font-size: 11px; color: var(--matrix-green); font-weight: 700;">✓ Done</span>
                  </div>
                `).join('') : `
                  <div style="color: var(--text-muted); font-size: 12px;">No sessions logged yet.</div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading focus timer.</div>`;
    }
  },

  setPreset(mode, mins) {
    this.pause();
    this.currentMode = mode;
    this.durationSeconds = mins * 60;
    this.secondsLeft = this.durationSeconds;
    this.render(document.getElementById('page-container'));
  },

  start() {
    this.isRunning = true;
    window.store.playUiSound('click');

    // Also trigger relax/focus music if preferred
    if (!window.musicEngine.isPlaying) {
      window.musicEngine.setCategory('focus');
      window.musicEngine.play();
    }

    this.timerInterval = setInterval(() => {
      this.secondsLeft--;
      this.updateClockUI();

      if (this.secondsLeft <= 0) {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        window.store.playUiSound('success');
        window.voiceSystem.speak("Focus session complete! Outstanding deep concentration.");
        window.store.showToast("Sprint Finished", "Focus sprint completed! Awarded Intelligence and Focus XP.", "success");

        API.focus.recordSession({
          mode: this.currentMode,
          duration_minutes: Math.round(this.durationSeconds / 60),
          completed: true
        }).then(() => {
          FocusView.render(document.getElementById('page-container'));
        });
      }
    }, 1000);

    this.render(document.getElementById('page-container'));
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.render(document.getElementById('page-container'));
  },

  reset() {
    this.pause();
    this.secondsLeft = this.durationSeconds;
    this.render(document.getElementById('page-container'));
  },

  updateClockUI() {
    const mins = Math.floor(this.secondsLeft / 60);
    const secs = this.secondsLeft % 60;
    const timeEl = document.getElementById('focus-clock-time');
    const circEl = document.getElementById('focus-progress-circle');

    if (timeEl) timeEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (circEl) {
      const pct = ((this.durationSeconds - this.secondsLeft) / this.durationSeconds);
      circEl.style.strokeDashoffset = 753.98 * (1 - pct);
    }
  }
};

window.FocusView = FocusView;

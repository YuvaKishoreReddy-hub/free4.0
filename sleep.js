// ==========================================================================
// ⚡ ASCEND 4.0 — SLEEP & RECOVERY JOURNAL VIEW
// ==========================================================================

const SleepView = {
  async render(container) {
    try {
      const data = await API.sleep.getRecords();
      const summary = data.summary;
      const history = data.history;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">SLEEP & RECOVERY OPTIMIZATION</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Monitor circadian sleep stages, resting heart rate, recovery scores, and daily mood.</p>
          </div>
          <button class="cyber-btn" onclick="SleepView.openLogModal()">+ Check In Sleep</button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Sleep Metrics & Recovery History -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Recovery Score Summary Cards -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🌙</span> Recovery Readiness Status</div>
                <span style="font-size: 11px; color: var(--matrix-green); font-family: var(--font-family-display); font-weight: 700;">PHYSIOLOGICAL EQUILIBRIUM</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md);">
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Avg Sleep Duration</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--neon-cyan); margin-top: 4px;">
                    ${summary.average_sleep_hours} <span style="font-size: 14px;">hrs</span>
                  </div>
                </div>

                <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md);">
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Recovery Score</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--matrix-green); margin-top: 4px;">
                    ${summary.average_recovery_score}%
                  </div>
                </div>

                <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md);">
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Resting Pulse</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--ascend-gold); margin-top: 4px;">
                    58 <span style="font-size: 14px;">bpm</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Historical Sleep Entries -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📜</span> Sleep Journal History</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${history.map(r => `
                  <div style="padding: 14px 18px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${r.date}</span>
                        <span style="font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(0, 229, 255, 0.15); color: var(--neon-cyan);">${r.mood}</span>
                        <span style="font-size: 11px; color: var(--text-muted);">Energy: ${r.energy_level}/10</span>
                      </div>
                      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${r.notes || 'Normal nocturnal cycle recorded.'}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--neon-cyan);">${r.sleep_hours} hrs</div>
                      <div style="font-size: 11px; color: var(--matrix-green); font-weight: 600;">${r.recovery_score}% Recovery</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right: Guidance & Wellness Disclaimer -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🧬</span> Circadian Calibration</div>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                Deep non-REM stage 3 sleep stimulates human growth hormone secretion, cellular protein synthesis, and neuroplastic consolidation.
              </p>
              <div style="padding: 10px 12px; background: rgba(13, 22, 41, 0.8); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-muted); line-height: 1.4; border-left: 2px solid var(--neon-cyan);">
                <em>${summary.disclaimer}</em>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading sleep records.</div>`;
    }
  },

  openLogModal() {
    const hrs = parseFloat(prompt("Hours of sleep last night (e.g. 7.5):", "7.5")) || 7.5;
    const energy = parseInt(prompt("Energy level on waking (1 - 10):", "8")) || 8;
    const mood = prompt("Morning mood (Energetic, Calm, Focused, Tired):", "Energetic") || "Energetic";
    const notes = prompt("Sleep reflections / Notes:") || "";

    const recovery = Math.min(100, Math.round((hrs / 8) * 60 + energy * 4));

    API.sleep.recordSleep({
      date: new Date().toISOString().split('T')[0],
      sleep_hours: hrs,
      sleep_quality: 88,
      resting_heart_rate: 60,
      recovery_score: recovery,
      mood: mood,
      energy_level: energy,
      notes: notes
    }).then(() => {
      window.store.showToast("Sleep Journaled", `Logged ${hrs}h of sleep with ${recovery}% recovery score!`, "success");
      SleepView.render(document.getElementById('page-container'));
    });
  }
};

window.SleepView = SleepView;

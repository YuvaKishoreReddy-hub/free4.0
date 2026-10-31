// ==========================================================================
// ⚡ ASCEND 4.0 — WALKING & CYCLING TRACKERS
// ==========================================================================

const WalkingCyclingView = {
  activeTab: 'walking', // 'walking' or 'cycling'

  async render(container, tab = 'walking') {
    this.activeTab = tab;
    try {
      const activities = await API.activities.list(this.activeTab);
      const isWalk = (this.activeTab === 'walking');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">
              ${isWalk ? 'WALKING TRACKER' : 'CYCLING TRACKER'}
            </h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">
              ${isWalk ? 'Track daily step cadence, aerobic walks, and active recovery.' : 'Log cycling speed, elevation gain, interval wattage, and routes.'}
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn ${isWalk ? '' : 'btn-secondary'} cyber-btn-sm" onclick="WalkingCyclingView.render(document.getElementById('page-container'), 'walking')">🚶 Walking</button>
            <button class="cyber-btn ${!isWalk ? '' : 'btn-secondary'} cyber-btn-sm" onclick="WalkingCyclingView.render(document.getElementById('page-container'), 'cycling')">🚴 Cycling</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Quick Log & Telemetry Panel -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">${isWalk ? '🚶' : '🚴'}</span> Log ${isWalk ? 'Walk' : 'Ride'} Session</div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Distance (km)</label>
                  <input type="number" step="0.1" class="cyber-input" id="act-dist" value="${isWalk ? '3.4' : '15.0'}" />
                </div>
                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Duration (min)</label>
                  <input type="number" class="cyber-input" id="act-dur" value="${isWalk ? '38' : '45'}" />
                </div>
                <div>
                  <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Calories (kcal)</label>
                  <input type="number" class="cyber-input" id="act-cal" value="${isWalk ? '180' : '480'}" />
                </div>
              </div>

              <button class="cyber-btn" style="width: 100%;" onclick="WalkingCyclingView.saveManualActivity()">
                Save ${isWalk ? 'Walking' : 'Cycling'} Activity ✓
              </button>
            </div>

            <!-- Historical Activities -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📜</span> Past ${isWalk ? 'Walks' : 'Rides'}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.length ? activities.map(a => `
                  <div style="padding: 12px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${a.distance_km} km</div>
                      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                        ${Math.round(a.duration_seconds / 60)} min • ${a.calories} kcal • Avg ${isWalk ? (a.pace_min_per_km + ' /km') : (a.speed_kmh + ' km/h')}
                      </div>
                    </div>
                    <span style="font-size: 11px; color: var(--neon-cyan);">${new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                `).join('') : `
                  <div style="color: var(--text-muted); font-size: 12px;">No logged activities found.</div>
                `}
              </div>
            </div>
          </div>

          <!-- Right: Summary Card -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">📊</span> Weekly Overview</div>
            </div>
            <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md); text-align: center; margin-bottom: 16px;">
              <div style="font-size: 11px; color: var(--text-muted);">TOTAL WEEKLY ${isWalk ? 'STEPS' : 'DISTANCE'}</div>
              <div style="font-family: var(--font-family-display); font-size: 32px; font-weight: 800; color: var(--neon-cyan); margin: 6px 0;">
                ${isWalk ? '52,480' : '64.2 km'}
              </div>
              <div style="font-size: 12px; color: var(--matrix-green);">Consistent recovery pacing</div>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              ${isWalk 
                ? 'Daily walking reduces cortisol, promotes lymphatic drainage, and steadily accumulates Agility & Consistency XP.'
                : 'Cycling increases lower body threshold power and VO2 max capacity without excessive joint impact.'}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading activity.</div>`;
    }
  },

  async saveManualActivity() {
    const dist = parseFloat(document.getElementById('act-dist').value) || 1.0;
    const durMin = parseInt(document.getElementById('act-dur').value) || 15;
    const cal = parseInt(document.getElementById('act-cal').value) || 100;
    const isWalk = (this.activeTab === 'walking');

    try {
      const res = await API.activities.record({
        activity_type: this.activeTab,
        distance_km: dist,
        duration_seconds: durMin * 60,
        pace_min_per_km: parseFloat((durMin / dist).toFixed(2)),
        speed_kmh: parseFloat(((dist / (durMin / 60))).toFixed(1)),
        calories: cal,
        is_simulation: false,
        notes: `Manual logged ${this.activeTab} session.`
      });

      window.store.showToast("Activity Saved", `Logged ${dist} km! +${res.xp_earned} XP awarded.`, "success");
      this.render(document.getElementById('page-container'), this.activeTab);
    } catch (e) {
      window.store.showToast("Error", "Could not save activity.", "danger");
    }
  }
};

window.WalkingCyclingView = WalkingCyclingView;

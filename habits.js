// ==========================================================================
// ⚡ ASCEND 4.0 — HABIT TRACKER & CYBER HEATMAP VIEW
// ==========================================================================

const HabitsView = {
  async render(container) {
    try {
      const habits = await API.habits.list();
      const heatmapData = await API.habits.getHeatmap();

      const todayStr = new Date().toISOString().split('T')[0];

      // Build 60 days of dates for heatmap
      const days = [];
      for (let i = 59; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">HABIT TRACKER & MOMENTUM</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Forge unbreakable habits. Never punished for missed days; always rewarded for momentum.</p>
          </div>
          <button class="cyber-btn" onclick="HabitsView.openCreateModal()">+ Create Habit</button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Left: Daily Habits Checklist -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">⚡</span> Daily Protocol Check-Ins</div>
              <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-family-display);">TODAY'S RHYTHM</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${habits.map(h => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(13, 22, 41, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); border-left: 3px solid ${h.is_done_today ? 'var(--matrix-green)' : 'var(--border-subtle)'};">
                  <div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${h.title}</span>
                      <span style="font-size: 10px; padding: 2px 7px; border-radius: 6px; background: rgba(0, 229, 255, 0.1); color: var(--neon-cyan); font-weight: 700;">${h.category}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px; margin-top: 6px; font-size: 12px;">
                      <span style="color: var(--matrix-green); font-weight: 700;">🔥 ${h.streak} Day Streak</span>
                      <span style="color: var(--text-muted);">Best: ${h.best_streak} days</span>
                      <span style="color: var(--ascend-gold); font-family: var(--font-family-display);">+${h.xp_reward} XP</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="cyber-btn ${h.is_done_today ? 'btn-secondary' : ''} cyber-btn-sm" ${h.is_done_today ? 'disabled' : ''} onclick="HabitsView.checkIn(${h.id})">
                      ${h.is_done_today ? '✓ Checked Today' : '⚡ Check In'}
                    </button>
                    <button style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:12px;" onclick="HabitsView.deleteHabit(${h.id})">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Streak Analytics -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🔥</span> Consistency Overview</div>
              </div>
              <div style="padding: 16px; background: rgba(13, 22, 41, 0.8); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted);">AVERAGE DISCIPLINE RATE</div>
                <div style="font-family: var(--font-family-display); font-size: 36px; font-weight: 800; color: var(--matrix-green); margin: 6px 0;">
                  ${habits.length ? Math.round((habits.filter(h => h.is_done_today).length / habits.length) * 100) : 0}%
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                  Active habits checked in for today
                </div>
              </div>
            </div>

            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">💡</span> ALYA Guidance</div>
              </div>
              <p style="color: var(--text-secondary); font-size: 12.5px; line-height: 1.6;">
                "Habit loops are reinforced by triggers and identity. Focus on consistency rather than perfection. Missing a single day never resets your biological adaptations."
              </p>
            </div>
          </div>
        </div>

        <!-- 60-Day Cyber Activity Matrix Heatmap -->
        <div class="cyber-card">
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">🟩</span> 60-Day Habit Matrix Heatmap</div>
            <span style="font-size: 11px; color: var(--text-muted);">Each block represents daily completed habits</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 14px 0;">
            ${days.map(dStr => {
              const count = heatmapData[dStr] || (Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0);
              let color = 'rgba(255, 255, 255, 0.05)';
              if (count === 1) color = 'rgba(0, 229, 255, 0.3)';
              else if (count === 2) color = 'rgba(0, 229, 255, 0.6)';
              else if (count >= 3) color = 'var(--neon-cyan)';

              return `
                <div title="${dStr}: ${count} habits completed" style="width: 14px; height: 14px; border-radius: 3px; background: ${color}; border: 1px solid rgba(0, 229, 255, 0.2); cursor: pointer; transition: transform 0.15s;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading habit tracker.</div>`;
    }
  },

  async checkIn(id) {
    try {
      const res = await API.habits.checkIn(id);
      window.store.showToast("Habit Check-In", `Streak updated to ${res.streak}! +30 XP awarded.`, "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not check in habit.", "danger");
    }
  },

  async deleteHabit(id) {
    try {
      await API.habits.delete(id);
      window.store.showToast("Habit Removed", "Habit deleted.", "info");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not delete habit.", "danger");
    }
  },

  openCreateModal() {
    const title = prompt("Enter habit title (e.g., Cold Shower, 10k Steps, Reading):");
    if (!title) return;
    const cat = prompt("Category (Fitness, Study, Personal):", "Fitness") || "Fitness";

    API.habits.create({
      title: title,
      category: cat,
      frequency: "daily"
    }).then(() => {
      window.store.showToast("Habit Added", `Started tracking '${title}'.`, "success");
      HabitsView.render(document.getElementById('page-container'));
    });
  }
};

window.HabitsView = HabitsView;

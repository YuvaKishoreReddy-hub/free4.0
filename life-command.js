// ==========================================================================
// ⚡ ASCEND 4.0 — LIFE COMMAND CENTER VIEW
// ==========================================================================

const LifeCommandView = {
  async render(container) {
    try {
      const tasks = await API.tasks.list();
      const habits = await API.habits.list();
      const events = await API.calendar.getEvents();

      // Hours 06:00 to 22:00
      const hours = [
        "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00", "22:00"
      ];

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">LIFE COMMAND CENTER</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Master daily planning, timeline execution, and priorities synchronization.</p>
          </div>
          <button class="cyber-btn" onclick="LifeCommandView.openNewTaskModal()">+ Add Schedule Block</button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Visual Daily Timeline -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">⏱️</span> Daily Evolution Timeline</div>
              <span style="font-size: 12px; color: var(--neon-cyan); font-family: var(--font-family-display);">TODAY'S PROTOCOL</span>
            </div>

            <div style="position: relative; padding-left: 60px;">
              <!-- Timeline vertical axis -->
              <div style="position: absolute; left: 60px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--neon-cyan), var(--cyber-purple), transparent);"></div>

              ${hours.map(hour => {
                const hourEvents = events.filter(e => e.start_time.includes(hour.split(':')[0]));
                return `
                  <div style="position: relative; margin-bottom: 28px; min-height: 40px;">
                    <!-- Hour label -->
                    <div style="position: absolute; left: -60px; top: -2px; font-family: var(--font-family-display); font-size: 11px; font-weight: 700; color: var(--text-muted); width: 45px; text-align: right;">${hour}</div>
                    
                    <!-- Timeline Node dot -->
                    <div style="position: absolute; left: -5px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: ${hourEvents.length ? 'var(--neon-cyan)' : 'var(--bg-card)'}; border: 2px solid ${hourEvents.length ? '#FFFFFF' : 'var(--border-subtle)'}; box-shadow: ${hourEvents.length ? 'var(--glow-cyan)' : 'none'}; z-index: 2;"></div>

                    <!-- Event Card -->
                    <div style="margin-left: 20px;">
                      ${hourEvents.length ? hourEvents.map(e => `
                        <div style="padding: 12px 16px; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-glow); border-radius: var(--radius-md); box-shadow: var(--glow-cyan); margin-bottom: 6px;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 700; color: var(--neon-cyan); font-size: 13.5px;">${e.title}</span>
                            <span style="font-size: 10px; padding: 2px 8px; border-radius: 8px; background: rgba(0, 229, 255, 0.2); color: var(--neon-cyan); font-weight: 700;">${e.category}</span>
                          </div>
                          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${e.description || 'Evolution timeblock scheduled.'}</div>
                        </div>
                      `).join('') : `
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.15); padding: 4px 0;">Available Focus Block</div>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Priorities & Habits Quick Matrix -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Top Priorities -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🎯</span> Critical Priorities</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${tasks.slice(0, 5).map(t => `
                  <div style="padding: 12px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${t.title}</div>
                      <div style="font-size: 11px; color: ${t.priority === 'Urgent' ? 'var(--neon-pink)' : 'var(--text-muted)'}; margin-top: 2px;">${t.priority} • ${t.category}</div>
                    </div>
                    <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="LifeCommandView.completeTask(${t.id})">Done</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Today's Habit Matrix -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🔥</span> Daily Habits Routine</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${habits.map(h => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm);">
                    <div>
                      <div style="font-weight: 600; font-size: 12.5px;">${h.title}</div>
                      <div style="font-size: 11px; color: var(--matrix-green);">${h.streak} day streak 🔥</div>
                    </div>
                    <button class="cyber-btn ${h.is_done_today ? 'btn-secondary' : ''} cyber-btn-sm" ${h.is_done_today ? 'disabled' : ''} onclick="LifeCommandView.checkInHabit(${h.id})">
                      ${h.is_done_today ? '✓ Checked' : 'Check In'}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading Life Command Center.</div>`;
    }
  },

  async completeTask(taskId) {
    try {
      await API.tasks.update(taskId, { status: 'done' });
      window.store.showToast("Task Finished", "Task completed! XP and attribute points synchronized.", "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not complete task.", "danger");
    }
  },

  async checkInHabit(habitId) {
    try {
      const res = await API.habits.checkIn(habitId);
      window.store.showToast("Habit Check-In", `Streak increased to ${res.streak}! +30 XP awarded.`, "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not check in habit.", "danger");
    }
  },

  openNewTaskModal() {
    window.app.navigate('tasks');
  }
};

window.LifeCommandView = LifeCommandView;

// ==========================================================================
// ⚡ ASCEND 4.0 — SMART CALENDAR & SCHEDULE VIEW
// ==========================================================================

const CalendarView = {
  viewMode: 'month', // 'month', 'week', 'day', 'agenda'

  async render(container) {
    try {
      const events = await API.calendar.getEvents();
      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">SMART CALENDAR & EVOLUTION AGENDA</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Synthesize workouts, deep study blocks, and routines with conflict detection.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <div style="display: flex; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2px;">
              <button class="cyber-btn ${this.viewMode === 'month' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="CalendarView.setView('month')">Month</button>
              <button class="cyber-btn ${this.viewMode === 'agenda' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="CalendarView.setView('agenda')">Agenda</button>
            </div>
            <button class="cyber-btn" onclick="CalendarView.openAddModal()">+ Add Event</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 24px;">
          <!-- Calendar Month Grid / Agenda -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">📅</span> ${monthNames[now.getMonth()]} ${now.getFullYear()}</div>
              <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-family-display);">CALENDAR MATRIX</span>
            </div>

            <!-- Days of Week Header -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 700; font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>

            <!-- Month Calendar Grid (35 Day Blocks) -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
              ${Array.from({ length: 35 }).map((_, i) => {
                const dayNum = ((i - 3) > 0 && (i - 3) <= 31) ? (i - 3) : '';
                const isToday = (dayNum === now.getDate());
                const dayEvents = events.filter(e => e.start_time.includes(`-${dayNum < 10 ? '0' + dayNum : dayNum}`));

                return `
                  <div style="min-height: 80px; padding: 6px; background: ${isToday ? 'rgba(0, 229, 255, 0.12)' : 'rgba(13, 22, 41, 0.6)'}; border: 1px solid ${isToday ? 'var(--neon-cyan)' : 'var(--border-subtle)'}; border-radius: var(--radius-sm); position: relative; ${isToday ? 'box-shadow: var(--glow-cyan);' : ''}">
                    <div style="font-family: var(--font-family-display); font-size: 11px; font-weight: 700; color: ${isToday ? 'var(--neon-cyan)' : (dayNum ? 'var(--text-primary)' : 'var(--text-muted)')}; text-align: right;">
                      ${dayNum}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 3px; margin-top: 4px;">
                      ${dayEvents.map(ev => `
                        <div style="padding: 2px 4px; background: rgba(0, 229, 255, 0.2); border-radius: 3px; font-size: 9.5px; color: var(--neon-cyan); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ev.title}">
                          ${ev.title}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Upcoming Scheduled Events -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">⏰</span> Upcoming Protocol</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${events.map(e => `
                <div style="padding: 12px; background: rgba(13, 22, 41, 0.7); border: 1px solid var(--border-subtle); border-left: 3px solid var(--neon-cyan); border-radius: var(--radius-sm);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${e.title}</span>
                    <button style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:11px;" onclick="CalendarView.deleteEvent(${e.id})">✕</button>
                  </div>
                  <div style="font-size: 11.5px; color: var(--neon-cyan); font-family: var(--font-family-display); margin-top: 4px;">${e.start_time}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${e.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading calendar.</div>`;
    }
  },

  setView(mode) {
    this.viewMode = mode;
    this.render(document.getElementById('page-container'));
  },

  async deleteEvent(id) {
    try {
      await API.calendar.deleteEvent(id);
      window.store.showToast("Event Deleted", "Calendar entry removed.", "info");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not delete event.", "danger");
    }
  },

  openAddModal() {
    const title = prompt("Enter Event Title:");
    if (!title) return;
    const cat = prompt("Category (Workout, Study, Run, Routine):", "Workout") || "Workout";
    const time = prompt("Start Time (YYYY-MM-DD HH:MM):", new Date().toISOString().slice(0, 10) + " 10:00") || "";

    API.calendar.createEvent({
      title: title,
      category: cat,
      start_time: time,
      end_time: time
    }).then(() => {
      window.store.showToast("Event Scheduled", `Added '${title}' to calendar.`, "success");
      CalendarView.render(document.getElementById('page-container'));
    });
  }
};

window.CalendarView = CalendarView;

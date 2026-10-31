// ==========================================================================
// ⚡ ASCEND 4.0 — NOTIFICATION SYSTEM VIEW
// ==========================================================================

const NotificationsView = {
  async render(container) {
    try {
      const data = await API.notifications.list();
      const notifs = data.notifications;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">NOTIFICATION CENTER</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Real-time evolution alerts, quest rewards, workout reminders, and ALYA messages.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="NotificationsView.requestBrowserPermissions()">🔔 Enable Browser Alerts</button>
            <button class="cyber-btn cyber-btn-sm" onclick="NotificationsView.markAllRead()">Mark All Read ✓</button>
          </div>
        </div>

        <div class="cyber-card">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${notifs.length ? notifs.map(n => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: ${n.is_read ? 'rgba(13, 22, 41, 0.5)' : 'rgba(0, 229, 255, 0.1)'}; border: 1px solid ${n.is_read ? 'var(--border-subtle)' : 'var(--neon-cyan)'}; border-radius: var(--radius-md);">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <span style="font-size: 20px;">
                    ${n.category === 'rank' ? '⚡' : (n.category === 'quest' ? '🏆' : (n.category === 'habit' ? '🔥' : '💙'))}
                  </span>
                  <div>
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${n.title}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 14px;">
                  <span style="font-size: 11px; color: var(--text-muted);">${n.created_at}</span>
                  ${!n.is_read ? `<button class="cyber-btn btn-secondary cyber-btn-sm" onclick="NotificationsView.markOneRead(${n.id})">Read</button>` : ''}
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No active notifications.</div>
            `}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading notifications.</div>`;
    }
  },

  async markAllRead() {
    try {
      await API.notifications.markAllRead();
      window.store.showToast("Notifications Read", "All alerts marked as read.", "info");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not mark read.", "danger");
    }
  },

  async markOneRead(id) {
    try {
      await API.notifications.markOneRead(id);
      this.render(document.getElementById('page-container'));
    } catch (e) {}
  },

  requestBrowserPermissions() {
    if (!("Notification" in window)) {
      window.store.showToast("Unsupported", "This browser does not support desktop notifications.", "info");
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        window.store.showToast("Notifications Enabled", "Browser alerts active for quest and workout reminders!", "success");
        new Notification("ASCEND 4.0", {
          body: "All evolution alerts synchronized with your browser.",
          icon: "/assets/ascend_showcase_1.jpg"
        });
      }
    });
  }
};

window.NotificationsView = NotificationsView;

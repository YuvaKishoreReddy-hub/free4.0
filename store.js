// ==========================================================================
// ⚡ ASCEND 4.0 — REACTIVE STORE & AUDIO FEEDBACK
// ==========================================================================

class AscendStore {
  constructor() {
    this.user = null;
    this.preferences = null;
    this.currentPage = 'dashboard';
    this.listeners = {};
    this.soundEnabled = true;
    this.audioCtx = null;
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Error in event listener for ${event}:`, e); }
      });
    }
  }

  setUser(user) {
    this.user = user;
    this.emit('user_updated', user);
  }

  async initUser() {
    try {
      const user = await API.auth.getMe();
      this.setUser(user);
      return user;
    } catch (e) {
      // Auto-login demo user
      try {
        const res = await API.auth.demoLogin();
        API.setToken(res.access_token);
        this.setUser(res.user);
        return res.user;
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }
    }
    return null;
  }

  // Sci-Fi UI Audio Synthesizer for buttons, alerts, level-ups
  playUiSound(type = 'click') {
    if (!this.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success' || type === 'levelup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.16); // E
        osc.frequency.setValueAtTime(880, now + 0.24);    // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // AudioContext blocked or unsupported
    }
  }

  // Toast Notification System
  showToast(title, message, type = 'info') {
    let container = document.getElementById('ascend-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ascend-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 85px;
        right: 25px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const borderColor = type === 'success' ? 'var(--matrix-green)' : (type === 'danger' ? 'var(--neon-pink)' : 'var(--neon-cyan)');
    const icon = type === 'success' ? '✓' : (type === 'danger' ? '⚠' : '⚡');

    toast.style.cssText = `
      min-width: 300px;
      max-width: 420px;
      background: rgba(13, 22, 41, 0.95);
      border-left: 4px solid ${borderColor};
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px ${borderColor}33;
      backdrop-filter: blur(12px);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
      pointer-events: auto;
    `;

    toast.innerHTML = `
      <div style="font-size: 20px; color: ${borderColor}; font-weight: bold;">${icon}</div>
      <div style="flex: 1;">
        <div style="font-family: var(--font-family-display); font-size: 13px; font-weight: 700; color: ${borderColor};">${title}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    this.playUiSound(type === 'success' ? 'success' : 'click');

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }
}

window.store = new AscendStore();

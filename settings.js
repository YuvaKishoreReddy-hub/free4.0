// ==========================================================================
// ⚡ ASCEND 4.0 — SETTINGS & SECURITY VIEW
// ==========================================================================

const SettingsView = {
  async render(container) {
    try {
      const user = await API.auth.getMe();
      const pref = await API.alya.getPreferences();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">SYSTEM SETTINGS & PRIVACY</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Manage profile parameters, AI companion telemetry, theme appearance, and privacy export controls.</p>
          </div>
          <button class="cyber-btn" onclick="SettingsView.saveSettings()">Save Configuration ✓</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Profile & Account Configuration -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">👤</span> Profile & Identity</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Username</label>
                <input type="text" class="cyber-input" id="set-username" value="${user.username}" disabled style="opacity: 0.7;" />
              </div>

              <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Email Address</label>
                <input type="email" class="cyber-input" id="set-email" value="${user.email}" disabled style="opacity: 0.7;" />
              </div>

              <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Age Range Cohort</label>
                <select class="cyber-input" id="set-age">
                  <option value="18-24" ${user.age_range === '18-24' ? 'selected' : ''}>18 - 24</option>
                  <option value="25-34" ${user.age_range === '25-34' ? 'selected' : ''}>25 - 34</option>
                  <option value="35-44" ${user.age_range === '35-44' ? 'selected' : ''}>35 - 44</option>
                  <option value="45+" ${user.age_range === '45+' ? 'selected' : ''}>45+</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">UI Visual Theme</label>
                <select class="cyber-input" id="set-theme" onchange="SettingsView.handleThemeChange(this.value)">
                  <option value="cyber-dark" ${user.theme === 'cyber-dark' ? 'selected' : ''}>Cyber Dark (Recommended)</option>
                  <option value="cyber-light" ${user.theme === 'cyber-light' ? 'selected' : ''}>Cyber Light</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ALYA Voice & Assistant Settings -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">🤖</span> ALYA Companion Preferences</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Personality Style</label>
                <select class="cyber-input" id="set-personality">
                  <option value="playful_supportive" ${pref.personality_style === 'playful_supportive' ? 'selected' : ''}>Playful & Supportive (Signature)</option>
                  <option value="analytical_precise" ${pref.personality_style === 'analytical_precise' ? 'selected' : ''}>Analytical & Precise</option>
                  <option value="drill_instructor" ${pref.personality_style === 'drill_instructor' ? 'selected' : ''}>High-Intensity Coach</option>
                </select>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 13px;">Voice Speech Readout</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Enable ALYA text-to-speech audio feedback</div>
                </div>
                <input type="checkbox" id="set-voice-enabled" ${pref.voice_enabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--neon-cyan); cursor: pointer;" />
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 13px;">Interface Sound Effects</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Subtle sci-fi beeps, clicks, and fanfare</div>
                </div>
                <input type="checkbox" id="set-sfx" ${window.store.soundEnabled ? 'checked' : ''} onchange="window.store.soundEnabled = this.checked;" style="width: 20px; height: 20px; accent-color: var(--neon-cyan); cursor: pointer;" />
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: var(--text-muted);">Voice Pitch Calibration</span>
                  <span id="pitch-val">${pref.voice_pitch}</span>
                </div>
                <input type="range" min="0.8" max="1.4" step="0.05" value="${pref.voice_pitch}" class="seek-slider" id="set-voice-pitch" oninput="document.getElementById('pitch-val').textContent = this.value; window.voiceSystem.pitch = parseFloat(this.value);" />
              </div>
            </div>
          </div>

          <!-- Data Portability, Privacy & Danger Zone -->
          <div class="cyber-card" style="grid-column: span 2;">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">🛡️</span> Privacy, Security & Data Management</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); margin-bottom: 16px;">
              <div>
                <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">Complete Personal Data Export</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  Download a complete structured JSON archive of all your workouts, running GPS activities, habits, tasks, quests, and sleep records.
                </div>
              </div>
              <button class="cyber-btn btn-secondary" onclick="SettingsView.exportData()">Download JSON Archive 📥</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255, 23, 68, 0.08); border: 1px solid rgba(255, 23, 68, 0.3); border-radius: var(--radius-md);">
              <div>
                <div style="font-weight: 700; color: #FF5252; font-size: 14px;">Account Deletion & Zero-Data Purge</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  Permanently erase your user profile and all connected telemetry from the database.
                </div>
              </div>
              <button class="cyber-btn btn-danger cyber-btn-sm" onclick="SettingsView.deleteAccount()">Delete Account</button>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading settings.</div>`;
    }
  },

  handleThemeChange(val) {
    if (val === 'cyber-light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  },

  async saveSettings() {
    try {
      const age = document.getElementById('set-age').value;
      const theme = document.getElementById('set-theme').value;
      const personality = document.getElementById('set-personality').value;
      const voiceEnabled = document.getElementById('set-voice-enabled').checked;
      const voicePitch = parseFloat(document.getElementById('set-voice-pitch').value);

      await API.auth.updateProfile({ age_range: age, theme: theme });
      await API.alya.updatePreferences({
        personality_style: personality,
        voice_enabled: voiceEnabled,
        voice_pitch: voicePitch
      });

      window.store.showToast("Settings Saved", "Personal evolution preferences synchronized.", "success");
    } catch (e) {
      window.store.showToast("Error", "Could not save preferences.", "danger");
    }
  },

  async exportData() {
    try {
      const data = await API.auth.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascend_evolution_archive_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      window.store.showToast("Archive Exported", "Personal data JSON file generated successfully.", "success");
    } catch (e) {
      window.store.showToast("Export Failed", "Could not export user data.", "danger");
    }
  },

  async deleteAccount() {
    if (!confirm("Are you certain you wish to purge this account and all connected records?")) return;
    try {
      await API.auth.deleteAccount();
      window.store.showToast("Account Removed", "All records successfully purged.", "info");
      API.setToken('');
      window.location.reload();
    } catch (e) {
      window.store.showToast("Notice", e.message || "Could not delete demo account.", "info");
    }
  }
};

window.SettingsView = SettingsView;

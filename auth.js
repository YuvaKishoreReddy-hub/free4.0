// ==========================================================================
// ⚡ ASCEND 4.0 — AUTHENTICATION & LOGIN/REGISTER MODAL
// ==========================================================================

const AuthView = {
  activeMode: 'login', // 'login' or 'register'

  renderModal() {
    let overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'auth-modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    const isLogin = (this.activeMode === 'login');

    overlay.innerHTML = `
      <div class="modal-content">
        <div style="text-align: center; margin-bottom: 24px;">
          <div class="brand-glyph" style="margin: 0 auto 12px; width: 44px; height: 44px;"></div>
          <h2 style="font-family: var(--font-family-display); font-size: 22px; font-weight: 800; letter-spacing: 2px;">
            ${isLogin ? 'AUTHENTICATE PROTOCOL' : 'INITIALIZE ASCENDANT'}
          </h2>
          <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">
            ${isLogin ? 'Enter your credentials to synchronize with ALYA.' : 'Begin your personal evolution journey.'}
          </p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div style="display: flex; gap: 6px; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 4px; margin-bottom: 20px;">
          <button class="cyber-btn ${isLogin ? '' : 'btn-secondary'} cyber-btn-sm" style="flex: 1;" onclick="AuthView.setMode('login')">Login</button>
          <button class="cyber-btn ${!isLogin ? '' : 'btn-secondary'} cyber-btn-sm" style="flex: 1;" onclick="AuthView.setMode('register')">Register</button>
        </div>

        <!-- Form Fields -->
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
          <div>
            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Username or Email</label>
            <input type="text" class="cyber-input" id="auth-username" placeholder="${isLogin ? 'AlexRiser or alex@ascend.io' : 'Your Ascendant Codename'}" />
          </div>

          ${!isLogin ? `
            <div>
              <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Email Address</label>
              <input type="email" class="cyber-input" id="auth-email" placeholder="you@domain.com" />
            </div>
            <div>
              <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Age Range</label>
              <select class="cyber-input" id="auth-age">
                <option value="18-24">18 - 24</option>
                <option value="25-34" selected>25 - 34</option>
                <option value="35-44">35 - 44</option>
                <option value="45+">45+</option>
              </select>
            </div>
          ` : ''}

          <div>
            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Secure Password</label>
            <input type="password" class="cyber-input" id="auth-password" placeholder="••••••••••••" onkeydown="if(event.key==='Enter') AuthView.submit()" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="cyber-btn" style="width: 100%;" onclick="AuthView.submit()">
            ${isLogin ? 'Authenticate & Enter' : 'Create Evolution Profile'}
          </button>
          
          <button class="cyber-btn btn-gold cyber-btn-sm" onclick="AuthView.quickDemoLogin()">
            ⚡ Instant One-Click Demo (AlexRiser Level 42 S-Rank)
          </button>

          <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="AuthView.closeModal()">Close</button>
        </div>
      </div>
    `;

    overlay.classList.add('open');
  },

  setMode(mode) {
    this.activeMode = mode;
    this.renderModal();
  },

  openModal(mode = 'login') {
    this.activeMode = mode;
    this.renderModal();
  },

  closeModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  },

  async submit() {
    const username = document.getElementById('auth-username').value.trim();
    const pass = document.getElementById('auth-password').value.trim();

    if (!username || !pass) {
      window.store.showToast("Required Fields", "Please enter username and password.", "danger");
      return;
    }

    try {
      if (this.activeMode === 'login') {
        const res = await API.auth.login(username, pass);
        API.setToken(res.access_token);
        window.store.setUser(res.user);
        window.store.showToast("Authenticated", `Welcome back, ${res.user.username}!`, "success");
      } else {
        const email = document.getElementById('auth-email').value.trim();
        const age = document.getElementById('auth-age').value;
        const res = await API.auth.register(username, email || `${username}@ascend.io`, pass, age);
        API.setToken(res.access_token);
        window.store.setUser(res.user);
        window.store.showToast("Profile Initialized", `Welcome to ASCEND, ${res.user.username}!`, "success");
      }
      this.closeModal();
      window.app.navigate('dashboard');
    } catch (e) {
      window.store.showToast("Authentication Failed", e.message || "Invalid credentials.", "danger");
    }
  },

  async quickDemoLogin() {
    try {
      const res = await API.auth.demoLogin();
      API.setToken(res.access_token);
      window.store.setUser(res.user);
      window.store.showToast("Demo Synchronized", "Loaded AlexRiser Level 42 S-Rank profile!", "success");
      this.closeModal();
      window.app.navigate('dashboard');
    } catch (e) {
      window.store.showToast("Error", "Could not load demo user.", "danger");
    }
  },

  logout() {
    API.setToken('');
    window.store.setUser(null);
    window.store.showToast("Logged Out", "Session cleared.", "info");
    this.openModal('login');
  }
};

window.AuthView = AuthView;

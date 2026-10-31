// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA 3D CHARACTER STUDIO VIEW
// ==========================================================================

const AlyaStudioView = {
  activeTab: 'camera', // 'camera', 'animations', 'customization'

  async render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">ALYA 3D CHARACTER STUDIO</h1>
          <p style="color: var(--text-secondary); font-size: 13.5px;">Interactive 3D viewport with 360° manual orbital rotation, gestures, facial expressions, and customization.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="cyber-btn ${this.activeTab === 'camera' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AlyaStudioView.switchTab('camera')">🎥 Camera Controls</button>
          <button class="cyber-btn ${this.activeTab === 'animations' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AlyaStudioView.switchTab('animations')">✨ Expressions & Gestures</button>
          <button class="cyber-btn ${this.activeTab === 'customization' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AlyaStudioView.switchTab('customization')">🎨 Customization</button>
        </div>
      </div>

      <!-- Studio Layout: 3D Viewport + Floating Control Deck -->
      <div style="display: grid; grid-template-columns: 3fr 1.2fr; gap: 24px;">
        <!-- 3D Studio Canvas Container -->
        <div class="cyber-card" style="padding: 0; position: relative; height: calc(100vh - 220px); min-height: 560px; overflow: hidden; border-color: rgba(0, 229, 255, 0.4); box-shadow: var(--glow-cyan);">
          <div id="alya-3d-studio-canvas-container" style="width: 100%; height: 100%;"></div>

          <!-- Bottom Floating Quick Toolbar on Viewport -->
          <div style="position: absolute; bottom: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(7, 11, 22, 0.85); backdrop-filter: blur(12px); padding: 10px 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-glow);">
            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-secondary);">
              <span>🖱️ Drag: Rotate 360°</span>
              <span>•</span>
              <span>Right-Click: Pan</span>
              <span>•</span>
              <span>Scroll: Zoom</span>
              <span>•</span>
              <span>Double-Click: Reset</span>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.spin360()">🔄 Spin 360°</button>
              <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.resetCamera()">Reset View</button>
            </div>
          </div>
        </div>

        <!-- Right Side Control Panels -->
        <div class="cyber-card" id="studio-controls-panel" style="overflow-y: auto; max-height: calc(100vh - 220px);">
          ${this.renderControlPanel()}
        </div>
      </div>
    `;

    // Initialize or re-attach the 3D Character
    setTimeout(() => {
      window.alya3D = new Alya3DCharacter('alya-3d-studio-canvas-container');
    }, 100);
  },

  switchTab(tab) {
    this.activeTab = tab;
    const panel = document.getElementById('studio-controls-panel');
    if (panel) panel.innerHTML = this.renderControlPanel();
    
    // Update button states
    const btns = document.querySelectorAll('.cyber-btn-sm');
    // Re-render view header buttons easily
  },

  renderControlPanel() {
    if (this.activeTab === 'camera') {
      return `
        <div>
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">🎥</span> Camera Presets</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('front')">Front View</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('back')">Back View</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('left')">Left Profile</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('right')">Right Profile</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('three_quarter')">3/4 Dynamic</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('face')">Face Close-Up</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('upper_body')">Upper Body</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setCameraPreset('full_body')">Full Body</button>
          </div>

          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">⚙️</span> Turntable Settings</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px;">Auto-Rotate Turntable</span>
              <input type="checkbox" checked onchange="window.alya3D.setAutoRotate(this.checked)" style="width: 20px; height: 20px; accent-color: var(--neon-cyan); cursor: pointer;" />
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Rotation Speed</span>
                <span style="color: var(--neon-cyan);">Normal</span>
              </div>
              <input type="range" min="0.2" max="2.0" step="0.1" value="0.8" class="seek-slider" oninput="window.alya3D.autoRotateSpeed = parseFloat(this.value);" />
            </div>

            <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin-top: 10px; padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm);">
              💡 <em>Manual interaction pauses auto-turntable. It smoothly resumes after 2.5 seconds of idle time.</em>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'animations') {
      const expressions = [
        { id: 'idle', label: 'Idle / Neutral' },
        { id: 'happy', label: 'Happy & Joyful' },
        { id: 'excited', label: 'Excited' },
        { id: 'thinking', label: 'Thinking / Analytical' },
        { id: 'calm', label: 'Calm & Focused' },
        { id: 'surprised', label: 'Surprised' },
        { id: 'waving', label: 'Greeting Wave' },
        { id: 'celebrating', label: 'Celebrating Victory' },
        { id: 'encouraging', label: 'Encouraging' },
        { id: 'speaking', label: 'Speaking (Lip-Sync)' }
      ];

      return `
        <div>
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">✨</span> Expressions & Gestures</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${expressions.map(e => `
              <button class="cyber-btn btn-secondary cyber-btn-sm" style="text-align: left; justify-content: space-between;" onclick="AlyaStudioView.triggerAnim('${e.id}')">
                <span>${e.label}</span>
                <span style="color: var(--neon-cyan);">▶</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'customization') {
      return `
        <div>
          <!-- Hair Colors -->
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">💇</span> Hair Colors</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('ice_blue')">Ice Blue (Default)</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('cyber_cyan')">Cyber Neon</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('neon_violet')">Neon Violet</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('starlight_gold')">Starlight Gold</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('quantum_silver')">Quantum Silver</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setHairColor('hologram_pink')">Hologram Pink</button>
          </div>

          <!-- Outfits -->
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">🥋</span> 3D Outfits</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setOutfit('cyber_vanguard')">Cyber Vanguard (Signature)</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setOutfit('nano_athletic')">Nano Athletic Suit</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setOutfit('stealth_ops')">Stealth Infiltration Ops</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setOutfit('celestial_valkyrie')">Celestial Valkyrie Armor</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setOutfit('holo_luminary')">Holo Luminary Weave</button>
          </div>

          <!-- Accessories -->
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">👑</span> Holographic Accessories</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setAccessory('holo_visor')">Holo Cyber Visor</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setAccessory('quantum_wings')">Quantum Stabilizer Wings</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.alya3D.setAccessory('none')">None / Minimalist</button>
          </div>
        </div>
      `;
    }
  },

  triggerAnim(anim) {
    if (window.alya3D) {
      window.alya3D.setAnimation(anim);
      if (anim === 'speaking') {
        window.voiceSystem.speak("Hello! I am ALYA, your Advanced Life Assistant. All evolution systems are online!");
      }
    }
  }
};

window.AlyaStudioView = AlyaStudioView;

// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA 3D VIRTUAL ROOM VIEW
// ==========================================================================

const AlyaRoomView = {
  async render(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">ALYA VIRTUAL LOUNGE</h1>
          <p style="color: var(--text-secondary); font-size: 13.5px;">A relaxing 3D cyber sanctuary. Relax, interact with our cyber robotic pet, and showcase achievements.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.musicEngine.setCategory('relax'); window.musicEngine.play();">🎵 Play Ambient Synth</button>
          <button class="cyber-btn cyber-btn-sm" onclick="window.app.navigate('alya-studio')">ALYA 3D Studio ➔</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 3fr 1.2fr; gap: 24px;">
        <!-- 3D Room Viewport -->
        <div class="cyber-card" style="padding: 0; position: relative; height: calc(100vh - 220px); min-height: 560px; overflow: hidden; border-color: rgba(134, 92, 255, 0.4); box-shadow: var(--glow-purple);">
          <div id="alya-3d-room-canvas-container" style="width: 100%; height: 100%;"></div>

          <!-- Bottom Floating Instructions -->
          <div style="position: absolute; bottom: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(7, 11, 22, 0.85); backdrop-filter: blur(12px); padding: 10px 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-glow);">
            <div style="font-size: 12px; color: var(--text-secondary);">
              <span>🖱️ Drag to look around room</span>
              <span>•</span>
              <span>Click on Cyber Cat to pet 🐾</span>
              <span>•</span>
              <span>Click Star Trophy to inspect milestones</span>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 11px; color: var(--neon-cyan);">
              NEO-TOKYO SKYLINE • PENTHOUSE 88
            </div>
          </div>
        </div>

        <!-- Room Items & Lounge Amenities -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">🛋️</span> Lounge Decors</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <span>Robotic Pet Cyber-Cat</span>
                <span style="color: var(--matrix-green); font-size: 11px; font-weight: 700;">✓ Active</span>
              </div>
              <div style="padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <span>Neo-Tokyo Luxury Sofa</span>
                <span style="color: var(--matrix-green); font-size: 11px; font-weight: 700;">✓ Placed</span>
              </div>
              <div style="padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <span>Golden S-Rank Trophy</span>
                <span style="color: var(--matrix-green); font-size: 11px; font-weight: 700;">✓ Displayed</span>
              </div>
              <div style="padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <span>Cyber Biome Bonsai</span>
                <span style="color: var(--matrix-green); font-size: 11px; font-weight: 700;">✓ Nourished</span>
              </div>
            </div>
          </div>

          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">💬</span> ALYA's Lounge Reflection</div>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6;">
              "Relax, recharge... You've earned it, Alex. Recovery is the biological catalyst that turns today's efforts into tomorrow's strength."
            </p>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.alyaRoom = new AlyaVirtualRoom('alya-3d-room-canvas-container');
    }, 100);
  }
};

window.AlyaRoomView = AlyaRoomView;

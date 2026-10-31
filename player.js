// ==========================================================================
// ⚡ ASCEND 4.0 — RPG PLAYER STATUS & ATTRIBUTES VIEW
// ==========================================================================

const PlayerView = {
  async render(container) {
    try {
      const status = await API.player.getStatus();
      const attrs = status.attributes;

      const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
      const currentRankIndex = ranks.indexOf(status.rank);

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">RPG PLAYER STATUS & ATTRIBUTES</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Your personal evolution translated into a transparent, balanced RPG progression system.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn btn-secondary" onclick="window.app.navigate('skilltree')">🌟 Open Skill Tree</button>
            <button class="cyber-btn btn-secondary" onclick="window.app.navigate('achievements')">🏆 Achievements</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px;">
          <!-- Left: Player Profile & Rank Card -->
          <div class="cyber-card" style="text-align: center; border-color: rgba(0, 229, 255, 0.4);">
            <div style="position: relative; width: 110px; height: 110px; margin: 0 auto 16px;">
              <img src="/assets/ascend_showcase_1.jpg" alt="Player" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--neon-cyan); box-shadow: var(--glow-cyan);" />
              <div style="position: absolute; bottom: 0; right: 0; background: var(--ascend-gold); color: #070B16; font-family: var(--font-family-display); font-size: 12px; font-weight: 800; padding: 4px 8px; border-radius: 10px; box-shadow: var(--glow-gold);">
                ${status.rank}
              </div>
            </div>

            <h2 style="font-family: var(--font-family-display); font-size: 22px; font-weight: 800; color: var(--text-primary);">${status.username}</h2>
            <div style="font-size: 13px; color: var(--neon-cyan); font-family: var(--font-family-display); margin-top: 2px;">
              LEVEL ${status.level} • ${status.rank}-RANK ASCENDANT
            </div>

            <!-- Virtual Currency Pill -->
            <div style="display: flex; justify-content: center; gap: 16px; margin: 18px 0; padding: 12px; background: rgba(13, 22, 41, 0.8); border-radius: var(--radius-md);">
              <div>
                <div style="font-size: 10px; color: var(--text-muted);">CREDITS</div>
                <div style="font-family: var(--font-family-display); font-size: 18px; font-weight: 800; color: var(--ascend-gold);">🪙 ${status.credits}</div>
              </div>
              <div style="width: 1px; background: var(--border-subtle);"></div>
              <div>
                <div style="font-size: 10px; color: var(--text-muted);">ASCEND SHARDS</div>
                <div style="font-family: var(--font-family-display); font-size: 18px; font-weight: 800; color: var(--neon-cyan);">💎 ${status.shards}</div>
              </div>
            </div>

            <!-- XP to Next Level -->
            <div style="text-align: left; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">XP PROGRESSION</span>
                <span style="color: var(--neon-cyan); font-family: var(--font-family-display); font-weight: 700;">${status.xp} / ${status.xp_needed} XP</span>
              </div>
              <div class="progress-container">
                <div class="progress-fill" style="width: ${Math.min(100, (status.xp / status.xp_needed) * 100)}%;"></div>
              </div>
            </div>
          </div>

          <!-- Right: 6 Core Attributes Grid & Radar Breakdown -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">⚡</span> 6 Core Evolution Attributes</div>
              <span style="font-size: 11px; color: var(--text-muted);">MAX THRESHOLD 100</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <!-- Strength -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid #FF5252;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">💪 Strength</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: #FF5252; font-size: 18px;">${attrs.strength}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill" style="width: ${attrs.strength}%; background: #FF5252; box-shadow: 0 0 8px #FF5252;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Gym & heavy resistance training.</div>
              </div>

              <!-- Agility -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid var(--matrix-green);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">🏃 Agility</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: var(--matrix-green); font-size: 18px;">${attrs.agility}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill green" style="width: ${attrs.agility}%;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Running, walking & mobility.</div>
              </div>

              <!-- Intelligence -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid var(--neon-cyan);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">🧠 Intelligence</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: var(--neon-cyan); font-size: 18px;">${attrs.intelligence}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill" style="width: ${attrs.intelligence}%;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Coding, courses & reading.</div>
              </div>

              <!-- Consistency -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid var(--ascend-gold);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">🔥 Consistency</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: var(--ascend-gold); font-size: 18px;">${attrs.consistency}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill gold" style="width: ${attrs.consistency}%;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Habit streaks & daily check-ins.</div>
              </div>

              <!-- Focus -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid var(--cyber-purple);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">🎯 Focus</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: var(--cyber-purple); font-size: 18px;">${attrs.focus}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill purple" style="width: ${attrs.focus}%;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Deep Pomodoro sessions.</div>
              </div>

              <!-- Creativity -->
              <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-md); border-left: 3px solid var(--neon-pink);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">🎨 Creativity</span>
                  <span style="font-family: var(--font-family-display); font-weight: 800; color: var(--neon-pink); font-size: 18px;">${attrs.creativity}</span>
                </div>
                <div class="progress-container" style="height: 6px; margin-top: 10px;">
                  <div class="progress-fill" style="width: ${attrs.creativity}%; background: var(--neon-pink); box-shadow: 0 0 8px var(--neon-pink);"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Increased by Ideation & syntheses.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rank Hierarchy Progression Path Strip -->
        <div class="cyber-card">
          <div class="cyber-card-header">
            <div class="card-title"><span class="card-title-icon">🎖️</span> Rank Evolution Path</div>
            <span style="font-size: 11px; color: var(--ascend-gold); font-weight: 700;">CURRENT: ${status.rank}-RANK</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; position: relative; padding: 20px 10px;">
            <div style="position: absolute; left: 30px; right: 30px; top: 50%; height: 2px; background: rgba(255, 255, 255, 0.1); z-index: 1;"></div>

            ${ranks.map((r, idx) => {
              const reached = idx <= currentRankIndex;
              const isCurrent = idx === currentRankIndex;

              return `
                <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: ${isCurrent ? 'linear-gradient(135deg, #FFA000, var(--ascend-gold))' : (reached ? 'rgba(0, 229, 255, 0.2)' : 'rgba(13, 22, 41, 0.9)')}; border: 2px solid ${isCurrent ? 'var(--ascend-gold)' : (reached ? 'var(--neon-cyan)' : 'var(--border-subtle)')}; display: flex; align-items: center; justify-content: center; font-family: var(--font-family-display); font-size: 14px; font-weight: 800; color: ${isCurrent ? '#070B16' : (reached ? 'var(--text-primary)' : 'var(--text-muted)')}; box-shadow: ${isCurrent ? 'var(--glow-gold)' : (reached ? 'var(--glow-cyan)' : 'none')};">
                    ${r}
                  </div>
                  <div style="font-size: 10px; font-weight: 700; margin-top: 8px; color: ${isCurrent ? 'var(--ascend-gold)' : (reached ? 'var(--neon-cyan)' : 'var(--text-muted)')}; font-family: var(--font-family-display);">
                    ${r}-RANK
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading player status.</div>`;
    }
  }
};

window.PlayerView = PlayerView;

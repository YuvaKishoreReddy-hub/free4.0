// ==========================================================================
// ⚡ ASCEND 4.0 — ACHIEVEMENTS SHOWCASE VIEW
// ==========================================================================

const AchievementsView = {
  async render(container) {
    try {
      const achievements = await API.player.getAchievements();
      const unlockedCount = achievements.filter(a => a.is_unlocked).length;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">ACHIEVEMENT MILESTONES</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Honorary cyber badges earned through rigorous physical and mental progression.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-family: var(--font-family-display); font-size: 13px; color: var(--neon-cyan);">
            <span>UNLOCKED: ${unlockedCount} / ${achievements.length}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${achievements.map(a => `
            <div class="cyber-card" style="display: flex; gap: 16px; border-color: ${a.is_unlocked ? 'var(--ascend-gold)' : 'var(--border-subtle)'}; background: ${a.is_unlocked ? 'rgba(20, 33, 58, 0.85)' : 'rgba(10, 16, 31, 0.6)'};">
              <div style="width: 54px; height: 54px; border-radius: 12px; background: ${a.is_unlocked ? 'linear-gradient(135deg, rgba(255, 200, 87, 0.3), rgba(255, 160, 0, 0.1))' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${a.is_unlocked ? 'var(--ascend-gold)' : 'var(--border-subtle)'}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: ${a.is_unlocked ? 'var(--glow-gold)' : 'none'};">
                ${a.is_unlocked ? '🏆' : '🔒'}
              </div>

              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h3 style="font-family: var(--font-family-display); font-size: 15px; font-weight: 800; color: ${a.is_unlocked ? 'var(--text-primary)' : 'var(--text-muted)'};">${a.title}</h3>
                  <span style="font-size: 11px; color: var(--ascend-gold); font-family: var(--font-family-display); font-weight: 700;">+${a.xp_reward} XP</span>
                </div>
                <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 10px; line-height: 1.4;">${a.description}</p>
                <div style="font-size: 10px; color: ${a.is_unlocked ? 'var(--matrix-green)' : 'var(--text-muted)'}; font-weight: 700; font-family: var(--font-family-display);">
                  ${a.is_unlocked ? '✓ UNLOCKED & SYNCHRONIZED' : 'LOCKED MILESTONE'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading achievements.</div>`;
    }
  }
};

window.AchievementsView = AchievementsView;

// ==========================================================================
// ⚡ ASCEND 4.0 — COMMUNITY & GLOBAL ASCENDANTS LEADERBOARD
// ==========================================================================

const CommunityView = {
  async render(container) {
    try {
      const leaderboard = await API.community.getLeaderboard();
      const challenges = await API.community.getChallenges();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">GLOBAL ASCENDANTS COMMUNITY</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Global leaderboards, collective community challenges, and camaraderie. Sensitive GPS data masked by default.</p>
          </div>
          <button class="cyber-btn" onclick="window.store.showToast('Challenge Joined', 'Joined Cyber City Marathon!', 'success')">⚡ Join Collective Challenge</button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Global Leaderboard Table -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">🏆</span> Global Evolution Leaderboard</div>
              <span style="font-size: 11px; color: var(--ascend-gold); font-family: var(--font-family-display); font-weight: 700;">TOP CYBER PROTOCOLS</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${leaderboard.map((u, idx) => {
                const isCurrentUser = (u.username === 'AlexRiser');
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: ${isCurrentUser ? 'rgba(0, 229, 255, 0.15)' : 'rgba(13, 22, 41, 0.6)'}; border: 1px solid ${isCurrentUser ? 'var(--neon-cyan)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); ${isCurrentUser ? 'box-shadow: var(--glow-cyan);' : ''}">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <span style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: ${idx < 3 ? 'var(--ascend-gold)' : 'var(--text-muted)'}; width: 28px; text-align: center;">
                        #${u.rank_pos || (idx + 1)}
                      </span>
                      <div>
                        <div style="font-weight: 700; color: ${isCurrentUser ? 'var(--neon-cyan)' : 'var(--text-primary)'}; font-size: 14px;">
                          ${u.username} ${isCurrentUser ? '<span style="font-size:10px; padding:2px 6px; background:var(--neon-cyan); color:#070B16; border-radius:4px; margin-left:6px;">YOU</span>' : ''}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Level ${u.level} Ascendant</div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px;">
                      <span style="padding: 3px 10px; border-radius: 8px; background: rgba(255, 200, 87, 0.15); border: 1px solid var(--ascend-gold); color: var(--ascend-gold); font-family: var(--font-family-display); font-size: 11px; font-weight: 700;">
                        ${u.rank_tier}-RANK
                      </span>
                      <span style="font-family: var(--font-family-display); font-size: 13.5px; font-weight: 700; color: var(--neon-cyan); min-width: 80px; text-align: right;">
                        ${u.xp} XP
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Community Challenges -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🌐</span> Collective Challenges</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${challenges.map(c => `
                  <div style="padding: 14px; background: rgba(13, 22, 41, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <h4 style="font-family: var(--font-family-display); font-size: 14px; font-weight: 700; color: var(--text-primary);">${c.title}</h4>
                      <span style="font-size: 11px; color: var(--ascend-gold); font-family: var(--font-family-display); font-weight: 700;">+${c.xp_reward} XP</span>
                    </div>
                    <p style="font-size: 11.5px; color: var(--text-secondary); margin: 6px 0 10px;">${c.description}</p>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                      <span style="color: var(--text-muted);">${c.participants_count} Ascendants participating</span>
                      <span style="color: var(--neon-cyan); font-weight: 700;">${c.progress_pct}%</span>
                    </div>
                    <div class="progress-container" style="height: 6px;">
                      <div class="progress-fill ${c.progress_pct > 70 ? 'green' : ''}" style="width: ${c.progress_pct}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Privacy Policy Shield Notice -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🛡️</span> Privacy Shield Guarantee</div>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                In accordance with ASCEND privacy protocols, your exact GPS starting coordinates and home perimeter are automatically obfuscated on public leaderboards.
              </p>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading community.</div>`;
    }
  }
};

window.CommunityView = CommunityView;

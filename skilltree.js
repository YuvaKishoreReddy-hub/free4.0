// ==========================================================================
// ⚡ ASCEND 4.0 — INTERACTIVE SKILL TREE VIEW
// ==========================================================================

const SkillTreeView = {
  activeBranch: 'All',

  async render(container) {
    try {
      const skills = await API.player.getSkills();
      const branches = ['All', 'Fitness', 'Coding', 'Focus', 'Consistency', 'Creativity'];

      const filteredSkills = (this.activeBranch === 'All') 
        ? skills 
        : skills.filter(s => s.category.toLowerCase() === this.activeBranch.toLowerCase());

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">INTERACTIVE SKILL TREE</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Unlock cognitive and physiological proficiencies through balanced evolution points.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            ${branches.map(b => `
              <button class="cyber-btn ${this.activeBranch === b ? '' : 'btn-secondary'} cyber-btn-sm" onclick="SkillTreeView.filterBranch('${b}')">
                ${b}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Skill Tree Nodes Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 20px;">
          ${filteredSkills.map(s => `
            <div class="cyber-card" style="display: flex; flex-direction: column; justify-content: space-between; border-color: ${s.is_unlocked ? 'var(--neon-cyan)' : 'var(--border-subtle)'}; background: ${s.is_unlocked ? 'rgba(20, 33, 58, 0.85)' : 'rgba(10, 16, 31, 0.6)'};">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <div style="font-size: 10px; font-family: var(--font-family-display); font-weight: 700; color: ${s.is_unlocked ? 'var(--matrix-green)' : 'var(--text-muted)'};">
                      TIER ${s.tier} • ${s.category.toUpperCase()}
                    </div>
                    <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${s.name}</h3>
                  </div>
                  <div style="width: 36px; height: 36px; border-radius: 8px; background: ${s.is_unlocked ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${s.is_unlocked ? 'var(--neon-cyan)' : 'var(--border-subtle)'}; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    ${s.is_unlocked ? '⚡' : '🔒'}
                  </div>
                </div>

                <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">${s.description}</p>
              </div>

              <div>
                <div style="padding: 8px 12px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 11.5px; display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Permanent Bonus:</span>
                  <span style="color: var(--neon-cyan); font-weight: 700; font-family: var(--font-family-display);">+${s.bonus_amount} ${s.attribute_bonus}</span>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                  ${s.is_unlocked ? `
                    <span style="font-family: var(--font-family-display); font-size: 12px; color: var(--matrix-green); font-weight: 700;">✓ PROFICIENCY UNLOCKED</span>
                  ` : `
                    <button class="cyber-btn cyber-btn-sm" onclick="SkillTreeView.unlock('${s.id}')">
                      Unlock (${s.cost} Skill Pt)
                    </button>
                  `}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading skill tree.</div>`;
    }
  },

  filterBranch(b) {
    this.activeBranch = b;
    this.render(document.getElementById('page-container'));
  },

  async unlock(skillId) {
    try {
      const res = await API.player.unlockSkill(skillId);
      window.store.showToast("Skill Unlocked!", `Acquired new proficiency! Bonus: ${res.bonus}`, "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Prerequisite Required", e.message || "Unlock earlier tier skill first.", "danger");
    }
  }
};

window.SkillTreeView = SkillTreeView;

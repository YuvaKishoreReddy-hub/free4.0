// ==========================================================================
// ⚡ ASCEND 4.0 — QUESTS & WEEKLY MISSIONS VIEW
// ==========================================================================

const QuestsView = {
  activeTab: 'daily', // 'daily' or 'weekly'

  async render(container, tab = 'daily') {
    this.activeTab = tab;
    try {
      const data = await API.quests.list();
      const quests = this.activeTab === 'daily' ? data.daily : data.weekly;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">
              ${this.activeTab === 'daily' ? 'DAILY QUESTS' : 'WEEKLY MISSIONS'}
            </h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Complete tactical objectives to earn Evolution XP, Credits, and climb the RPG rank hierarchy.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn ${this.activeTab === 'daily' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="QuestsView.render(document.getElementById('page-container'), 'daily')">Daily Quests</button>
            <button class="cyber-btn ${this.activeTab === 'weekly' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="QuestsView.render(document.getElementById('page-container'), 'weekly')">Weekly Missions</button>
            <button class="cyber-btn cyber-btn-sm" onclick="QuestsView.openCreateModal()">+ Create Custom Quest</button>
          </div>
        </div>

        <!-- Quests Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
          ${quests.map(q => {
            const isFinished = q.progress >= q.target;
            const diffColors = {
              Easy: 'var(--matrix-green)',
              Normal: 'var(--neon-cyan)',
              Hard: 'var(--ascend-gold)',
              Elite: 'var(--neon-pink)'
            };
            const dColor = diffColors[q.difficulty] || 'var(--neon-cyan)';

            return `
              <div class="cyber-card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid ${isFinished ? 'var(--matrix-green)' : dColor};">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--text-primary);">${q.title}</h3>
                      <div style="display: flex; gap: 6px; margin-top: 4px;">
                        <span style="font-size: 10px; padding: 2px 7px; border-radius: 6px; background: rgba(0, 229, 255, 0.1); color: var(--neon-cyan); font-weight: 700;">${q.category}</span>
                        <span style="font-size: 10px; padding: 2px 7px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); color: ${dColor}; font-weight: 700;">${q.difficulty}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-family: var(--font-family-display); font-size: 13px; font-weight: 800; color: var(--ascend-gold);">+${q.xp_reward} XP</div>
                      <div style="font-size: 11px; color: var(--neon-cyan);">+${q.credits_reward} CR</div>
                    </div>
                  </div>

                  <p style="font-size: 12.5px; color: var(--text-secondary); margin: 8px 0 16px; line-height: 1.5;">${q.description}</p>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11.5px;">
                    <span style="color: var(--text-muted);">PROGRESS</span>
                    <span style="font-weight: 700; color: ${isFinished ? 'var(--matrix-green)' : 'var(--neon-cyan)'}; font-family: var(--font-family-display);">${q.progress} / ${q.target} ${q.unit}</span>
                  </div>

                  <div class="progress-container" style="height: 8px; margin-bottom: 14px;">
                    <div class="progress-fill ${isFinished ? 'green' : ''}" style="width: ${Math.min(100, (q.progress / q.target) * 100)}%;"></div>
                  </div>

                  <div style="display: flex; justify-content: flex-end; gap: 8px;">
                    ${!isFinished ? `
                      <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="QuestsView.advanceQuest(${q.id})">+ Advance</button>
                    ` : `
                      <button class="cyber-btn btn-gold cyber-btn-sm" ${q.is_completed ? 'disabled' : ''} onclick="QuestsView.claimReward(${q.id})">
                        ${q.is_completed ? '✓ Claimed' : '🏆 Claim Reward!'}
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading quests.</div>`;
    }
  },

  async advanceQuest(id) {
    try {
      const res = await API.quests.progress(id, 1);
      window.store.playUiSound('click');
      if (res.status === 'completed') {
        window.store.showToast("Quest Completed!", "All objectives met! Claim your XP & Credits reward now.", "success");
      }
      this.render(document.getElementById('page-container'), this.activeTab);
    } catch (e) {
      window.store.showToast("Error", "Could not advance quest.", "danger");
    }
  },

  async claimReward(id) {
    try {
      const res = await API.quests.claim(id);
      window.store.showToast("Reward Claimed!", "XP and Credits deposited to your player status!", "success");
      this.render(document.getElementById('page-container'), this.activeTab);
    } catch (e) {
      window.store.showToast("Error", "Could not claim reward.", "danger");
    }
  },

  openCreateModal() {
    const title = prompt("Enter Quest Title (e.g., Read 30m, 100 Push-Ups):");
    if (!title) return;
    const cat = prompt("Category (Fitness, Running, Coding, Learning, Habit):", "Fitness") || "Fitness";
    const tgt = parseInt(prompt("Target count (e.g. 1, 5, 10):", "1")) || 1;

    API.quests.create({
      title: title,
      category: cat,
      target: tgt,
      difficulty: "Normal",
      is_weekly: (this.activeTab === 'weekly')
    }).then(() => {
      window.store.showToast("Quest Created", `Custom quest '${title}' activated.`, "success");
      QuestsView.render(document.getElementById('page-container'), QuestsView.activeTab);
    });
  }
};

window.QuestsView = QuestsView;

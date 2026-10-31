// ==========================================================================
// ⚡ ASCEND 4.0 — LEARNING TRACKER & COGNITIVE DASHBOARD
// ==========================================================================

const LearningView = {
  async render(container) {
    try {
      const data = await API.learning.getRecords();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">LEARNING TRACKER & COGNITION</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Document software engineering sprints, book reading, course milestones, and research.</p>
          </div>
          <button class="cyber-btn" onclick="LearningView.openLogModal()">+ Log Learning Session</button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Learning History Cards -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">📖</span> Study & Coding Logs</div>
              <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-family-display);">${data.total_study_hours} TOTAL HOURS LOGGED</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${data.history.length ? data.history.map(r => `
                <div style="padding: 14px 18px; background: rgba(13, 22, 41, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); border-left: 3px solid var(--cyber-purple);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${r.subject}</span>
                      <span style="font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(134, 92, 255, 0.2); color: var(--cyber-purple); font-weight: 700;">${r.topic || 'General'}</span>
                    </div>
                    <span style="font-family: var(--font-family-display); font-size: 13px; font-weight: 700; color: var(--neon-cyan);">${r.hours_spent} Hours</span>
                  </div>
                  ${r.notes ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">${r.notes}</div>` : ''}
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              `).join('') : `
                <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No learning records logged yet.</div>
              `}
            </div>
          </div>

          <!-- Right: Subject Hours Breakdown -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🧠</span> Knowledge Distribution</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                ${Object.entries(data.subjects).map(([subj, hrs]) => `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                      <span style="font-weight: 600; color: var(--text-primary);">${subj}</span>
                      <span style="color: var(--neon-cyan); font-family: var(--font-family-display);">${hrs} hrs</span>
                    </div>
                    <div class="progress-container" style="height: 6px;">
                      <div class="progress-fill purple" style="width: ${Math.min(100, (hrs / data.total_study_hours) * 100)}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">💡</span> Cognitive Optimization</div>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.6;">
                "Spaced repetition and active recall generate 300% higher neural retention than passive rereading. Log concepts immediately after study."
              </p>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading learning tracker.</div>`;
    }
  },

  openLogModal() {
    const subj = prompt("Subject (e.g. Python Architecture, Quantum AI, Neurobiology):");
    if (!subj) return;
    const topic = prompt("Specific Topic / Chapter:") || "";
    const hours = parseFloat(prompt("Hours spent (e.g. 1.5):", "1.0")) || 1.0;
    const notes = prompt("Key takeaways / Notes:") || "";

    API.learning.recordLearning({
      subject: subj,
      topic: topic,
      hours_spent: hours,
      notes: notes
    }).then(() => {
      window.store.showToast("Learning Logged", `Added ${hours}h of study in ${subj}! +Intelligence XP.`, "success");
      LearningView.render(document.getElementById('page-container'));
    });
  }
};

window.LearningView = LearningView;

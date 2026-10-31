// ==========================================================================
// ⚡ ASCEND 4.0 — EXERCISE LIBRARY VIEW (10 Categories)
// ==========================================================================

const ExercisesView = {
  currentCategory: 'All',
  searchQuery: '',

  async render(container) {
    try {
      const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full body', 'Mobility', 'Stretching', 'Cardio'];
      const exercises = await API.fitness.getExercises({
        category: this.currentCategory,
        search: this.searchQuery
      });

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">EXERCISE LIBRARY</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Master exercise biomechanics, target muscle groups, safety guidelines, and progressions.</p>
          </div>
          <div style="position: relative; width: 280px;">
            <input type="text" class="cyber-input" placeholder="Search exercises..." value="${this.searchQuery}" oninput="ExercisesView.handleSearch(this.value)" />
          </div>
        </div>

        <!-- 10 Categories Filter Bar -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 14px; margin-bottom: 24px;">
          ${categories.map(cat => `
            <button class="cyber-btn ${this.currentCategory === cat ? '' : 'btn-secondary'} cyber-btn-sm" style="white-space: nowrap;" onclick="ExercisesView.filterCategory('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Exercise Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${exercises.map(ex => `
            <div class="cyber-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--text-primary);">${ex.name}</h3>
                  <div style="display: flex; gap: 6px; margin-top: 4px;">
                    <span style="font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(0, 229, 255, 0.15); color: var(--neon-cyan); font-weight: 700;">${ex.category}</span>
                    <span style="font-size: 10px; padding: 2px 8px; border-radius: 6px; background: rgba(255, 200, 87, 0.15); color: var(--ascend-gold); font-weight: 700;">${ex.difficulty}</span>
                  </div>
                </div>
                <span style="font-size: 11px; color: var(--text-muted);">${ex.equipment}</span>
              </div>

              <div style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
                ${ex.instructions}
              </div>

              <div style="padding: 10px 12px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); margin-bottom: 12px; font-size: 11.5px;">
                <div style="color: var(--neon-cyan); font-weight: 700; margin-bottom: 2px;">TARGET MUSCLES</div>
                <div style="color: var(--text-primary);">${ex.muscle_group}</div>
              </div>

              <div style="font-size: 11.5px; color: var(--matrix-green); margin-bottom: 14px;">
                <strong>Safety Tip:</strong> ${ex.safety_tips}
              </div>

              ${ex.alternatives ? `
                <div style="font-size: 11px; color: var(--text-muted);">
                  <strong>Alternatives:</strong> ${ex.alternatives}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading exercise library.</div>`;
    }
  },

  filterCategory(cat) {
    this.currentCategory = cat;
    this.render(document.getElementById('page-container'));
  },

  handleSearch(query) {
    this.searchQuery = query;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.render(document.getElementById('page-container'));
    }, 300);
  }
};

window.ExercisesView = ExercisesView;

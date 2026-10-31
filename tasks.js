// ==========================================================================
// ⚡ ASCEND 4.0 — TASK MANAGEMENT VIEW (Kanban & List)
// ==========================================================================

const TasksView = {
  viewMode: 'kanban', // 'kanban' or 'list'
  filterCategory: 'All',
  searchQuery: '',

  async render(container) {
    try {
      const tasks = await API.tasks.list({
        category: this.filterCategory,
        search: this.searchQuery
      });

      const categories = ['All', 'Study', 'Coding', 'Fitness', 'Personal', 'Projects', 'Other'];

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">TASK MANAGEMENT COMMAND</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Organize evolution objectives with full Kanban flows, subtasks, and priority queues.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <div style="display: flex; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 2px;">
              <button class="cyber-btn ${this.viewMode === 'kanban' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="TasksView.setViewMode('kanban')">Kanban</button>
              <button class="cyber-btn ${this.viewMode === 'list' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="TasksView.setViewMode('list')">List</button>
            </div>
            <button class="cyber-btn" onclick="TasksView.openCreateModal()">+ Create Task</button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${categories.map(cat => `
              <button class="cyber-btn ${this.filterCategory === cat ? '' : 'btn-secondary'} cyber-btn-sm" onclick="TasksView.setCategory('${cat}')">
                ${cat}
              </button>
            `).join('')}
          </div>
          <div style="width: 260px;">
            <input type="text" class="cyber-input" placeholder="Search tasks..." value="${this.searchQuery}" oninput="TasksView.handleSearch(this.value)" />
          </div>
        </div>

        <!-- Main Task Area -->
        ${this.viewMode === 'kanban' ? this.renderKanban(tasks) : this.renderList(tasks)}
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading tasks.</div>`;
    }
  },

  renderKanban(tasks) {
    const columns = [
      { id: 'todo', label: 'To Do', color: 'var(--neon-cyan)' },
      { id: 'in_progress', label: 'In Progress', color: 'var(--ascend-gold)' },
      { id: 'review', label: 'Review', color: 'var(--cyber-purple)' },
      { id: 'done', label: 'Completed', color: 'var(--matrix-green)' }
    ];

    return `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
            <div class="cyber-card" style="padding: 16px; display: flex; flex-direction: column; min-height: 520px; background: rgba(13, 22, 41, 0.7);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
                <span style="font-family: var(--font-family-display); font-size: 13px; font-weight: 700; color: ${col.color};">${col.label}</span>
                <span style="font-size: 11px; padding: 2px 7px; border-radius: 8px; background: rgba(255, 255, 255, 0.08);">${colTasks.length}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto;">
                ${colTasks.map(t => this.renderTaskCard(t)).join('')}
                ${colTasks.length === 0 ? `<div style="text-align: center; color: var(--text-muted); font-size: 11px; margin-top: 40px;">No tasks in this lane</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderTaskCard(t) {
    const priorityColors = {
      Urgent: 'var(--neon-pink)',
      High: 'var(--ascend-gold)',
      Medium: 'var(--neon-cyan)',
      Low: 'var(--text-muted)'
    };
    const pColor = priorityColors[t.priority] || 'var(--text-muted)';

    return `
      <div style="padding: 14px; background: rgba(20, 33, 58, 0.85); border: 1px solid var(--border-subtle); border-left: 3px solid ${pColor}; border-radius: var(--radius-md); transition: transform 0.2s;" onmouseenter="this.style.borderColor='var(--border-glow)'" onmouseleave="this.style.borderColor='var(--border-subtle)'">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${t.title}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${pColor};">${t.priority}</span>
        </div>

        ${t.description ? `<div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">${t.description}</div>` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 11px;">
          <span style="padding: 2px 6px; border-radius: 4px; background: rgba(0, 229, 255, 0.1); color: var(--neon-cyan);">${t.category}</span>
          <span style="color: var(--ascend-gold); font-family: var(--font-family-display);">+${t.xp_reward} XP</span>
        </div>

        <!-- Quick Status Switch Buttons -->
        <div style="display: flex; gap: 4px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
          ${t.status !== 'in_progress' && t.status !== 'done' ? `<button class="cyber-btn btn-secondary cyber-btn-sm" style="flex:1; font-size:10px; padding:3px;" onclick="TasksView.moveTask(${t.id}, 'in_progress')">Progress →</button>` : ''}
          ${t.status !== 'done' ? `<button class="cyber-btn cyber-btn-sm" style="flex:1; font-size:10px; padding:3px;" onclick="TasksView.moveTask(${t.id}, 'done')">Complete ✓</button>` : `<span style="font-size:11px; color:var(--matrix-green);">✓ Completed</span>`}
          <button style="background:transparent; border:none; color:var(--neon-pink); cursor:pointer; font-size:12px; margin-left:6px;" onclick="TasksView.deleteTask(${t.id})">✕</button>
        </div>
      </div>
    `;
  },

  renderList(tasks) {
    return `
      <div class="cyber-card">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${tasks.map(t => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 14px;">
                <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} onchange="TasksView.moveTask(${t.id}, this.checked ? 'done' : 'todo')" style="width: 18px; height: 18px; accent-color: var(--neon-cyan); cursor: pointer;" />
                <div>
                  <div style="font-weight: 700; color: ${t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)'}; font-size: 14px; text-decoration: ${t.status === 'done' ? 'line-through' : 'none'};">${t.title}</div>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">${t.category} • Due: ${t.due_date || 'No deadline'} • ${t.priority} Priority</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-family: var(--font-family-display); font-size: 12px; color: var(--ascend-gold); font-weight: 700;">+${t.xp_reward} XP</span>
                <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="TasksView.deleteTask(${t.id})">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.render(document.getElementById('page-container'));
  },

  setCategory(cat) {
    this.filterCategory = cat;
    this.render(document.getElementById('page-container'));
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render(document.getElementById('page-container'));
  },

  async moveTask(id, newStatus) {
    try {
      await API.tasks.update(id, { status: newStatus });
      if (newStatus === 'done') {
        window.store.showToast("Task Complete", "Task finished! XP synchronized to your profile.", "success");
      }
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not update task.", "danger");
    }
  },

  async deleteTask(id) {
    try {
      await API.tasks.delete(id);
      window.store.showToast("Task Removed", "Task deleted from queue.", "info");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not delete task.", "danger");
    }
  },

  openCreateModal() {
    const title = prompt("Enter new task objective:");
    if (!title) return;
    const cat = prompt("Category (Study, Coding, Fitness, Personal, Projects):", "Personal") || "Personal";
    const prio = prompt("Priority (Low, Medium, High, Urgent):", "Medium") || "Medium";

    API.tasks.create({
      title: title,
      category: cat,
      priority: prio,
      status: "todo"
    }).then(() => {
      window.store.showToast("Task Created", `Objective '${title}' added to Life Command.`, "success");
      TasksView.render(document.getElementById('page-container'));
    });
  }
};

window.TasksView = TasksView;

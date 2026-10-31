// ==========================================================================
// ⚡ ASCEND 4.0 — MASTER APPLICATION CONTROLLER & ROUTER
// ==========================================================================

class AscendApp {
  constructor() {
    this.currentRoute = 'dashboard';
    this.pageContainer = null;
  }

  async init() {
    this.pageContainer = document.getElementById('page-container');

    // 1. Initialize user from API
    await window.store.initUser();
    this.updateUserHeader();

    // 2. Setup reactive listeners
    window.store.on('user_updated', () => this.updateUserHeader());

    // 3. Initialize Music Player Visualizer
    const visualizerCanvas = document.getElementById('music-visualizer-canvas');
    if (visualizerCanvas && window.musicEngine) {
      window.musicEngine.initVisualizer(visualizerCanvas);
    }

    // 4. Initial Navigation based on hash or default to dashboard
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(initialHash);

    // 5. Listen to browser hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash, false);
    });

    console.log("⚡ ASCEND 4.0 Core Protocol Initialized.");
  }

  navigate(route, updateHash = true) {
    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    // Update active nav styling
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(el => {
      const target = el.getAttribute('data-route');
      if (target === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    window.store.playUiSound('click');

    // Render corresponding view
    switch (route) {
      case 'dashboard':
        window.DashboardView.render(this.pageContainer);
        break;
      case 'life-command':
        window.LifeCommandView.render(this.pageContainer);
        break;
      case 'gym':
      case 'workout-planner':
        window.GymView.render(this.pageContainer);
        break;
      case 'exercises':
        window.ExercisesView.render(this.pageContainer);
        break;
      case 'running':
        window.RunningView.render(this.pageContainer);
        break;
      case 'walking':
        window.WalkingCyclingView.render(this.pageContainer, 'walking');
        break;
      case 'cycling':
        window.WalkingCyclingView.render(this.pageContainer, 'cycling');
        break;
      case 'activity-history':
        window.RunningView.render(this.pageContainer);
        break;
      case 'schedule':
      case 'calendar':
        window.CalendarView.render(this.pageContainer);
        break;
      case 'tasks':
        window.TasksView.render(this.pageContainer);
        break;
      case 'habits':
        window.HabitsView.render(this.pageContainer);
        break;
      case 'quests':
      case 'daily-quests':
        window.QuestsView.render(this.pageContainer, 'daily');
        break;
      case 'weekly-missions':
        window.QuestsView.render(this.pageContainer, 'weekly');
        break;
      case 'focus':
      case 'focus-mode':
        window.FocusView.render(this.pageContainer);
        break;
      case 'learning':
      case 'learning-tracker':
        window.LearningView.render(this.pageContainer);
        break;
      case 'sleep':
      case 'sleep-recovery':
        window.SleepView.render(this.pageContainer);
        break;
      case 'analytics':
        window.AnalyticsView.render(this.pageContainer);
        break;
      case 'player':
      case 'player-status':
      case 'profile':
        window.PlayerView.render(this.pageContainer);
        break;
      case 'skilltree':
      case 'skill-tree':
        window.SkillTreeView.render(this.pageContainer);
        break;
      case 'achievements':
        window.AchievementsView.render(this.pageContainer);
        break;
      case 'store':
      case 'rewards-store':
        window.StoreView.render(this.pageContainer);
        break;
      case 'music':
      case 'music-player':
        window.musicEngine.togglePlay();
        window.store.showToast("Music Player", "Toggled procedural synth playback.", "info");
        break;
      case 'alya-chat':
      case 'alya-ai':
        window.AlyaChatView.render(this.pageContainer);
        break;
      case 'alya-studio':
      case 'character-studio':
        window.AlyaStudioView.render(this.pageContainer);
        break;
      case 'alya-room':
      case 'virtual-room':
        window.AlyaRoomView.render(this.pageContainer);
        break;
      case 'community':
        window.CommunityView.render(this.pageContainer);
        break;
      case 'notifications':
        window.NotificationsView.render(this.pageContainer);
        break;
      case 'settings':
        window.SettingsView.render(this.pageContainer);
        break;
      default:
        window.DashboardView.render(this.pageContainer);
        break;
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUserHeader() {
    const user = window.store.user;
    if (!user) return;

    const nameEl = document.getElementById('header-user-name');
    const rankEl = document.getElementById('header-user-rank');
    const creditsEl = document.getElementById('header-user-credits');
    const shardsEl = document.getElementById('header-user-shards');

    if (nameEl) nameEl.textContent = user.username;
    if (rankEl) rankEl.textContent = `${user.rank}-RANK • LVL ${user.level}`;
    if (creditsEl) creditsEl.textContent = `${user.credits}`;
    if (shardsEl) shardsEl.textContent = `${user.shards}`;
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.ascend-sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
  }
}

window.app = new AscendApp();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

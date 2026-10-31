// ==========================================================================
// ⚡ ASCEND 4.0 — API CLIENT ENGINE
// ==========================================================================

const API = {
  baseUrl: '',

  getToken() {
    return localStorage.getItem('ascend_token') || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('ascend_token', token);
    } else {
      localStorage.removeItem('ascend_token');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/demo-login')) {
        // Automatically try demo-login if session expired
        const demoRes = await fetch(`${this.baseUrl}/api/auth/demo-login`, { method: 'POST' });
        if (demoRes.ok) {
          const data = await demoRes.json();
          this.setToken(data.access_token);
          headers['Authorization'] = `Bearer ${data.access_token}`;
          return fetch(url, { ...options, headers }).then(r => r.json());
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    login: (username, password) => API.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
    register: (username, email, password, age_range) => API.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, age_range })
    }),
    demoLogin: () => API.request('/api/auth/demo-login', { method: 'POST' }),
    getMe: () => API.request('/api/auth/me'),
    updateProfile: (data) => API.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    changePassword: (old_password, new_password) => API.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password })
    }),
    exportData: () => API.request('/api/auth/export-data'),
    deleteAccount: () => API.request('/api/auth/delete-account', { method: 'DELETE' })
  },

  // Dashboard
  dashboard: {
    getSummary: () => API.request('/api/dashboard/summary')
  },

  // Fitness
  fitness: {
    getCategories: () => API.request('/api/fitness/categories'),
    getExercises: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/api/fitness/exercises${qs ? '?' + qs : ''}`);
    },
    getExercise: (id) => API.request(`/api/fitness/exercises/${id}`),
    recordWorkout: (data) => API.request('/api/fitness/workout/session', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getHistory: () => API.request('/api/fitness/workout/history')
  },

  // Activities (Running, Walking, Cycling)
  activities: {
    record: (data) => API.request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    list: (type) => API.request(`/api/activities${type ? '?activity_type=' + type : ''}`),
    getRecords: () => API.request('/api/activities/records'),
    exportGpxUrl: (id) => `/api/activities/${id}/export-gpx`
  },

  // Tasks
  tasks: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/api/tasks${qs ? '?' + qs : ''}`);
    },
    create: (data) => API.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => API.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => API.request(`/api/tasks/${id}`, { method: 'DELETE' })
  },

  // Habits
  habits: {
    list: () => API.request('/api/habits'),
    create: (data) => API.request('/api/habits', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    checkIn: (id, date) => API.request(`/api/habits/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ date })
    }),
    getHeatmap: () => API.request('/api/habits/heatmap'),
    delete: (id) => API.request(`/api/habits/${id}`, { method: 'DELETE' })
  },

  // Quests
  quests: {
    list: () => API.request('/api/quests'),
    create: (data) => API.request('/api/quests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    progress: (id, step = 1) => API.request(`/api/quests/${id}/progress?step=${step}`, { method: 'POST' }),
    claim: (id) => API.request(`/api/quests/${id}/claim`, { method: 'POST' })
  },

  // Player RPG & Store
  player: {
    getStatus: () => API.request('/api/player/status'),
    getSkills: () => API.request('/api/player/skills'),
    unlockSkill: (id) => API.request(`/api/player/skills/${id}/unlock`, { method: 'POST' }),
    getAchievements: () => API.request('/api/player/achievements'),
    getStore: () => API.request('/api/player/store'),
    buyItem: (itemId) => API.request('/api/player/store/buy', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId })
    }),
    equipItem: (itemId) => API.request(`/api/player/store/${itemId}/equip`, { method: 'POST' })
  },

  // ALYA AI & Studio
  alya: {
    chat: (message) => API.request('/api/alya/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),
    getHistory: () => API.request('/api/alya/history'),
    clearHistory: () => API.request('/api/alya/clear', { method: 'DELETE' }),
    getPreferences: () => API.request('/api/alya/preferences'),
    updatePreferences: (data) => API.request('/api/alya/preferences', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // Calendar
  calendar: {
    getEvents: () => API.request('/api/calendar/events'),
    createEvent: (data) => API.request('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    deleteEvent: (id) => API.request(`/api/calendar/events/${id}`, { method: 'DELETE' })
  },

  // Focus & Learning
  focus: {
    getSessions: () => API.request('/api/focus/sessions'),
    recordSession: (data) => API.request('/api/focus/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  learning: {
    getRecords: () => API.request('/api/learning/records'),
    recordLearning: (data) => API.request('/api/learning/records', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Sleep
  sleep: {
    getRecords: () => API.request('/api/sleep/records'),
    recordSleep: (data) => API.request('/api/sleep/records', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Community
  community: {
    getLeaderboard: () => API.request('/api/community/leaderboard'),
    getChallenges: () => API.request('/api/community/challenges')
  },

  // Notifications
  notifications: {
    list: () => API.request('/api/notifications'),
    markAllRead: () => API.request('/api/notifications/mark-all-read', { method: 'POST' }),
    markOneRead: (id) => API.request(`/api/notifications/${id}/read`, { method: 'POST' })
  }
};

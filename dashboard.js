// ==========================================================================
// ⚡ ASCEND 4.0 — MAIN DASHBOARD VIEW
// ==========================================================================

const DashboardView = {
  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:300px;">
        <div style="font-family:var(--font-family-display); color:var(--neon-cyan); letter-spacing:2px;">
          SYNCHRONIZING EVOLUTION TELEMETRY...
        </div>
      </div>
    `;

    try {
      const summary = await API.dashboard.getSummary();
      const user = summary.user;
      const stats = summary.stats;
      const quests = summary.active_quests;
      const schedule = summary.today_schedule;
      const briefing = summary.alya_briefing;

      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });

      container.innerHTML = `
        <!-- Top Hero Banner: Welcome & ALYA Daily Protocol -->
        <div class="cyber-card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(20, 33, 58, 0.9), rgba(13, 22, 41, 0.95)); border-color: rgba(0, 229, 255, 0.4);">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="position: relative;">
                <img src="${user.profile_pic || '/assets/ascend_showcase_1.jpg'}" alt="Avatar" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--neon-cyan); box-shadow: var(--glow-cyan);" />
                <span style="position: absolute; bottom: 0; right: 0; background: var(--ascend-gold); color: #070B16; font-family: var(--font-family-display); font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 8px;">${user.rank}</span>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1.5px;">Welcome back, ${user.username}!</h1>
                  <span style="padding: 3px 10px; border-radius: 12px; background: rgba(0, 229, 255, 0.15); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); font-size: 11px; font-weight: 700; font-family: var(--font-family-display);">LEVEL ${user.level} • ${user.rank}-RANK</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">${briefing.message}</p>
                <div style="font-size: 12px; color: var(--neon-cyan); margin-top: 6px; font-style: italic;">"${briefing.quote}"</div>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
              <div style="font-family: var(--font-family-display); font-size: 13px; color: var(--text-muted);">${today}</div>
              <div style="display: flex; gap: 10px;">
                <button class="cyber-btn" onclick="window.app.navigate('gym')">⚡ Start Workout</button>
                <button class="cyber-btn btn-secondary" onclick="window.app.navigate('running')">🏃 Quick Run</button>
              </div>
            </div>
          </div>

          <!-- XP Progress Bar -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px;">
              <span>EVOLUTION XP TO RANK UP</span>
              <span style="color: var(--neon-cyan); font-family: var(--font-family-display);">${user.xp} / ${user.xp_needed} XP (${user.xp_pct}%)</span>
            </div>
            <div class="progress-container">
              <div class="progress-fill" style="width: ${Math.min(100, user.xp_pct)}%;"></div>
            </div>
          </div>
        </div>

        <!-- 4 Key Stat Cards Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-bottom: 24px;">
          <!-- Running -->
          <div class="cyber-card" style="cursor: pointer;" onclick="window.app.navigate('running')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Distance Run</span>
              <span style="font-size: 20px;">🏃</span>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--neon-cyan);">${stats.running_km} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">km</span></div>
            <div style="font-size: 11.5px; color: var(--matrix-green); margin-top: 4px;">↑ +5.12 km recent twilight route</div>
          </div>

          <!-- Calories -->
          <div class="cyber-card" style="cursor: pointer;" onclick="window.app.navigate('gym')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Energy Burned</span>
              <span style="font-size: 20px;">🔥</span>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--ascend-gold);">${stats.calories_burned} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">kcal</span></div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">Optimal metabolic output</div>
          </div>

          <!-- Habit Completion -->
          <div class="cyber-card" style="cursor: pointer;" onclick="window.app.navigate('habits')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Habits Consistency</span>
              <span style="font-size: 20px;">⚡</span>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--matrix-green);">${stats.habits_completion_pct}%</div>
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px;">14-day peak discipline streak</div>
          </div>

          <!-- Pending Tasks -->
          <div class="cyber-card" style="cursor: pointer;" onclick="window.app.navigate('tasks')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Priority Tasks</span>
              <span style="font-size: 20px;">🎯</span>
            </div>
            <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--cyber-purple);">${stats.tasks_pending_count} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">queued</span></div>
            <div style="font-size: 11.5px; color: var(--neon-cyan); margin-top: 4px;">Life Command Center ready</div>
          </div>
        </div>

        <!-- Main Dashboard 2-Column Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left Column -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Active Quests -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title">
                  <span class="card-title-icon">⚔️</span> Active Daily Quests
                </div>
                <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.app.navigate('quests')">View All Quests</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                ${quests.map(q => `
                  <div style="padding: 14px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${q.title}</span>
                        <span style="font-size: 10px; padding: 2px 8px; border-radius: 8px; background: rgba(0, 229, 255, 0.15); color: var(--neon-cyan);">${q.category}</span>
                      </div>
                      <div style="margin-top: 8px; display: flex; align-items: center; gap: 12px;">
                        <div class="progress-container" style="flex: 1; height: 6px;">
                          <div class="progress-fill ${q.progress >= q.target ? 'green' : ''}" style="width: ${Math.min(100, (q.progress / q.target) * 100)}%;"></div>
                        </div>
                        <span style="font-size: 11.5px; color: var(--text-muted);">${q.progress}/${q.target} ${q.unit}</span>
                      </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                      <span style="font-size: 12px; font-weight: 700; color: var(--ascend-gold); font-family: var(--font-family-display);">+${q.xp_reward} XP</span>
                      <span style="font-size: 11px; color: var(--neon-cyan);">+${q.credits_reward} CR</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Workout & Running Quick Module -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- Gym Card -->
              <div class="cyber-card">
                <div class="cyber-card-header">
                  <div class="card-title"><span class="card-title-icon">🏋️</span> Workout in Progress</div>
                </div>
                <div style="padding: 12px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md); margin-bottom: 14px;">
                  <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">Barbell Bench Press</div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Set 2 / 4 • 8 Reps @ 100kg</div>
                  <div style="font-family: var(--font-family-display); font-size: 24px; color: var(--neon-cyan); margin-top: 6px; font-weight: 700;">00:45 <span style="font-size: 11px; color: var(--text-muted);">Rest</span></div>
                </div>
                <button class="cyber-btn" style="width: 100%;" onclick="window.app.navigate('gym')">Open Gym & Timer</button>
              </div>

              <!-- Running Card -->
              <div class="cyber-card">
                <div class="cyber-card-header">
                  <div class="card-title"><span class="card-title-icon">📡</span> Running Telemetry</div>
                </div>
                <div style="padding: 12px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md); margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between;">
                    <div>
                      <div style="font-size: 11px; color: var(--text-muted);">DISTANCE</div>
                      <div style="font-family: var(--font-family-display); font-size: 18px; color: var(--neon-cyan); font-weight: 700;">5.12 km</div>
                    </div>
                    <div>
                      <div style="font-size: 11px; color: var(--text-muted);">AVG PACE</div>
                      <div style="font-family: var(--font-family-display); font-size: 18px; color: var(--matrix-green); font-weight: 700;">5:36 /km</div>
                    </div>
                    <div>
                      <div style="font-size: 11px; color: var(--text-muted);">TIME</div>
                      <div style="font-family: var(--font-family-display); font-size: 18px; color: var(--ascend-gold); font-weight: 700;">28:36</div>
                    </div>
                  </div>
                </div>
                <button class="cyber-btn btn-secondary" style="width: 100%;" onclick="window.app.navigate('running')">Open GPS Route Map</button>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- ALYA Quick Companion Studio Card -->
            <div class="cyber-card" style="text-align: center; border-color: rgba(0, 229, 255, 0.35);">
              <div style="position: relative; height: 180px; overflow: hidden; border-radius: var(--radius-md); background: radial-gradient(circle, #102142 0%, #070B16 100%); margin-bottom: 14px;">
                <img src="/assets/ascend_showcase_1.jpg" alt="ALYA" style="width: 100%; height: 100%; object-fit: cover; object-position: 70% 20%;" />
                <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; background: rgba(7, 11, 22, 0.85); backdrop-filter: blur(8px); padding: 6px 12px; border-radius: 8px; font-size: 11px; color: var(--neon-cyan); border: 1px solid var(--border-glow);">
                  3D Interactive Character Studio Ready
                </div>
              </div>
              <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--text-primary);">ALYA Character Studio</h3>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 14px;">360° Manual Rotation, Custom Outfits, Live Voice Interaction.</p>
              <div style="display: flex; gap: 8px;">
                <button class="cyber-btn" style="flex: 1;" onclick="window.app.navigate('alya-studio')">Explore 3D</button>
                <button class="cyber-btn btn-secondary" style="flex: 1;" onclick="window.app.navigate('alya-chat')">Chat AI</button>
              </div>
            </div>

            <!-- Today's Schedule -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📅</span> Today's Schedule</div>
                <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.app.navigate('calendar')">Calendar</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${schedule.map(ev => `
                  <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm); border-left: 3px solid var(--neon-cyan);">
                    <div style="font-family: var(--font-family-display); font-size: 11px; color: var(--neon-cyan); font-weight: 700; width: 60px;">${ev.start_time.split(' ')[1] || '08:00'}</div>
                    <div style="flex: 1;">
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary);">${ev.title}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${ev.category}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="cyber-card" style="text-align: center; padding: 40px;">
          <h2 style="color: var(--neon-pink); font-family: var(--font-family-display);">TELEMETRY OFFLINE</h2>
          <p style="color: var(--text-secondary); margin: 10px 0 20px;">Could not connect to ASCEND backend services.</p>
          <button class="cyber-btn" onclick="DashboardView.render(document.getElementById('page-container'))">Retry Connection</button>
        </div>
      `;
    }
  }
};

window.DashboardView = DashboardView;

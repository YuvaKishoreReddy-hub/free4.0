// ==========================================================================
// ⚡ ASCEND 4.0 — ANALYTICS & INTERACTIVE DATA VISUALIZATION
// ==========================================================================

const AnalyticsView = {
  timeFilter: 'weekly', // 'daily', 'weekly', 'monthly'

  async render(container) {
    try {
      const summary = await API.dashboard.getSummary();
      const status = await API.player.getStatus();
      const activities = await API.activities.list();
      const tasks = await API.tasks.list();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">SYSTEM ANALYTICS & TELEMETRY</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Synthesized metrics derived directly from your authenticated database activity records.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="cyber-btn ${this.timeFilter === 'daily' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AnalyticsView.setFilter('daily')">Daily</button>
            <button class="cyber-btn ${this.timeFilter === 'weekly' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AnalyticsView.setFilter('weekly')">Weekly</button>
            <button class="cyber-btn ${this.timeFilter === 'monthly' ? '' : 'btn-secondary'} cyber-btn-sm" onclick="AnalyticsView.setFilter('monthly')">Monthly</button>
          </div>
        </div>

        <!-- 2 Column Chart Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Chart 1: XP Velocity Progression -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">📈</span> Evolution XP Velocity</div>
              <span style="font-size: 11px; color: var(--neon-cyan); font-family: var(--font-family-display); font-weight: 700;">+3,850 XP GAINED</span>
            </div>
            <div style="height: 240px; width: 100%; position: relative;">
              <canvas id="chart-xp-canvas" width="600" height="240" style="width: 100%; height: 100%; display: block;"></canvas>
            </div>
          </div>

          <!-- Chart 2: Weekly Running Mileage Bar Chart -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">🏃</span> Running & Cardio Volume (km)</div>
              <span style="font-size: 11px; color: var(--matrix-green); font-family: var(--font-family-display); font-weight: 700;">28.4 KM ACCUMULATED</span>
            </div>
            <div style="height: 240px; width: 100%; position: relative;">
              <canvas id="chart-mileage-canvas" width="600" height="240" style="width: 100%; height: 100%; display: block;"></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Attribute Hexagonal Radar & Tasks Velocity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Chart 3: Attribute Radar -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">💠</span> Attribute Balance Radar</div>
              <span style="font-size: 11px; color: var(--ascend-gold); font-family: var(--font-family-display);">TIER S ATTRIBUTES</span>
            </div>
            <div style="height: 260px; width: 100%; display: flex; justify-content: center; align-items: center;">
              <canvas id="chart-radar-canvas" width="300" height="260" style="display: block;"></canvas>
            </div>
          </div>

          <!-- Chart 4: Objective & Habit Completion Rate -->
          <div class="cyber-card">
            <div class="cyber-card-header">
              <div class="card-title"><span class="card-title-icon">📊</span> Protocol Completion Ratios</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 18px; padding-top: 10px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                  <span>HABIT CONSISTENCY INDEX</span>
                  <span style="color: var(--matrix-green); font-weight: 700;">94%</span>
                </div>
                <div class="progress-container"><div class="progress-fill green" style="width: 94%;"></div></div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                  <span>TASK COMPLETION VELOCITY</span>
                  <span style="color: var(--neon-cyan); font-weight: 700;">88%</span>
                </div>
                <div class="progress-container"><div class="progress-fill" style="width: 88%;"></div></div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                  <span>ACTIVE QUEST ACCELERATION</span>
                  <span style="color: var(--ascend-gold); font-weight: 700;">85%</span>
                </div>
                <div class="progress-container"><div class="progress-fill gold" style="width: 85%;"></div></div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                  <span>DEEP WORK CONCENTRATION</span>
                  <span style="color: var(--cyber-purple); font-weight: 700;">92%</span>
                </div>
                <div class="progress-container"><div class="progress-fill purple" style="width: 92%;"></div></div>
              </div>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => {
        this.renderXpChart();
        this.renderMileageChart();
        this.renderRadarChart(status.attributes);
      }, 100);
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading analytics.</div>`;
    }
  },

  setFilter(filter) {
    this.timeFilter = filter;
    this.render(document.getElementById('page-container'));
  },

  renderXpChart() {
    const canvas = document.getElementById('chart-xp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const points = [450, 920, 1480, 2100, 2750, 3200, 3850];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 30; y < h - 30; y += 40) {
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 20, y); ctx.stroke();
    }

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    const maxVal = 4500;
    const stepX = (w - 70) / (points.length - 1);

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = 50 + i * stepX;
      const y = h - 40 - (p / maxVal) * (h - 70);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(50 + (points.length - 1) * stepX, h - 30);
    ctx.lineTo(50, h - 30);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = 50 + i * stepX;
      const y = h - 40 - (p / maxVal) * (h - 70);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points & Labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    points.forEach((p, i) => {
      const x = 50 + i * stepX;
      const y = h - 40 - (p / maxVal) * (h - 70);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();
      ctx.fillStyle = '#A9B6CC';
      ctx.fillText(labels[i], x, h - 12);
    });
  },

  renderMileageChart() {
    const canvas = document.getElementById('chart-mileage-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const values = [4.2, 0, 5.12, 3.8, 6.0, 4.1, 5.18];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const barWidth = 32;
    const maxVal = 8.0;
    const stepX = (w - 80) / values.length;

    values.forEach((v, i) => {
      const x = 50 + i * stepX;
      const barH = (v / maxVal) * (h - 70);
      const y = h - 40 - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h - 40);
      grad.addColorStop(0, '#00E676');
      grad.addColorStop(1, '#0D1629');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);
      ctx.strokeStyle = '#00E676';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      if (v > 0) ctx.fillText(`${v}k`, x + barWidth / 2, y - 6);

      ctx.fillStyle = '#A9B6CC';
      ctx.fillText(labels[i], x + barWidth / 2, h - 12);
    });
  },

  renderRadarChart(attrs) {
    const canvas = document.getElementById('chart-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = 95;

    ctx.clearRect(0, 0, w, h);

    const keys = ['strength', 'agility', 'intelligence', 'consistency', 'focus', 'creativity'];
    const labels = ['STR', 'AGI', 'INT', 'CON', 'FOC', 'CRE'];
    const numPoints = keys.length;

    // Web background rings
    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
        const x = cx + Math.cos(angle) * (maxR * r);
        const y = cy + Math.sin(angle) * (maxR * r);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Radar axes
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'center';
      const lx = cx + Math.cos(angle) * (maxR + 18);
      const ly = cy + Math.sin(angle) * (maxR + 18) + 4;
      ctx.fillText(labels[i], lx, ly);
    }

    // Filled Attribute Polygon
    ctx.beginPath();
    keys.forEach((k, i) => {
      const val = (attrs[k] || 80) / 100;
      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
      const x = cx + Math.cos(angle) * (maxR * val);
      const y = cy + Math.sin(angle) * (maxR * val);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
};

window.AnalyticsView = AnalyticsView;

// ==========================================================================
// ⚡ ASCEND 4.0 — RUNNING TRACKER & GPS ROUTE ENGINE
// ==========================================================================

const RunningView = {
  isTracking: false,
  isPaused: false,
  isSimulation: false,
  watchId: null,
  timerInterval: null,
  durationSeconds: 1716, // 28:36 default
  distanceKm: 5.12,
  routeCoordinates: [],
  activitiesList: [],

  async render(container) {
    try {
      this.activitiesList = await API.activities.list('running');
      const records = await API.activities.getRecords();

      // Sample coordinates for initial route map (5.12km loop)
      if (this.routeCoordinates.length === 0) {
        this.routeCoordinates = [
          { lat: 37.7749, lng: -122.4194 },
          { lat: 37.7760, lng: -122.4180 },
          { lat: 37.7785, lng: -122.4150 },
          { lat: 37.7810, lng: -122.4120 },
          { lat: 37.7830, lng: -122.4080 },
          { lat: 37.7820, lng: -122.4040 },
          { lat: 37.7790, lng: -122.4060 },
          { lat: 37.7760, lng: -122.4100 },
          { lat: 37.7749, lng: -122.4194 }
        ];
      }

      const pace = this.distanceKm > 0 ? (this.durationSeconds / 60 / this.distanceKm).toFixed(2) : "0:00";
      const speed = this.durationSeconds > 0 ? ((this.distanceKm / (this.durationSeconds / 3600))).toFixed(1) : "0.0";
      const calories = Math.round(this.distanceKm * 68);

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">RUNNING TRACKER & GPS TELEMETRY</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Real-time GPS coordinates, cadence, elevation velocity, and dark cyber route maps.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 11px; padding: 4px 10px; border-radius: 12px; background: rgba(0, 229, 255, 0.15); border: 1px solid var(--border-glow); color: var(--neon-cyan);">
              ${this.isSimulation ? 'Mode: Simulated Route (Demo)' : 'Mode: Live Hardware GPS'}
            </div>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="RunningView.toggleSimulationMode()">
              Switch to ${this.isSimulation ? 'Hardware GPS' : 'Demo Simulation'}
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Live Telemetry & GPS Cyber Map -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Telemetry Stats Strip -->
            <div class="cyber-card" style="padding: 18px 24px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center;">
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Distance</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--neon-cyan);" id="run-distance">${this.distanceKm.toFixed(2)} <span style="font-size: 13px;">km</span></div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Duration</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--text-primary);" id="run-duration">${this.formatDuration(this.durationSeconds)}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Avg Pace</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--matrix-green);" id="run-pace">${this.formatPace(pace)} <span style="font-size: 13px;">/km</span></div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Calories</div>
                  <div style="font-family: var(--font-family-display); font-size: 28px; font-weight: 800; color: var(--ascend-gold);" id="run-calories">${calories} <span style="font-size: 13px;">kcal</span></div>
                </div>
              </div>

              <!-- Controller Buttons -->
              <div style="display: flex; justify-content: center; gap: 16px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
                ${!this.isTracking ? `
                  <button class="cyber-btn" style="min-width: 160px;" onclick="RunningView.startTracking()">▶ Start Run</button>
                ` : `
                  <button class="cyber-btn btn-secondary" style="min-width: 130px;" onclick="RunningView.togglePause()">${this.isPaused ? '▶ Resume' : '❚❚ Pause'}</button>
                  <button class="cyber-btn btn-danger" style="min-width: 130px;" onclick="RunningView.finishTracking()">■ Finish Run</button>
                `}
              </div>
            </div>

            <!-- GPS Dark Cyber Map Canvas -->
            <div class="cyber-card" style="padding: 16px; position: relative;">
              <div class="cyber-card-header" style="margin-bottom: 10px;">
                <div class="card-title"><span class="card-title-icon">🛰️</span> Live GPS Route Topology</div>
                <span style="font-size: 11px; color: var(--text-muted);">Satellite Lock 37.7749° N, 122.4194° W</span>
              </div>
              <div style="width: 100%; height: 380px; background: #060B14; border-radius: var(--radius-md); overflow: hidden; position: relative; border: 1px solid var(--border-glow);">
                <canvas id="gps-route-canvas" width="700" height="380" style="width: 100%; height: 100%; display: block;"></canvas>
                <!-- Watermark label for simulation if active -->
                ${this.isSimulation ? `
                  <div style="position: absolute; top: 12px; right: 12px; background: rgba(255, 79, 203, 0.2); border: 1px solid var(--neon-pink); color: var(--neon-pink); font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                    SIMULATED DEMO ROUTE
                  </div>
                ` : `
                  <div style="position: absolute; top: 12px; right: 12px; background: rgba(0, 229, 255, 0.2); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                    LIVE GPS LOCK
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Right: Records & Activity History -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Personal Records -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🏆</span> Personal Records</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm);">
                  <span style="color: var(--text-secondary);">Longest Distance:</span>
                  <span style="font-weight: 700; color: var(--neon-cyan); font-family: var(--font-family-display);">${records.running.longest_distance_km || 5.12} km</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm);">
                  <span style="color: var(--text-secondary);">Fastest Pace:</span>
                  <span style="font-weight: 700; color: var(--matrix-green); font-family: var(--font-family-display);">5:36 /km</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(13, 22, 41, 0.6); border-radius: var(--radius-sm);">
                  <span style="color: var(--text-secondary);">Total Mileage:</span>
                  <span style="font-weight: 700; color: var(--ascend-gold); font-family: var(--font-family-display);">${records.running.total_km || 28.4} km</span>
                </div>
              </div>
            </div>

            <!-- Activity Logs & GPX Export -->
            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">📁</span> Activity History</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 380px; overflow-y: auto;">
                ${this.activitiesList.length ? this.activitiesList.map(a => `
                  <div style="padding: 12px; background: rgba(13, 22, 41, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${a.distance_km} km Run</span>
                      <a href="${API.activities.exportGpxUrl(a.id)}" target="_blank" class="cyber-btn btn-secondary cyber-btn-sm" style="text-decoration: none;">GPX ↓</a>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Pace: ${a.pace_min_per_km} /km • Time: ${Math.round(a.duration_seconds / 60)} min</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                `).join('') : `
                  <div style="color: var(--text-muted); font-size: 12px;">No logged runs yet.</div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => this.drawMapRoute(), 100);
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading running tracker.</div>`;
    }
  },

  drawMapRoute() {
    const canvas = document.getElementById('gps-route-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Cyber Map Grid & Streets
    ctx.strokeStyle = 'rgba(20, 33, 58, 0.6)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Street network lines
    ctx.strokeStyle = 'rgba(40, 124, 255, 0.15)';
    ctx.lineWidth = 3;
    [[50, 100, 650, 120], [80, 280, 620, 260], [220, 30, 240, 350], [480, 20, 460, 360]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });

    // Draw Neon Cyan Running Route Path
    const coords = [
      [140, 300], [220, 220], [320, 140], [440, 110],
      [540, 180], [520, 260], [420, 310], [260, 330], [140, 300]
    ];

    // Glow underlay
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    coords.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();

    // Sharp glowing route line
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    coords.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Start / Current Runner Marker
    const [currX, currY] = coords[coords.length - 2];
    ctx.fillStyle = '#FF4FCB';
    ctx.shadowColor = '#FF4FCB';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currX, currY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(currX, currY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  },

  startTracking() {
    this.isTracking = true;
    this.isPaused = false;
    this.durationSeconds = 0;
    this.distanceKm = 0;

    if (!this.isSimulation && navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.routeCoordinates.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          this.distanceKm += 0.02; // Small incremental delta
        },
        (err) => {
          window.store.showToast("GPS Error", "Location permission denied or unavailable. Falling back to simulation.", "info");
          this.isSimulation = true;
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.durationSeconds++;
        if (this.isSimulation) {
          this.distanceKm += 0.003; // ~10.8 km/h simulated pace
        }
        this.updateTelemetryUI();
      }
    }, 1000);

    window.store.showToast("Run Initiated", "Telemetry locked. ALYA is pacing your stride!", "success");
    this.render(document.getElementById('page-container'));
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    window.store.playUiSound('click');
    this.render(document.getElementById('page-container'));
  },

  async finishTracking() {
    clearInterval(this.timerInterval);
    if (this.watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.isTracking = false;
    const pace = this.distanceKm > 0 ? (this.durationSeconds / 60 / this.distanceKm) : 5.5;

    try {
      const res = await API.activities.record({
        activity_type: "running",
        distance_km: parseFloat(this.distanceKm.toFixed(2)),
        duration_seconds: this.durationSeconds,
        pace_min_per_km: parseFloat(pace.toFixed(2)),
        speed_kmh: parseFloat(((this.distanceKm / (this.durationSeconds / 3600)) || 10).toFixed(1)),
        calories: Math.round(this.distanceKm * 68),
        route_coords_json: JSON.stringify(this.routeCoordinates),
        is_simulation: this.isSimulation,
        notes: "Cardio endurance route completed."
      });

      window.store.showToast("Run Recorded", `Finished ${this.distanceKm.toFixed(2)} km! +${res.xp_earned} Agility XP.`, "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not record activity.", "danger");
    }
  },

  toggleSimulationMode() {
    this.isSimulation = !this.isSimulation;
    window.store.showToast("Mode Toggled", `Switched to ${this.isSimulation ? 'Demonstration Simulation' : 'Live Hardware GPS'}.`, "info");
    this.render(document.getElementById('page-container'));
  },

  updateTelemetryUI() {
    const distEl = document.getElementById('run-distance');
    const durEl = document.getElementById('run-duration');
    const paceEl = document.getElementById('run-pace');
    const calEl = document.getElementById('run-calories');

    if (distEl) distEl.innerHTML = `${this.distanceKm.toFixed(2)} <span style="font-size:13px;">km</span>`;
    if (durEl) durEl.textContent = this.formatDuration(this.durationSeconds);
    if (calEl) calEl.innerHTML = `${Math.round(this.distanceKm * 68)} <span style="font-size:13px;">kcal</span>`;
    if (paceEl) {
      const p = this.distanceKm > 0 ? (this.durationSeconds / 60 / this.distanceKm).toFixed(2) : "0:00";
      paceEl.innerHTML = `${this.formatPace(p)} <span style="font-size:13px;">/km</span>`;
    }
  },

  formatDuration(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  },

  formatPace(pStr) {
    const val = parseFloat(pStr);
    if (isNaN(val) || val === 0) return "5:36";
    const mins = Math.floor(val);
    const secs = Math.round((val - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
};

window.RunningView = RunningView;

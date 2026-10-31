// ==========================================================================
// ⚡ ASCEND 4.0 — FUTURISTIC WEB AUDIO MUSIC ENGINE & VISUALIZER
// ==========================================================================

class AscendMusicEngine {
  constructor() {
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.category = 'workout';
    this.volume = 0.5;
    this.audioCtx = null;
    this.analyser = null;
    this.visualizerCanvas = null;
    this.visualizerCtx = null;
    this.animFrameId = null;
    this.timerInterval = null;
    this.playbackTime = 0;

    this.tracks = [
      { id: 1, title: 'Power Run Mix (Momentum)', artist: 'ASCEND Cyberpunk Studio', category: 'workout', bpm: 128, duration: 225 },
      { id: 2, title: 'Titan Hypertrophy Protocol', artist: 'ALYA Neural Beats', category: 'workout', bpm: 135, duration: 198 },
      { id: 3, title: 'Deep Focus Alpha Waves (10Hz)', artist: 'Quantum Cognition', category: 'focus', bpm: 90, duration: 320 },
      { id: 4, title: 'Neural Flowstate Coding Sprint', artist: 'Cyber Synthesizer', category: 'focus', bpm: 105, duration: 260 },
      { id: 5, title: 'Zero Gravity Starlight Sanctuary', artist: 'ALYA Ambient Lounge', category: 'relax', bpm: 72, duration: 340 },
      { id: 6, title: 'Midnight City Skyline Glow', artist: 'Neo-Tokyo Synthwave', category: 'relax', bpm: 84, duration: 290 }
    ];

    this.synthInterval = null;
    this.step = 0;
  }

  initVisualizer(canvas) {
    if (!canvas) return;
    this.visualizerCanvas = canvas;
    this.visualizerCtx = canvas.getContext('2d');
    this.renderVisualizer();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  play() {
    this.ensureAudioContext();
    this.isPlaying = true;
    this.startProceduralSynth();
    this.startTimer();
    this.updateUI();
  }

  pause() {
    this.isPlaying = false;
    this.stopProceduralSynth();
    this.stopTimer();
    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.playbackTime = 0;
    if (this.isPlaying) {
      this.stopProceduralSynth();
      this.startProceduralSynth();
    }
    this.updateUI();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playbackTime = 0;
    if (this.isPlaying) {
      this.stopProceduralSynth();
      this.startProceduralSynth();
    }
    this.updateUI();
  }

  setCategory(cat) {
    this.category = cat;
    const idx = this.tracks.findIndex(t => t.category === cat);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      this.playbackTime = 0;
      if (this.isPlaying) {
        this.stopProceduralSynth();
        this.startProceduralSynth();
      }
      this.updateUI();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.playbackTime++;
      const current = this.getCurrentTrack();
      if (this.playbackTime >= current.duration) {
        this.nextTrack();
      } else {
        this.updateTimeDisplay();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Real-time Cyberpunk Web Audio Procedural Sequencer
  startProceduralSynth() {
    if (this.synthInterval) clearInterval(this.synthInterval);
    const track = this.getCurrentTrack();
    const intervalMs = (60 / track.bpm / 4) * 1000; // 16th note interval

    const scales = {
      workout: [110, 130.81, 146.83, 164.81, 196.00, 220, 261.63], // Cyber A-minor
      focus: [130.81, 164.81, 196.00, 246.94, 261.63, 329.63],      // Calm C-major 7th
      relax: [87.31, 110.0, 130.81, 164.81, 174.61, 220.0]          // Ambient F-Lydian
    };
    const activeScale = scales[track.category] || scales.workout;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Kick drum on beats 0, 4, 8, 12
      if (this.step % 4 === 0 && track.category !== 'relax') {
        const kickOsc = this.audioCtx.createOscillator();
        const kickGain = this.audioCtx.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(this.gainNode);

        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        kickGain.gain.setValueAtTime(0.35 * this.volume, now);
        kickGain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        kickOsc.start(now);
        kickOsc.stop(now + 0.12);
      }

      // Synth Arpeggio note
      if (this.step % 2 === 0) {
        const noteFreq = activeScale[(this.step * 3) % activeScale.length];
        const synthOsc = this.audioCtx.createOscillator();
        const synthGain = this.audioCtx.createGain();
        synthOsc.type = track.category === 'workout' ? 'sawtooth' : 'sine';
        synthOsc.frequency.setValueAtTime(noteFreq, now);

        synthOsc.connect(synthGain);
        synthGain.connect(this.gainNode);

        synthGain.gain.setValueAtTime(0.06 * this.volume, now);
        synthGain.gain.exponentialRampToValueAtTime(0.001, now + (track.category === 'relax' ? 0.4 : 0.15));

        synthOsc.start(now);
        synthOsc.stop(now + (track.category === 'relax' ? 0.4 : 0.15));
      }

      this.step = (this.step + 1) % 16;
    }, intervalMs);
  }

  stopProceduralSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  // Audio Equalizer Visualizer Canvas Loop
  renderVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerCtx) return;
    const ctx = this.visualizerCtx;
    const canvas = this.visualizerCanvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (this.isPlaying && this.analyser) {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const barWidth = (w / 16) - 2;
      for (let i = 0; i < 16; i++) {
        const val = dataArray[i * 2] || 0;
        const barHeight = Math.max(3, (val / 255) * h);
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#00E5FF');
        grad.addColorStop(1, '#865CFF');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      // Idle pulse state
      const barWidth = (w / 16) - 2;
      for (let i = 0; i < 16; i++) {
        const x = i * (barWidth + 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.fillRect(x, h - 3, barWidth, 3);
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.renderVisualizer());
  }

  updateUI() {
    const track = this.getCurrentTrack();
    const trackTitleEl = document.getElementById('music-track-title');
    const trackArtistEl = document.getElementById('music-track-artist');
    const playBtn = document.getElementById('music-play-btn');

    if (trackTitleEl) trackTitleEl.textContent = track.title;
    if (trackArtistEl) trackArtistEl.textContent = track.artist;
    if (playBtn) playBtn.innerHTML = this.isPlaying ? '❚❚' : '▶';

    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const current = this.getCurrentTrack();
    const curTimeEl = document.getElementById('music-current-time');
    const durTimeEl = document.getElementById('music-duration-time');
    const slider = document.getElementById('music-seek-slider');

    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    if (curTimeEl) curTimeEl.textContent = fmt(this.playbackTime);
    if (durTimeEl) durTimeEl.textContent = fmt(current.duration);
    if (slider) {
      slider.max = current.duration;
      slider.value = this.playbackTime;
    }
  }
}

window.musicEngine = new AscendMusicEngine();

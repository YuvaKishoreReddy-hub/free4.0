// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA VOICE & SPEECH COMMAND SYSTEM
// ==========================================================================

class AlyaVoiceSystem {
  constructor() {
    this.isListening = false;
    this.isMuted = false;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.pitch = 1.1;
    this.rate = 1.0;
    this.transcriptCallback = null;

    this.initSpeechSynthesis();
    this.initSpeechRecognition();
  }

  initSpeechSynthesis() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Try to find a friendly female voice
      this.selectedVoice = voices.find(v => 
        (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Google UK English Female')) && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web SpeechRecognition is not natively supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoicePill(true);
      window.store.showToast("ALYA Voice Active", "Listening to your command...", "info");
    };

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      this.handleVoiceCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateVoicePill(false);
    };
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) {
      window.store.showToast("Voice Unsupported", "Microphone recognition is not supported in this browser. Please use text chat.", "danger");
      return;
    }
    // Interrupt any ongoing speech
    this.stopSpeaking();
    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateVoicePill(false);
    }
  }

  async handleVoiceCommand(text) {
    if (this.transcriptCallback) {
      this.transcriptCallback(text);
    }

    window.store.emit('voice_transcript', text);

    try {
      // Call ALYA chat endpoint
      const response = await API.alya.chat(text);
      
      // Execute camera or system action if present
      if (response.action && window.alya3D) {
        if (response.action === 'camera_preset') {
          window.alya3D.setCameraPreset(response.payload.view);
        } else if (response.action === 'camera_rotate_step') {
          window.alya3D.rotateByAngle(response.payload.direction === 'left' ? -Math.PI / 4 : Math.PI / 4);
        } else if (response.action === 'camera_spin_360') {
          window.alya3D.spin360();
        } else if (response.action === 'camera_zoom') {
          window.alya3D.zoom(response.payload.delta);
        } else if (response.action === 'camera_reset') {
          window.alya3D.resetCamera();
        } else if (response.action === 'toggle_auto_rotate') {
          window.alya3D.setAutoRotate(response.payload.enabled);
        }
      }

      if (response.expression && window.alya3D) {
        window.alya3D.setExpression(response.expression);
      }

      // Speak back the response
      this.speak(response.reply);
      window.store.emit('alya_message_received', response);
    } catch (err) {
      this.speak("I encountered an issue processing your voice command, but all evolution systems remain stable.");
    }
  }

  speak(text) {
    if (this.isMuted || !this.synth) return;
    this.stopSpeaking();

    // Clean text of expression tags like [happy]
    const cleanText = text.replace(/\[\w+\]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;

    utterance.onstart = () => {
      window.store.emit('alya_speaking_start');
      if (window.alya3D) window.alya3D.setSpeaking(true);
    };

    utterance.onend = () => {
      window.store.emit('alya_speaking_end');
      if (window.alya3D) window.alya3D.setSpeaking(false);
    };

    utterance.onerror = () => {
      if (window.alya3D) window.alya3D.setSpeaking(false);
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      if (window.alya3D) window.alya3D.setSpeaking(false);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopSpeaking();
    return this.isMuted;
  }

  updateVoicePill(active) {
    const pill = document.getElementById('voice-status-pill');
    if (pill) {
      if (active) {
        pill.classList.add('recording');
        pill.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--neon-pink); margin-right:4px;"></span> Listening...`;
      } else {
        pill.classList.remove('recording');
        pill.innerHTML = `<span style="font-size:14px;">🎙️</span> ALYA Voice`;
      }
    }
  }
}

window.voiceSystem = new AlyaVoiceSystem();

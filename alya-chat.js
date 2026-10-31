// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA AI ASSISTANT CHAT VIEW
// ==========================================================================

const AlyaChatView = {
  isSending: false,

  async render(container) {
    try {
      const history = await API.alya.getHistory();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 2px solid var(--neon-cyan); box-shadow: var(--glow-cyan);">
              <img src="/assets/ascend_showcase_1.jpg" alt="ALYA" style="width: 100%; height: 100%; object-fit: cover; object-position: 70% 20%;" />
            </div>
            <div>
              <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">ALYA AI ASSISTANT</h1>
              <p style="color: var(--text-secondary); font-size: 13.5px;">Advanced Life Assistant • Neural Evolution & System Command Bridge</p>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="AlyaChatView.clearHistory()">Clear History</button>
            <button class="cyber-btn btn-secondary cyber-btn-sm" onclick="window.app.navigate('alya-studio')">3D Character Studio ➔</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 24px;">
          <!-- Left: Main Chat Interface -->
          <div class="cyber-card" style="display: flex; flex-direction: column; height: 680px; padding: 20px;">
            <!-- Messages Scroll Box -->
            <div id="alya-chat-messages" style="flex: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 16px;">
              ${history.map(m => this.renderMessage(m.role, m.content)).join('')}
              ${history.length === 0 ? `
                <div style="text-align: center; margin-top: 100px; color: var(--text-secondary);">
                  <div style="font-size: 32px; margin-bottom: 12px;">💙</div>
                  <h3 style="font-family: var(--font-family-display); font-size: 18px; color: var(--text-primary);">Hello! I am ALYA.</h3>
                  <p style="font-size: 13px; max-width: 440px; margin: 6px auto 0;">Your personal AI companion for fitness, habits, learning, RPG quests, and productivity. How may I assist your evolution today?</p>
                </div>
              ` : ''}
            </div>

            <!-- Suggested Prompts Chips -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 12px 0 10px; border-top: 1px solid var(--border-subtle); margin-top: 10px;">
              <button class="cyber-btn btn-secondary cyber-btn-sm" style="font-size: 11px; white-space: nowrap;" onclick="AlyaChatView.sendQuickPrompt('Give me a full daily briefing of my schedule and quests')">📋 Daily Briefing</button>
              <button class="cyber-btn btn-secondary cyber-btn-sm" style="font-size: 11px; white-space: nowrap;" onclick="AlyaChatView.sendQuickPrompt('Recommend an upper body gym workout for today')">🏋️ Workout Plan</button>
              <button class="cyber-btn btn-secondary cyber-btn-sm" style="font-size: 11px; white-space: nowrap;" onclick="AlyaChatView.sendQuickPrompt('ALYA, rotate 360 degrees in the character studio')">🔄 Rotate 360°</button>
              <button class="cyber-btn btn-secondary cyber-btn-sm" style="font-size: 11px; white-space: nowrap;" onclick="AlyaChatView.sendQuickPrompt('Add task: Synthesize neural AI embeddings')">🎯 Add Task</button>
            </div>

            <!-- Chat Input Bar -->
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="text" id="alya-chat-input" class="cyber-input" placeholder="Ask ALYA anything, give a command, or click the mic to speak..." onkeydown="if(event.key==='Enter') AlyaChatView.sendMessage()" />
              <button class="cyber-btn btn-secondary" style="padding: 10px 14px;" onclick="window.voiceSystem.toggleListening()" title="Voice Input">🎙️</button>
              <button class="cyber-btn" onclick="AlyaChatView.sendMessage()">Send ➔</button>
            </div>
          </div>

          <!-- Right: Companion Status & Voice Control Card -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="cyber-card" style="text-align: center;">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">✨</span> Neural Status</div>
              </div>
              <div style="padding: 16px; background: rgba(13, 22, 41, 0.7); border-radius: var(--radius-md); margin-bottom: 14px;">
                <div style="font-size: 11px; color: var(--text-muted);">COGNITION ENGINE</div>
                <div style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--neon-cyan); margin: 4px 0;">ASCEND Neural Core</div>
                <div style="font-size: 11.5px; color: var(--matrix-green);">Response Latency: ~14ms</div>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                ALYA can execute system commands directly, log workouts, add tasks, schedule calendar events, and control her 3D character camera.
              </p>
            </div>

            <div class="cyber-card">
              <div class="cyber-card-header">
                <div class="card-title"><span class="card-title-icon">🎙️</span> Voice Commands</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11.5px; color: var(--text-secondary);">
                <div>• "ALYA, face front"</div>
                <div>• "ALYA, turn left / right"</div>
                <div>• "ALYA, rotate 360 degrees"</div>
                <div>• "ALYA, zoom in / zoom out"</div>
                <div>• "ALYA, reset camera"</div>
                <div>• "Add task: [Task Title]"</div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.scrollToBottom();
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading ALYA chat.</div>`;
    }
  },

  renderMessage(role, content) {
    const isAlya = (role === 'alya');
    return `
      <div style="display: flex; gap: 12px; align-items: flex-start; align-self: ${isAlya ? 'flex-start' : 'flex-end'}; max-width: 80%;">
        ${isAlya ? `
          <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--neon-cyan); flex-shrink: 0;">
            <img src="/assets/ascend_showcase_1.jpg" alt="ALYA" style="width: 100%; height: 100%; object-fit: cover; object-position: 70% 20%;" />
          </div>
        ` : ''}
        <div style="padding: 12px 16px; background: ${isAlya ? 'rgba(13, 22, 41, 0.9)' : 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(40, 124, 255, 0.25))'}; border: 1px solid ${isAlya ? 'var(--border-subtle)' : 'var(--neon-cyan)'}; border-radius: ${isAlya ? '4px 16px 16px 16px' : '16px 4px 16px 16px'}; color: var(--text-primary); font-size: 13.5px; line-height: 1.5; box-shadow: ${isAlya ? 'none' : '0 0 10px rgba(0, 229, 255, 0.2)'};">
          ${content}
        </div>
      </div>
    `;
  },

  async sendMessage() {
    const input = document.getElementById('alya-chat-input');
    if (!input || !input.value.trim() || this.isSending) return;

    const text = input.value.trim();
    input.value = '';
    this.isSending = true;

    const chatBox = document.getElementById('alya-chat-messages');
    if (chatBox) {
      chatBox.innerHTML += this.renderMessage('user', text);
      this.scrollToBottom();
    }

    try {
      const res = await API.alya.chat(text);
      if (chatBox) {
        chatBox.innerHTML += this.renderMessage('alya', res.reply);
        this.scrollToBottom();
      }

      // Execute action if provided
      if (res.action && window.alya3D) {
        if (res.action === 'camera_preset') window.alya3D.setCameraPreset(res.payload.view);
        else if (res.action === 'camera_spin_360') window.alya3D.spin360();
        else if (res.action === 'camera_reset') window.alya3D.resetCamera();
        else if (res.action === 'camera_zoom') window.alya3D.zoom(res.payload.delta);
        else if (res.action === 'toggle_auto_rotate') window.alya3D.setAutoRotate(res.payload.enabled);
      }

      // Speak response aloud
      window.voiceSystem.speak(res.reply);
    } catch (e) {
      if (chatBox) chatBox.innerHTML += this.renderMessage('alya', 'Error connecting to neural cognition core.');
    } finally {
      this.isSending = false;
    }
  },

  sendQuickPrompt(promptText) {
    const input = document.getElementById('alya-chat-input');
    if (input) {
      input.value = promptText;
      this.sendMessage();
    }
  },

  async clearHistory() {
    try {
      await API.alya.clearHistory();
      window.store.showToast("History Cleared", "Conversation memory reset.", "info");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not clear history.", "danger");
    }
  },

  scrollToBottom() {
    const box = document.getElementById('alya-chat-messages');
    if (box) box.scrollTop = box.scrollHeight;
  }
};

window.AlyaChatView = AlyaChatView;

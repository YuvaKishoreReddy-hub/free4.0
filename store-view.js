// ==========================================================================
// ⚡ ASCEND 4.0 — REWARDS STORE VIEW
// ==========================================================================

const StoreView = {
  currentFilter: 'All',

  async render(container) {
    try {
      const items = await API.player.getStore();
      const status = await API.player.getStatus();
      const categories = ['All', 'outfit', 'hairstyle', 'accessory', 'aura', 'room_decor'];

      const filteredItems = (this.currentFilter === 'All')
        ? items
        : items.filter(it => it.category === this.currentFilter);

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-family: var(--font-family-display); font-size: 24px; font-weight: 800; letter-spacing: 1px;">REWARDS STORE</h1>
            <p style="color: var(--text-secondary); font-size: 13.5px;">Acquire custom 3D outfits, accessories, holographic auras, and room decors with virtual credits.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 16px; padding: 8px 16px; background: rgba(13, 22, 41, 0.8); border: 1px solid var(--border-glow); border-radius: var(--radius-lg);">
            <span style="font-family: var(--font-family-display); font-size: 14px; color: var(--ascend-gold); font-weight: 800;">🪙 ${status.credits} Credits</span>
            <span style="font-family: var(--font-family-display); font-size: 14px; color: var(--neon-cyan); font-weight: 800;">💎 ${status.shards} Shards</span>
          </div>
        </div>

        <!-- Filter Bar -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto;">
          ${categories.map(c => `
            <button class="cyber-btn ${this.currentFilter === c ? '' : 'btn-secondary'} cyber-btn-sm" onclick="StoreView.setFilter('${c}')">
              ${c.replace('_', ' ').toUpperCase()}
            </button>
          `).join('')}
        </div>

        <!-- Catalog Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          ${filteredItems.map(item => `
            <div class="cyber-card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <span style="font-size: 10px; font-family: var(--font-family-display); font-weight: 700; color: var(--neon-cyan); text-transform: uppercase;">${item.category.replace('_', ' ')}</span>
                    <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${item.name}</h3>
                  </div>
                  <span style="font-size: 20px;">✨</span>
                </div>
                <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">${item.description}</p>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
                  <div>
                    ${item.is_owned ? `
                      <span style="font-size: 11px; font-weight: 700; color: ${item.is_equipped ? 'var(--matrix-green)' : 'var(--neon-cyan)'}; font-family: var(--font-family-display);">
                        ${item.is_equipped ? '✓ EQUIPPED' : 'OWNED'}
                      </span>
                    ` : `
                      <span style="font-family: var(--font-family-display); font-size: 14px; font-weight: 800; color: var(--ascend-gold);">🪙 ${item.cost_credits}</span>
                    `}
                  </div>

                  <div>
                    ${item.is_owned ? `
                      <button class="cyber-btn ${item.is_equipped ? 'btn-secondary' : ''} cyber-btn-sm" ${item.is_equipped ? 'disabled' : ''} onclick="StoreView.equipItem('${item.id}')">
                        ${item.is_equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ` : `
                      <button class="cyber-btn cyber-btn-sm" onclick="StoreView.buyItem('${item.id}')">
                        Buy Item
                      </button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="cyber-card">Error loading rewards store.</div>`;
    }
  },

  setFilter(filter) {
    this.currentFilter = filter;
    this.render(document.getElementById('page-container'));
  },

  async buyItem(itemId) {
    try {
      await API.player.buyItem(itemId);
      window.store.showToast("Item Purchased", "Item added to your inventory and equipped!", "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Purchase Failed", e.message || "Insufficient Credits.", "danger");
    }
  },

  async equipItem(itemId) {
    try {
      await API.player.equipItem(itemId);
      window.store.showToast("Item Equipped", "ALYA's 3D model & visual loadout synchronized!", "success");
      this.render(document.getElementById('page-container'));
    } catch (e) {
      window.store.showToast("Error", "Could not equip item.", "danger");
    }
  }
};

window.StoreView = StoreView;

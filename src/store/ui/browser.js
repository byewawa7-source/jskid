/**
 * jStore UI Browser Component
 * No inline onclick — uses bindUI() for event delegation.
 */
(function(global) {
  "use strict";

  class StoreUIBrowser {
    constructor() {
      this.client = global.jskidStoreClient;
      this.installer = global.jskidInstaller;
      this._loading = false;
      this._error = null;
    }

    async renderBrowser() {
      this._loading = true;
      this._error = null;

      let html = `<div style="display:flex;flex-direction:column;gap:20px;">`;

      // Search bar
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
          <input type="text" id="jskid-store-search" placeholder="Search mods by name, tag, or author..." style="flex:1;padding:10px 16px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-surface);color:white;font-size:14px;" />
          <button id="jskid-store-upload-btn" style="padding:10px 16px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:white;border:none;font-weight:600;cursor:pointer;">+ Upload Mod</button>
        </div>
        <div id="jskid-store-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
          <div style="text-align:center;padding:48px;color:var(--jskid-text-muted);">Loading store index...</div>
        </div>
      `;

      html += `</div>`;

      // Trigger async load
      setTimeout(() => this._loadMods(), 0);

      return html;
    }

    async _loadMods() {
      const grid = document.getElementById("jskid-store-grid");
      if (!grid) return;

      try {
        const index = await this.client.fetchIndex();
        const mods = index.mods || [];
        this._renderGrid(mods);
        this._error = null;
      } catch (err) {
        this._error = err.message || "Store unavailable";
        grid.innerHTML = `
          <div style="text-align:center;padding:48px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px dashed var(--jskid-border);grid-column:1/-1;">
            <p style="color:var(--jskid-text-muted);margin-bottom:12px;">${this._error}</p>
            <button id="jskid-store-retry" style="padding:8px 16px;border-radius:6px;background:#7c3aed;color:white;border:none;font-weight:600;cursor:pointer;">Retry</button>
          </div>
        `;
        const retryBtn = document.getElementById("jskid-store-retry");
        if (retryBtn) retryBtn.onclick = () => this._loadMods();
      } finally {
        this._loading = false;
      }
    }

    _renderGrid(mods) {
      const grid = document.getElementById("jskid-store-grid");
      if (!grid) return;

      if (mods.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:48px;color:var(--jskid-text-muted);grid-column:1/-1;">No mods found.</div>`;
        return;
      }

      let html = "";
      for (const m of mods) {
        const isInstalled = global.jskidModManager && global.jskidModManager.mods.has(m.id);
        html += `
          <div style="background:var(--jskid-surface);border:1px solid var(--jskid-border);border-radius:12px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <span style="font-weight:700;font-size:15px;color:#f8fafc;">${m.name}</span>
                <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(124,58,237,0.2);color:#c084fc;">v${m.version}</span>
              </div>
              <p style="font-size:12px;color:var(--jskid-text-muted);margin-bottom:12px;height:36px;overflow:hidden;text-overflow:ellipsis;">${m.description}</p>
              <div style="display:flex;gap:12px;font-size:12px;color:var(--jskid-text-muted);margin-bottom:12px;">
                <span>★ ${m.rating}</span>
                <span>↓ ${m.downloads}</span>
                <span>by ${m.author}</span>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;margin-top:8px;">
              <button class="jskid-store-detail" data-mod-id="${m.id}" style="background:transparent;border:none;color:#38bdf8;font-size:13px;font-weight:600;cursor:pointer;">Details</button>
              <button class="jskid-store-install" data-mod-id="${m.id}" style="padding:6px 14px;border-radius:6px;border:none;font-weight:600;cursor:pointer;background:${isInstalled?'#334155':'#7c3aed'};color:white;" ${isInstalled?'disabled':''}>
                ${isInstalled ? 'Installed' : 'Install'}
              </button>
            </div>
          </div>
        `;
      }
      grid.innerHTML = html;
    }

    bindUI() {
      // Search
      const searchInput = document.getElementById("jskid-store-search");
      if (searchInput) {
        searchInput.onkeyup = (e) => this.onSearch(e.target.value);
      }

      // Upload button
      const uploadBtn = document.getElementById("jskid-store-upload-btn");
      if (uploadBtn) {
        uploadBtn.onclick = () => {
          if (global.jskidStoreUIUpload) {
            const container = document.getElementById("jskid-tab-content");
            if (container) {
              container.innerHTML = global.jskidStoreUIUpload.renderUpload();
              global.jskidStoreUIUpload.bindUI();
            }
          }
        };
      }

      // Detail buttons
      document.querySelectorAll(".jskid-store-detail").forEach(btn => {
        btn.onclick = () => {
          const modId = btn.dataset.modId;
          if (global.jskidStoreUIDetail) {
            const container = document.getElementById("jskid-tab-content");
            if (container) {
              container.innerHTML = global.jskidStoreUIDetail.renderDetail(modId);
              global.jskidStoreUIDetail.bindUI();
            }
          }
        };
      });

      // Install buttons
      document.querySelectorAll(".jskid-store-install").forEach(btn => {
        btn.onclick = async () => {
          const modId = btn.dataset.modId;
          if (global.jskidInstaller) {
            btn.textContent = "Installing...";
            btn.disabled = true;
            try {
              await global.jskidInstaller.install(modId);
              if (global.jskidEngine) global.jskidEngine.switchTab("store");
            } catch (err) {
              btn.textContent = "Failed";
              console.error("[jStore] Install error:", err);
            }
          }
        };
      });
    }

    onSearch(query) {
      if (!this.client) return;
      const results = this.client.searchMods(query);
      this._renderGrid(results);
    }
  }

  global.StoreUIBrowser = StoreUIBrowser;
  if (!global.jskidStoreUI) {
    global.jskidStoreUI = new StoreUIBrowser();
  }
})(typeof window !== "undefined" ? window : globalThis);
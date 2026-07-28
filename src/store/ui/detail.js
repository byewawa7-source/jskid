/**
 * jStore UI Detail View Component
 */
(function(global) {
  "use strict";

  class StoreUIDetail {
    constructor() {
      this.client = global.jskidStoreClient;
    }

    renderDetail(modId) {
      const index = (this.client && this.client.cache) || { mods: [] };
      const mod = index.mods.find((m) => m.id === modId) || {
        id: modId,
        name: modId,
        version: "1.0.0",
        author: "Unknown",
        description: "No description available.",
        type: "chat",
        downloads: 0,
        rating: 5.0,
        tags: []
      };

      const isInstalled = global.jskidModManager && global.jskidModManager.mods.has(modId);

      return `
        <div style="display:flex;flex-direction:column;gap:20px;">
          <button id="jskid-detail-back" style="align-self:flex-start;padding:6px 12px;border-radius:6px;background:transparent;border:1px solid var(--jskid-border);color:var(--jskid-text-muted);cursor:pointer;">← Back to Store</button>
          <div style="background:var(--jskid-surface);border:1px solid var(--jskid-border);border-radius:12px;padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
              <div>
                <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">${mod.name}</h1>
                <p style="font-size:13px;color:var(--jskid-text-muted);">by ${mod.author} • v${mod.version}</p>
              </div>
              <button id="jskid-detail-install" data-mod-id="${mod.id}" style="padding:10px 24px;border-radius:8px;border:none;font-weight:700;cursor:pointer;background:${isInstalled?'#334155':'#7c3aed'};color:white;" ${isInstalled?'disabled':''}>
                ${isInstalled ? 'Installed' : 'Install Mod'}
              </button>
            </div>
            <div style="margin-bottom:24px;">
              <h3 style="font-weight:700;font-size:14px;margin-bottom:8px;">Description</h3>
              <p style="font-size:14px;line-height:1.6;color:var(--jskid-text);">${mod.description}</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;">
              <div>
                <span style="font-size:12px;color:var(--jskid-text-muted);">Permissions Required:</span>
                <ul style="font-size:13px;padding-left:20px;margin-top:4px;color:#a78bfa;">
                  <li>read:chat</li>
                  <li>write:chat</li>
                  <li>storage</li>
                </ul>
              </div>
              <div>
                <span style="font-size:12px;color:var(--jskid-text-muted);">Details:</span>
                <p style="font-size:13px;margin-top:4px;">Type: <strong>${mod.type}</strong></p>
                <p style="font-size:13px;">Downloads: <strong>${mod.downloads}</strong></p>
                <p style="font-size:13px;">Rating: <strong>★ ${mod.rating}</strong></p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    bindUI() {
      const backBtn = document.getElementById("jskid-detail-back");
      if (backBtn) {
        backBtn.onclick = () => {
          if (global.jskidEngine) global.jskidEngine.switchTab("store");
        };
      }

      const installBtn = document.getElementById("jskid-detail-install");
      if (installBtn && !installBtn.disabled) {
        installBtn.onclick = async () => {
          const modId = installBtn.dataset.modId;
          if (global.jskidInstaller) {
            installBtn.textContent = "Installing...";
            installBtn.disabled = true;
            try {
              await global.jskidInstaller.install(modId);
              if (global.jskidEngine) global.jskidEngine.switchTab("store");
            } catch (err) {
              installBtn.textContent = "Failed";
              console.error("[jStore] Install error:", err);
            }
          }
        };
      }
    }
  }

  global.StoreUIDetail = StoreUIDetail;
  if (!global.jskidStoreUIDetail) {
    global.jskidStoreUIDetail = new StoreUIDetail();
  }
})(typeof window !== "undefined" ? window : globalThis);
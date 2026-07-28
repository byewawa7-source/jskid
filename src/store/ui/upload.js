/**
 * jStore UI Upload Wizard Component
 */
(function(global) {
  "use strict";

  class StoreUIUpload {
    constructor() {}

    renderUpload() {
      return `
        <div style="display:flex;flex-direction:column;gap:20px;">
          <button id="jskid-upload-back" style="align-self:flex-start;padding:6px 12px;border-radius:6px;background:transparent;border:1px solid var(--jskid-border);color:var(--jskid-text-muted);cursor:pointer;">← Back to Store</button>
          <div style="background:var(--jskid-surface);border:1px solid var(--jskid-border);border-radius:12px;padding:24px;">
            <h1 style="font-size:20px;font-weight:800;margin-bottom:4px;">Upload Mod to jStore</h1>
            <p style="font-size:13px;color:var(--jskid-text-muted);margin-bottom:24px;">Submit your jMod to the official community store via GitHub Pull Request.</p>
            <form id="jskid-upload-form" style="display:flex;flex-direction:column;gap:16px;">
              <div>
                <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Mod ID</label>
                <input type="text" id="upload-mod-id" placeholder="my-awesome-mod" required style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-bg-dark);color:white;" />
              </div>
              <div>
                <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Mod Display Name</label>
                <input type="text" id="upload-mod-name" placeholder="My Awesome Mod" required style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-bg-dark);color:white;" />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Version</label>
                  <input type="text" id="upload-mod-version" value="1.0.0" required style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-bg-dark);color:white;" />
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Type</label>
                  <select id="upload-mod-type" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-bg-dark);color:white;">
                    <option value="chat">Chat Mod</option>
                    <option value="global">Global Mod</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Description</label>
                <textarea id="upload-mod-desc" rows="3" placeholder="Explain what your mod does..." required style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:var(--jskid-bg-dark);color:white;"></textarea>
              </div>
              <div>
                <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">jSkript Source Code (main.jsk)</label>
                <textarea id="upload-mod-code" rows="8" placeholder="on chat message:&#10;  reply "Hello from jSkript!"&#10;end on" required style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--jskid-border);background:#090d16;color:#a78bfa;font-family:monospace;font-size:13px;"></textarea>
              </div>
              <button type="submit" style="padding:12px 24px;border-radius:8px;border:none;font-weight:700;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:white;cursor:pointer;align-self:flex-end;">
                Submit Pull Request to jStore
              </button>
            </form>
          </div>
        </div>
      `;
    }

    bindUI() {
      const backBtn = document.getElementById("jskid-upload-back");
      if (backBtn) {
        backBtn.onclick = () => {
          if (global.jskidEngine) global.jskidEngine.switchTab("store");
        };
      }

      const form = document.getElementById("jskid-upload-form");
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          this.submitMod();
        };
      }
    }

    async submitMod() {
      const id = document.getElementById("upload-mod-id").value;
      const name = document.getElementById("upload-mod-name").value;
      const version = document.getElementById("upload-mod-version").value;
      const type = document.getElementById("upload-mod-type").value;
      const description = document.getElementById("upload-mod-desc").value;
      const code = document.getElementById("upload-mod-code").value;

      const manifest = { id, name, version, type, description };
      try {
        if (global.jskidGitHubStoreAPI) {
          const res = await global.jskidGitHubStoreAPI.submitModPR(manifest, code);
          alert(`Mod submission created! PR: ${res.prUrl}`);
        } else {
          alert("Mod submission prepared successfully!");
        }
        if (global.jskidEngine) global.jskidEngine.switchTab("store");
      } catch (err) {
        alert(`Error submitting mod: ${err.message}`);
      }
    }
  }

  global.StoreUIUpload = StoreUIUpload;
  if (!global.jskidStoreUIUpload) {
    global.jskidStoreUIUpload = new StoreUIUpload();
  }
})(typeof window !== "undefined" ? window : globalThis);
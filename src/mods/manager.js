/**
 * jMod System Manager (Simplified)
 * Chat and Global mod support with permission enforcement.
 */
(function(global) {
  "use strict";

  class ModManager {
    constructor() {
      this.mods = new Map();        // modId -> { manifest, source, enabled, type }
      this.storage = global.jskidStorage;
      this.activeChatId = null;
    }

    async init() {
      const installed = await this.storage.getData("settings", "installed_mods");
      if (installed && Array.isArray(installed)) {
        for (const item of installed) {
          this.mods.set(item.manifest.id, {
            manifest: item.manifest,
            source: item.source,
            enabled: item.enabled || false,
            type: item.manifest.type || "global"
          });
          if (item.enabled && item.manifest.type === "global") {
            this._runMod(item.manifest.id, { event: "init" });
          }
        }
      }
    }

    async _save() {
      const list = [];
      for (const [id, mod] of this.mods.entries()) {
        list.push({ manifest: mod.manifest, source: mod.source, enabled: mod.enabled });
      }
      await this.storage.storeData("settings", "installed_mods", list);
    }

    _validateManifest(manifest) {
      if (!manifest || typeof manifest !== "object") throw new Error("Invalid manifest");
      if (!manifest.id || typeof manifest.id !== "string") throw new Error("Missing mod 'id'");
      if (!manifest.name || typeof manifest.name !== "string") throw new Error("Missing mod 'name'");
      if (!manifest.version || typeof manifest.version !== "string") throw new Error("Missing mod 'version'");
      if (!manifest.type || !["global", "chat"].includes(manifest.type)) throw new Error(`Invalid mod type '${manifest.type}'`);
      if (manifest.permissions && !Array.isArray(manifest.permissions)) throw new Error("Permissions must be an array");
      return true;
    }

    _versionSatisfies(version, requirement) {
      if (!requirement || requirement === "*") return true;
      const match = requirement.match(/^([><=!~^]*)?(.*)/);
      if (!match) return false;
      const op = match[1] || "=";
      const req = match[2].trim();
      const vParts = version.split(".").map(Number);
      const rParts = req.split(".").map(Number);
      const cmp = (a, b) => {
        for (let i = 0; i < 3; i++) {
          if ((a[i] || 0) > (b[i] || 0)) return 1;
          if ((a[i] || 0) < (b[i] || 0)) return -1;
        }
        return 0;
      };
      switch (op) {
        case ">=": return cmp(vParts, rParts) >= 0;
        case ">": return cmp(vParts, rParts) > 0;
        case "<=": return cmp(vParts, rParts) <= 0;
        case "<": return cmp(vParts, rParts) < 0;
        case "^": return cmp(vParts, rParts) >= 0 && vParts[0] === rParts[0];
        case "~": return cmp(vParts, rParts) >= 0 && vParts[0] === rParts[0] && vParts[1] === rParts[1];
        default: return cmp(vParts, rParts) === 0;
      }
    }

    _runMod(modId, eventData = {}) {
      const mod = this.mods.get(modId);
      if (!mod || !mod.enabled || !mod.source) return;

      try {
        const lexer = new global.JSkriptLexer(mod.source);
        const tokens = lexer.tokenize();
        const parser = new global.JSkriptParser(tokens);
        const ast = parser.parse();
        const compiler = new global.JSkriptCompiler();
        const bytecode = compiler.compile(ast);
        const permissions = new global.PermissionManager(modId, mod.manifest.permissions || []);
        const runtime = new global.JSkriptRuntime(global.jskidStdlib);
        const storage = this.storage.getModStorage(modId, { chatId: mod.type === "global" ? "global" : (this.activeChatId || "global") });

        runtime.registerNative("reply", (text) => {
          permissions.check("write:chat");
          if (global.janitorAPI && this.activeChatId) {
            return global.janitorAPI.sendMessage(this.activeChatId, text);
          }
          console.log(`[Mod ${modId} Reply]:`, text);
        });
        runtime.registerNative("showUI", (html) => {
          permissions.check("write:ui");
          if (global.jskidDOMInjector) global.jskidDOMInjector.inject(html);
        });
        runtime.registerNative("getStorage", async (key) => permissions.check("read:storage") && await storage.get(key));
        runtime.registerNative("setStorage", async (key, val) => permissions.check("write:storage") && await storage.set(key, val));

        runtime.execute(bytecode, { modId, permissions, maxSteps: 100000 });
      } catch (err) {
        console.error(`[jMod] Error running ${modId}:`, err);
      }
    }

    async install(manifest, source) {
      this._validateManifest(manifest);
      this.mods.set(manifest.id, { manifest, source, enabled: false, type: manifest.type });
      await this._save();
    }

    async uninstall(modId) {
      const mod = this.mods.get(modId);
      if (mod && mod.enabled) await this.disable(modId);
      this.mods.delete(modId);
      await this._save();
    }

    async enable(modId) {
      const mod = this.mods.get(modId);
      if (!mod) return;
      mod.enabled = true;
      this._runMod(modId, { event: "enable" });
      await this._save();
    }

    async disable(modId) {
      const mod = this.mods.get(modId);
      if (!mod) return;
      mod.enabled = false;
      await this._save();
    }

    async toggle(modId) {
      const mod = this.mods.get(modId);
      if (!mod) return;
      if (mod.enabled) await this.disable(modId);
      else await this.enable(modId);
    }

    isEnabled(modId) {
      const mod = this.mods.get(modId);
      return mod ? mod.enabled : false;
    }

    async resolveChatDependencies(chatId, characterId, dependencies = []) {
      const results = { required: { accept: [], install: [] }, optional: { accept: [], install: [] }, skipped: [] };
      for (const dep of dependencies) {
        const mod = this.mods.get(dep.id);
        if (mod && mod.enabled && this._versionSatisfies(mod.manifest.version, dep.version)) {
          results.skipped.push(dep);
        } else if (dep.required) {
          if (this.mods.has(dep.id)) results.required.accept.push(dep);
          else results.required.install.push(dep);
        } else {
          if (this.mods.has(dep.id)) results.optional.accept.push(dep);
          else results.optional.install.push(dep);
        }
      }
      return results;
    }

    setActiveChat(chatId) {
      this.activeChatId = chatId;
      for (const [id, mod] of this.mods) {
        if (mod.enabled && mod.type === "chat") this._runMod(id, { event: "chat:enter" });
      }
    }

    getInstalled() {
      return Array.from(this.mods.values()).map(m => m.manifest);
    }

    getManifest(modId) {
      const mod = this.mods.get(modId);
      return mod ? mod.manifest : null;
    }

    async exportMod(modId) {
      const mod = this.mods.get(modId);
      if (!mod || !mod.source) return;

      try {
        const format = global.jskidJModFormat;
        if (!format) throw new Error("jMod format handler not available");

        const blob = await format.packMod(mod.manifest, mod.source);
        const filename = `${mod.manifest.id}-${mod.manifest.version}.jmod`;
        format.downloadBlob(blob, filename);
      } catch (err) {
        console.error(`[jMod] Export failed for ${modId}:`, err);
        alert(`Failed to export mod: ${err.message}`);
      }
    }

    async importMod(file) {
      try {
        const format = global.jskidJModFormat;
        if (!format) throw new Error("jMod format handler not available");

        const buffer = await format.readFileAsArrayBuffer(file);
        const { manifest, source } = await format.unpackMod(buffer);

        this._validateManifest(manifest);

        const modId = manifest.id;
        if (this.mods.has(modId)) {
          if (!confirm(`Mod "${manifest.name}" is already installed. Replace?`)) {
            return;
          }
          await this.uninstall(modId);
        }

        this.mods.set(modId, { manifest, source, enabled: false, type: manifest.type });
        await this._save();

        alert(`Mod "${manifest.name}" imported successfully!`);
        if (global.jskidEngine) global.jskidEngine.switchTab("mods");
      } catch (err) {
        console.error("[jMod] Import failed:", err);
        alert(`Failed to import mod: ${err.message}`);
      }
    }

    renderUI() {
      const items = Array.from(this.mods.values());
      let html = `<div style="display:flex;flex-direction:column;gap:16px;">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="font-size:18px;font-weight:700;">Installed jMods</h2><div style="display:flex;gap:8px;align-items:center;"><span style="font-size:13px;color:var(--jskid-text-muted);">${items.length} mods</span><button class="jskid-mod-import" style="padding:6px 12px;border-radius:6px;border:1px solid var(--jskid-border);font-weight:600;cursor:pointer;background:var(--jskid-surface);color:#c084fc;">Import .jmod</button><input type="file" accept=".jmod" class="jskid-mod-file-input" style="display:none;"></div></div>`;

      if (items.length === 0) {
        html += `<div style="text-align:center;padding:48px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px dashed var(--jskid-border);"><p style="color:var(--jskid-text-muted);margin-bottom:12px;">No mods installed yet.</p><p style="font-size:13px;">Browse <strong>jStore</strong> or <strong>import a .jmod file</strong> to get started!</p></div>`;
      } else {
        html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">`;
        for (const [id, mod] of this.mods) {
          const enabled = mod.enabled;
          html += `
            <div style="background:var(--jskid-surface);border:1px solid var(--jskid-border);border-radius:12px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                  <span style="font-weight:700;font-size:15px;">${mod.manifest.name}</span>
                  <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(124,58,237,0.2);color:#c084fc;">v${mod.manifest.version}</span>
                </div>
                <p style="font-size:12px;color:var(--jskid-text-muted);margin-bottom:12px;">${mod.manifest.description || "No description."}</p>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;margin-top:8px;">
                <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--jskid-text-muted);">${mod.type}</span>
                <div style="display:flex;gap:8px;">
                  <button class="jskid-mod-export" data-mod-id="${id}" style="padding:6px 12px;border-radius:6px;border:none;font-weight:600;cursor:pointer;background:#3b82f6;color:white;">Export .jmod</button>
                  <button class="jskid-mod-toggle" data-mod-id="${id}" style="padding:6px 12px;border-radius:6px;border:none;font-weight:600;cursor:pointer;background:${enabled?'#ef4444':'#10b981'};color:white;">${enabled?'Disable':'Enable'}</button>
                  <button class="jskid-mod-uninstall" data-mod-id="${id}" style="padding:6px 12px;border-radius:6px;border:none;font-weight:600;cursor:pointer;background:#334155;color:#94a3b8;">Uninstall</button>
                </div>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }
      html += `</div>`;
      return html;
    }

    bindUI() {
      document.querySelectorAll(".jskid-mod-toggle").forEach(btn => {
        btn.onclick = async (e) => {
          const id = e.target.dataset.modId;
          await this.toggle(id);
          if (global.jskidEngine) global.jskidEngine.switchTab("mods");
        };
      });
      document.querySelectorAll(".jskid-mod-uninstall").forEach(btn => {
        btn.onclick = async (e) => {
          const id = e.target.dataset.modId;
          await this.uninstall(id);
          if (global.jskidEngine) global.jskidEngine.switchTab("mods");
        };
      });
      document.querySelectorAll(".jskid-mod-export").forEach(btn => {
        btn.onclick = async (e) => {
          const id = e.target.dataset.modId;
          await this.exportMod(id);
        };
      });
      const importBtn = document.querySelector(".jskid-mod-import");
      const fileInput = document.querySelector(".jskid-mod-file-input");
      if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = async () => {
          if (fileInput.files && fileInput.files[0]) {
            await this.importMod(fileInput.files[0]);
            fileInput.value = "";
          }
        };
      }
    }
  }

  global.ModManager = ModManager;
  if (!global.jskidModManager) {
    global.jskidModManager = new ModManager();
  }
})(typeof window !== "undefined" ? window : globalThis);
/**
 * jSkid Core Engine Bootstrap
 * Popup menu, lazy module init, jMod tab registration.
 */
(function(global) {
  "use strict";

  class JSkidEngine {
    constructor() {
      this.version = "1.0.0";
      this.eventBus = global.jskidEventBus || new global.JSkidEventBus();
      this.storage = global.jskidStorage || new global.StorageManager();
      this.domInjector = global.jskidDOMInjector || new global.DOMInjector();
      this.api = global.janitorAPI || new global.JanitorAPI();
      this.modManager = null;
      this.storeClient = null;
      this.tweaksManager = null;
      this.initialized = false;
      this.customTabs = new Map();
    }

    async init() {
      if (this.initialized) return;
      console.log(`%c[jSkid] Initializing v${this.version}...`, "color: #7c3aed; font-weight: bold; font-size: 14px;");

      try {
        await this.storage.initDB();

        // Lazy init — modules may not be loaded yet
        this._lazyInit("modManager", "jskidModManager", "ModManager");
        this._lazyInit("storeClient", "jskidStoreClient", "StoreClient");
        this._lazyInit("tweaksManager", "jskidTweaksManager", "TweaksManager");

        if (this.modManager) await this.modManager.init();

        this.injectCoreStyles();
        this.injectLauncherUI();
        this.domInjector.observePageChanges((path) => this.onRouteChanged(path));

        this.initialized = true;
        this.eventBus.emit("jskid:ready", { version: this.version });
        console.log("%c[jSkid] Engine Ready!", "color: #10b981; font-weight: bold;");
      } catch (err) {
        console.error("[jSkid] Engine init error:", err);
      }
    }

    _lazyInit(prop, globalName, className) {
      if (global[globalName]) {
        this[prop] = global[globalName];
      } else if (global[className]) {
        this[prop] = new global[className]();
        global[globalName] = this[prop];
      }
    }

    _ensureModule(prop, globalName, className) {
      if (this[prop]) return true;
      if (global[globalName]) {
        this[prop] = global[globalName];
        return true;
      }
      if (global[className]) {
        this[prop] = new global[className]();
        global[globalName] = this[prop];
        return true;
      }
      return false;
    }

    // --- Tab Registration for jMods ---
    registerTab(tabId, label, renderFn) {
      this.customTabs.set(tabId, { label, renderFn });
      const tabBar = document.getElementById("jskid-popup-tabs");
      if (tabBar) this._renderTabBar(tabBar);
    }

    unregisterTab(tabId) {
      this.customTabs.delete(tabId);
      const tabBar = document.getElementById("jskid-popup-tabs");
      if (tabBar) this._renderTabBar(tabBar);
    }

    // --- Styles ---
    injectCoreStyles() {
      this.domInjector.addStyles(`
        :root {
          --jskid-primary: #7c3aed;
          --jskid-primary-hover: #6d28d9;
          --jskid-bg-dark: #0f172a;
          --jskid-surface: #1e293b;
          --jskid-border: #334155;
          --jskid-text: #f8fafc;
          --jskid-text-muted: #94a3b8;
          --jskid-accent: #38bdf8;
        }

        .jskid-badge {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          font-weight: 700;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .jskid-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.6);
        }

        .jskid-launcher-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          color: white;
          border: none;
          outline: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 12px rgba(124, 58, 237, 0.5);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }

        .jskid-launcher-btn:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.8);
        }

        /* Popup overlay for click-outside */
        .jskid-popup-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999998;
          display: none;
        }
        .jskid-popup-overlay.active {
          display: block;
        }

        /* Popup menu — positioned, not full-screen */
        .jskid-popup {
          position: fixed;
          bottom: 80px;
          right: 24px;
          z-index: 9999999;
          width: 420px;
          max-height: 70vh;
          background: var(--jskid-bg-dark);
          border: 1px solid var(--jskid-border);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: var(--jskid-text);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          opacity: 0;
          transform: translateY(16px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom right;
        }
        .jskid-popup.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .jskid-popup-header {
          padding: 12px 16px;
          background: var(--jskid-surface);
          border-bottom: 1px solid var(--jskid-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .jskid-popup-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          flex: 1;
          justify-content: center;
        }

        .jskid-popup-tab {
          padding: 6px 10px;
          background: transparent;
          border: none;
          color: var(--jskid-text-muted);
          font-weight: 600;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .jskid-popup-tab.active, .jskid-popup-tab:hover {
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
        }

        .jskid-popup-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          max-height: calc(70vh - 52px);
        }

        .jskid-popup-body::-webkit-scrollbar {
          width: 6px;
        }
        .jskid-popup-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .jskid-popup-body::-webkit-scrollbar-thumb {
          background: var(--jskid-border);
          border-radius: 3px;
        }
      `, "jskid-core-styles");
    }

    // --- Popup UI ---
    injectLauncherUI() {
      const btn = document.createElement("button");
      btn.className = "jskid-launcher-btn";
      btn.title = "jSkid Modding Panel";
      btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
      btn.onclick = () => this.togglePopup();
      document.body.appendChild(btn);

      const overlay = document.createElement("div");
      overlay.className = "jskid-popup-overlay";
      overlay.id = "jskid-popup-overlay";
      overlay.onclick = () => this.closePopup();
      document.body.appendChild(overlay);

      const popup = document.createElement("div");
      popup.className = "jskid-popup";
      popup.id = "jskid-popup";
      popup.innerHTML = `
        <div class="jskid-popup-header">
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <span style="font-weight:800;font-size:16px;background:linear-gradient(135deg,#c084fc,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">jSkid</span>
            <span class="jskid-badge">v${this.version}</span>
          </div>
          <div class="jskid-popup-tabs" id="jskid-popup-tabs"></div>
          <button id="jskid-popup-close" style="background:none;border:none;color:var(--jskid-text-muted);cursor:pointer;font-size:18px;padding:0 4px;flex-shrink:0;">&times;</button>
        </div>
        <div class="jskid-popup-body" id="jskid-popup-body">
          <div id="jskid-tab-content">Loading jSkid...</div>
        </div>
      `;
      document.body.appendChild(popup);

      document.getElementById("jskid-popup-close").onclick = () => this.closePopup();
      this._renderTabBar(document.getElementById("jskid-popup-tabs"));
    }

    _renderTabBar(container) {
      if (!container) return;
      const tabs = [
        { id: "mods", label: "jMods" },
        { id: "store", label: "jStore" },
        { id: "tweaks", label: "jTweaks" }
      ];
      for (const [id, tab] of this.customTabs) {
        tabs.push({ id, label: tab.label });
      }

      container.innerHTML = tabs.map(t =>
        `<button class="jskid-popup-tab" data-tab="${t.id}">${t.label}</button>`
      ).join("");

      container.querySelectorAll(".jskid-popup-tab").forEach(tab => {
        tab.onclick = (e) => {
          container.querySelectorAll(".jskid-popup-tab").forEach(t => t.classList.remove("active"));
          e.target.classList.add("active");
          this.switchTab(e.target.dataset.tab);
        };
      });

      const first = container.querySelector(".jskid-popup-tab");
      if (first) {
        first.classList.add("active");
        this.switchTab(first.dataset.tab);
      }
    }

    togglePopup() {
      const popup = document.getElementById("jskid-popup");
      const overlay = document.getElementById("jskid-popup-overlay");
      if (!popup) return;
      const isActive = popup.classList.toggle("active");
      overlay.classList.toggle("active", isActive);
      if (isActive) {
        const activeTab = document.querySelector(".jskid-popup-tab.active");
        if (activeTab) this.switchTab(activeTab.dataset.tab);
        else this.switchTab("mods");
      }
    }

    closePopup() {
      const popup = document.getElementById("jskid-popup");
      const overlay = document.getElementById("jskid-popup-overlay");
      if (popup) popup.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
    }

    switchTab(tabName) {
      const container = document.getElementById("jskid-tab-content");
      if (!container) return;

      // Check custom tabs first
      if (this.customTabs.has(tabName)) {
        container.innerHTML = this.customTabs.get(tabName).renderFn();
        return;
      }

      switch (tabName) {
        case "mods":
          if (this._ensureModule("modManager", "jskidModManager", "ModManager")) {
            container.innerHTML = this.modManager.renderUI();
            this.modManager.bindUI();
          } else {
            container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>jMod System loading...</div>";
          }
          break;
        case "store":
          if (this._ensureModule("storeClient", "jskidStoreClient", "StoreClient")) {
            if (global.jskidStoreUI) {
              container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>Loading store...</div>";
              global.jskidStoreUI.renderBrowser().then(html => {
                container.innerHTML = html;
                global.jskidStoreUI.bindUI();
              });
            } else {
              container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>jStore loading...</div>";
            }
          } else {
            container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>jStore loading...</div>";
          }
          break;
        case "tweaks":
          if (this._ensureModule("tweaksManager", "jskidTweaksManager", "TweaksManager")) {
            container.innerHTML = this.tweaksManager.renderUI();
            this.tweaksManager.bindUI();
          } else {
            container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>jTweaks loading...</div>";
          }
          break;
        default:
          container.innerHTML = "<div style='text-align:center;padding:24px;color:var(--jskid-text-muted);'>Tab not found.</div>";
      }
    }

    onRouteChanged(path) {
      this.eventBus.emit("jskid:page:change", { path });
    }
  }

  global.JSkidEngine = JSkidEngine;
})(typeof window !== "undefined" ? window : globalThis);
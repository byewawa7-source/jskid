/**
 * jTweaks Settings Manager & CSS Injector
 */
(function(global) {
  "use strict";

  class TweaksManager {
    constructor() {
      this.settings = {};
      this.defaults = {};
      this.definitions = new Map();
      this.listeners = new Map();
      this.domInjector = global.jskidDOMInjector;
    }

    define(key, config) {
      this.definitions.set(key, config);
      this.defaults[key] = config.default;
      const saved = this.load(key);
      this.settings[key] = saved !== null ? saved : config.default;
      this.apply(key, this.settings[key]);
    }

    get(key) {
      return this.settings[key] !== undefined ? this.settings[key] : this.defaults[key];
    }

    set(key, value) {
      this.settings[key] = value;
      this.save(key, value);
      this.notify(key, value);
      this.apply(key, value);
    }

    reset(key) {
      if (this.defaults[key] !== undefined) {
        this.set(key, this.defaults[key]);
      }
    }

    resetAll() {
      for (const key of this.definitions.keys()) {
        this.reset(key);
      }
    }

    apply(key, value) {
      if (typeof document === "undefined") return;
      switch (key) {
        case "darkMode":
          document.documentElement.classList.toggle("jskid-dark", Boolean(value));
          break;
        case "compactMode":
          this.domInjector.addStyles(`
            .chat-message { padding: 4px 8px !important; }
            .chat-header { height: 40px !important; }
          `, "jskid-tweak-compact");
          break;
        case "customCSS":
          this.domInjector.addStyles(value || "", "jskid-tweak-custom-css");
          break;
        case "fontSize":
          document.documentElement.style.setProperty("--jskid-font-size", value);
          break;
      }
    }

    onChange(key, callback) {
      if (!this.listeners.has(key)) this.listeners.set(key, []);
      this.listeners.get(key).push(callback);
    }

    notify(key, value) {
      const cbs = this.listeners.get(key);
      if (cbs) cbs.forEach((cb) => cb(value));
    }

    load(key) {
      try {
        const val = localStorage.getItem(`jskid:setting:${key}`);
        return val !== null ? JSON.parse(val) : null;
      } catch { return null; }
    }

    save(key, value) {
      try {
        localStorage.setItem(`jskid:setting:${key}`, JSON.stringify(value));
      } catch (e) {
        console.error("[jTweaks] Save error:", e);
      }
    }

    exportSettings() {
      return JSON.stringify(this.settings, null, 2);
    }

    importSettings(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        for (const [k, v] of Object.entries(data)) {
          if (this.definitions.has(k)) this.set(k, v);
        }
        return true;
      } catch { return false; }
    }

    renderUI() {
      const categories = {};
      for (const [key, def] of this.definitions.entries()) {
        const cat = def.category || "General";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key, def, value: this.get(key) });
      }

      let html = `<div id="jskid-tweaks-container" style="display:flex;flex-direction:column;gap:24px;">`;
      for (const [catName, items] of Object.entries(categories)) {
        html += `
          <div style="background:var(--jskid-surface);border:1px solid var(--jskid-border);border-radius:12px;padding:20px;">
            <h3 style="font-size:16px;font-weight:700;color:#c084fc;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">${catName}</h3>
            <div style="display:flex;flex-direction:column;gap:16px;">
        `;
        for (const { key, def, value } of items) {
          html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
          html += `<div><div style="font-weight:600;font-size:14px;">${def.label || key}</div><div style="font-size:12px;color:var(--jskid-text-muted);">${def.description || ""}</div></div>`;

          if (def.type === "boolean") {
            html += `<input type="checkbox" class="jskid-tweak-input" data-tweak-key="${key}" ${value?'checked':''} style="width:20px;height:20px;accent-color:#7c3aed;cursor:pointer;" />`;
          } else if (def.type === "enum") {
            html += `<select class="jskid-tweak-input" data-tweak-key="${key}" style="padding:6px 12px;border-radius:6px;background:var(--jskid-bg-dark);color:white;border:1px solid var(--jskid-border);">`;
            for (const opt of def.options || []) {
              html += `<option value="${opt}" ${value===opt?'selected':''}>${opt}</option>`;
            }
            html += `</select>`;
          } else if (def.type === "text") {
            html += `<input type="text" class="jskid-tweak-input" data-tweak-key="${key}" value="${value||''}" style="padding:6px 12px;border-radius:6px;background:var(--jskid-bg-dark);color:white;border:1px solid var(--jskid-border);" />`;
          }

          html += `</div>`;
        }
        html += `</div></div>`;
      }
      html += `</div>`;
      return html;
    }

    bindUI() {
      document.querySelectorAll(".jskid-tweak-input").forEach(el => {
        el.onchange = () => {
          const key = el.dataset.tweakKey;
          let value;
          if (el.type === "checkbox") value = el.checked;
          else if (el.tagName === "SELECT") value = el.value;
          else value = el.value;
          this.set(key, value);
        };
      });
    }
  }

  global.TweaksManager = TweaksManager;
  if (!global.jskidTweaksManager) {
    global.jskidTweaksManager = new TweaksManager();
  }
})(typeof window !== "undefined" ? window : globalThis);
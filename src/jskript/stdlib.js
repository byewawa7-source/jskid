/**
 * jSkript Standard Library (stdlib)
 */
(function(global) {
  "use strict";

  class JSkriptStdlib {
    constructor() {
      this.modules = new Map();
      this.registerBuiltinModules();
    }

    registerBuiltinModules() {
      // stdlib/math
      this.modules.set("stdlib/math", {
        clamp: (val, min, max) => Math.min(Math.max(val, min), max),
        lerp: (a, b, t) => a + (b - a) * t,
        random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        randomFloat: (min, max) => Math.random() * (max - min) + min,
        floor: (x) => Math.floor(x),
        ceil: (x) => Math.ceil(x),
        round: (x) => Math.round(x),
        abs: (x) => Math.abs(x),
        sqrt: (x) => Math.sqrt(x),
        min: (...args) => Math.min(...args),
        max: (...args) => Math.max(...args),
        sin: (rad) => Math.sin(rad),
        cos: (rad) => Math.cos(rad),
        tan: (rad) => Math.tan(rad),
        degToRad: (deg) => (deg * Math.PI) / 180,
        radToDeg: (rad) => (rad * 180) / Math.PI,
        distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        mapRange: (value, inMin, inMax, outMin, outMax) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
      });

      // stdlib/string
      this.modules.set("stdlib/string", {
        length: (str) => String(str).length,
        upper: (str) => String(str).toUpperCase(),
        lower: (str) => String(str).toLowerCase(),
        trim: (str) => String(str).trim(),
        split: (str, delim) => String(str).split(delim),
        join: (arr, delim) => (Array.isArray(arr) ? arr.join(delim) : String(arr)),
        replace: (str, find, rep) => String(str).replace(new RegExp(find, "g"), rep),
        startsWith: (str, prefix) => String(str).startsWith(prefix),
        endsWith: (str, suffix) => String(str).endsWith(suffix),
        contains: (str, sub) => String(str).includes(sub),
        substring: (str, start, end) => String(str).substring(start, end),
        padLeft: (str, len, ch = " ") => String(str).padStart(len, ch),
        padRight: (str, len, ch = " ") => String(str).padEnd(len, ch),
        reverse: (str) => String(str).split("").reverse().join(""),
        format: (tpl, ...args) => tpl.replace(/{(\d+)}/g, (match, number) => typeof args[number] !== "undefined" ? args[number] : match)
      });

      // stdlib/list
      this.modules.set("stdlib/list", {
        length: (arr) => (Array.isArray(arr) ? arr.length : 0),
        first: (arr) => (Array.isArray(arr) ? arr[0] : null),
        last: (arr) => (Array.isArray(arr) ? arr[arr.length - 1] : null),
        get: (arr, idx) => (Array.isArray(arr) ? arr[idx] : null),
        set: (arr, idx, val) => {
          if (Array.isArray(arr)) arr[idx] = val;
          return arr;
        },
        add: (arr, item) => {
          if (Array.isArray(arr)) arr.push(item);
          return arr;
        },
        remove: (arr, item) => {
          if (Array.isArray(arr)) {
            const idx = arr.indexOf(item);
            if (idx > -1) arr.splice(idx, 1);
          }
          return arr;
        },
        removeIndex: (arr, idx) => {
          if (Array.isArray(arr)) arr.splice(idx, 1);
          return arr;
        },
        clear: (arr) => {
          if (Array.isArray(arr)) arr.length = 0;
          return arr;
        },
        contains: (arr, item) => (Array.isArray(arr) ? arr.includes(item) : false),
        indexOf: (arr, item) => (Array.isArray(arr) ? arr.indexOf(item) : -1),
        sort: (arr, asc = true) => (Array.isArray(arr) ? arr.sort((a, b) => (asc ? a - b : b - a)) : []),
        reverse: (arr) => (Array.isArray(arr) ? arr.slice().reverse() : []),
        shuffle: (arr) => {
          if (!Array.isArray(arr)) return [];
          const res = arr.slice();
          for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
          }
          return res;
        },
        slice: (arr, start, end) => (Array.isArray(arr) ? arr.slice(start, end) : []),
        flatten: (arr) => (Array.isArray(arr) ? arr.flat(Infinity) : [])
      });

      // stdlib/object
      this.modules.set("stdlib/object", {
        keys: (obj) => (obj && typeof obj === "object" ? Object.keys(obj) : []),
        values: (obj) => (obj && typeof obj === "object" ? Object.values(obj) : []),
        entries: (obj) => (obj && typeof obj === "object" ? Object.entries(obj) : []),
        hasKey: (obj, key) => (obj && typeof obj === "object" ? key in obj : false),
        get: (obj, key, def = null) => (obj && typeof obj === "object" && key in obj ? obj[key] : def),
        set: (obj, key, val) => {
          if (obj && typeof obj === "object") obj[key] = val;
          return obj;
        },
        remove: (obj, key) => {
          if (obj && typeof obj === "object") delete obj[key];
          return obj;
        },
        merge: (o1, o2) => Object.assign({}, o1, o2),
        clone: (obj) => JSON.parse(JSON.stringify(obj)),
        size: (obj) => (obj && typeof obj === "object" ? Object.keys(obj).length : 0),
        isEmpty: (obj) => (obj && typeof obj === "object" ? Object.keys(obj).length === 0 : true)
      });

      // stdlib/random
      this.modules.set("stdlib/random", {
        int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        float: (min, max) => Math.random() * (max - min) + min,
        boolean: () => Math.random() >= 0.5,
        element: (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null),
        chance: (pct) => Math.random() * 100 < pct,
        guid: () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "guid_" + Math.random().toString(36).slice(2)),
        string: (len = 8) => Math.random().toString(36).substring(2, 2 + len)
      });

      // stdlib/time
      this.modules.set("stdlib/time", {
        now: () => Date.now(),
        format: (ts = Date.now()) => new Date(ts).toISOString(),
        wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
        since: (ts) => Date.now() - ts
      });

      // stdlib/color
      this.modules.set("stdlib/color", {
        rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
        rgba: (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`,
        hex: (hexStr) => hexStr,
        hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
        random: () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
      });

      // stdlib/json
      this.modules.set("stdlib/json", {
        parse: (str) => {
          try { return JSON.parse(str); } catch { return null; }
        },
        stringify: (val, pretty = false) => JSON.stringify(val, null, pretty ? 2 : 0),
        isValid: (str) => {
          try { JSON.parse(str); return true; } catch { return false; }
        }
      });

      // stdlib/event
      this.modules.set("stdlib/event", {
        emit: (name, data) => {
          if (global.jskidEventBus) global.jskidEventBus.emit(name, data);
        },
        on: (name, cb) => {
          if (global.jskidEventBus) return global.jskidEventBus.on(name, cb);
        }
      });
    }

    call(funcPath, args = []) {
      const parts = funcPath.split(".");
      if (parts.length === 2) {
        const modName = `stdlib/${parts[0]}`;
        const funcName = parts[1];
        if (this.modules.has(modName)) {
          const mod = this.modules.get(modName);
          if (typeof mod[funcName] === "function") {
            return mod[funcName](...args);
          }
        }
      }

      // Check bare function across modules
      for (const mod of this.modules.values()) {
        if (typeof mod[funcPath] === "function") {
          return mod[funcPath](...args);
        }
      }
      return null;
    }
  }

  global.JSkriptStdlib = JSkriptStdlib;
  if (!global.jskidStdlib) {
    global.jskidStdlib = new JSkriptStdlib();
  }
})(typeof window !== "undefined" ? window : globalThis);

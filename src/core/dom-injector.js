/**
 * jSkid DOM Injector & Reactive Component Framework
 */
(function(global) {
  "use strict";

  class DOMInjector {
    constructor() {
      this.containerId = "jskid-container";
      this.observer = null;
      this.currentPath = (typeof window !== "undefined" && window.location) ? window.location.pathname : "";
      this.routeCallbacks = new Set();
      this.initContainer();
      this.initObserver();
    }

    initContainer() {
      if (typeof document === "undefined") return;
      let root = document.getElementById(this.containerId);
      if (!root) {
        root = document.createElement("div");
        root.id = this.containerId;
        root.style.position = "relative";
        root.style.zIndex = "99999";
        document.body ? document.body.appendChild(root) : document.addEventListener("DOMContentLoaded", () => document.body.appendChild(root));
      }
      this.container = root;
    }

    /**
     * Wait for an element to match selector (SPA helper)
     */
    waitForElement(selector, timeout = 10000) {
      return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const startTime = Date.now();
        const obs = new MutationObserver(() => {
          const found = document.querySelector(selector);
          if (found) {
            obs.disconnect();
            resolve(found);
          } else if (Date.now() - startTime > timeout) {
            obs.disconnect();
            reject(new Error(`Timeout waiting for selector "${selector}"`));
          }
        });

        obs.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true
        });
      });
    }

    /**
     * Inject HTML string or Node into DOM
     */
    inject(content, position = "beforeend", target = null) {
      const parent = typeof target === "string" ? document.querySelector(target) : (target || this.container);
      if (!parent) {
        console.warn(`[jSkid DOMInjector] Target element not found: ${target}`);
        return null;
      }

      if (typeof content === "string") {
        const template = document.createElement("template");
        template.innerHTML = content.trim();
        const element = template.content.firstElementChild;
        parent.insertAdjacentElement(position, element);
        return element;
      } else if (content instanceof Node) {
        parent.insertAdjacentElement(position, content);
        return content;
      }
      return null;
    }

    /**
     * Inject CSS style string
     */
    addStyles(css, id = null) {
      if (typeof document === "undefined") return;
      if (id && document.getElementById(id)) {
        document.getElementById(id).textContent = css;
        return;
      }
      const style = document.createElement("style");
      if (id) style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    }

    /**
     * Create a simple stateful component
     */
    createComponent(name, renderFn, initialState = {}) {
      let state = { ...initialState };
      let element = null;

      const update = (newState = {}) => {
        state = { ...state, ...newState };
        if (element && element.parentNode) {
          const newHtml = renderFn(state, update);
          const newEl = this.inject(newHtml, "beforebegin", element);
          element.remove();
          element = newEl;
        }
      };

      const html = renderFn(state, update);
      element = this.inject(html, "beforeend", this.container);

      return {
        element,
        getState: () => state,
        setState: update,
        destroy: () => element && element.remove()
      };
    }

    /**
     * Observe URL & SPA mutation changes
     */
    initObserver() {
      if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;

      this.observer = new MutationObserver(() => {
        if (window.location && window.location.pathname !== this.currentPath) {
          this.currentPath = window.location.pathname;
          this.notifyRouteCallbacks(this.currentPath);
        }
      });

      this.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });

      // Hook history methods for immediate pushState/replaceState routing detection
      const origPush = history.pushState;
      const origReplace = history.replaceState;
      const self = this;

      history.pushState = function(...args) {
        origPush.apply(this, args);
        self.checkPathChange();
      };
      history.replaceState = function(...args) {
        origReplace.apply(this, args);
        self.checkPathChange();
      };

      window.addEventListener("popstate", () => this.checkPathChange());
    }

    checkPathChange() {
      if (window.location && window.location.pathname !== this.currentPath) {
        this.currentPath = window.location.pathname;
        this.notifyRouteCallbacks(this.currentPath);
      }
    }

    observePageChanges(callback) {
      this.routeCallbacks.add(callback);
      // Immediately call with initial path
      callback(this.currentPath);
      return () => this.routeCallbacks.delete(callback);
    }

    notifyRouteCallbacks(newPath) {
      for (const cb of this.routeCallbacks) {
        try {
          cb(newPath);
        } catch (e) {
          console.error("[jSkid DOMInjector] Route listener error:", e);
        }
      }
    }
  }

  global.DOMInjector = DOMInjector;
  if (!global.jskidDOMInjector) {
    global.jskidDOMInjector = new DOMInjector();
  }
})(typeof window !== "undefined" ? window : globalThis);

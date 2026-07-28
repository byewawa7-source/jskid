/**
 * jSkid Event Bus
 * Central pub/sub event system for jSkid modules and mods.
 */
(function(global) {
  "use strict";

  class JSkidEventBus {
    constructor() {
      this.listeners = new Map();
      this.onceListeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
      if (typeof callback !== "function") {
        throw new TypeError("Callback must be a function");
      }
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, new Set());
      }
      this.listeners.get(eventName).add(callback);

      return () => this.off(eventName, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName 
     * @param {Function} callback 
     */
    once(eventName, callback) {
      if (typeof callback !== "function") {
        throw new TypeError("Callback must be a function");
      }
      if (!this.onceListeners.has(eventName)) {
        this.onceListeners.set(eventName, new Set());
      }
      this.onceListeners.get(eventName).add(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
      if (this.listeners.has(eventName)) {
        this.listeners.get(eventName).delete(callback);
      }
      if (this.onceListeners.has(eventName)) {
        this.onceListeners.get(eventName).delete(callback);
      }
    }

    /**
     * Emit an event
     * @param {string} eventName 
     * @param {any} data 
     */
    emit(eventName, data) {
      // Regular listeners
      if (this.listeners.has(eventName)) {
        const callbacks = Array.from(this.listeners.get(eventName));
        for (const cb of callbacks) {
          try {
            cb(data);
          } catch (err) {
            console.error(`[jSkid EventBus Error] Event "${eventName}":`, err);
          }
        }
      }

      // One-time listeners
      if (this.onceListeners.has(eventName)) {
        const callbacks = Array.from(this.onceListeners.get(eventName));
        this.onceListeners.delete(eventName);
        for (const cb of callbacks) {
          try {
            cb(data);
          } catch (err) {
            console.error(`[jSkid EventBus Error] Once Event "${eventName}":`, err);
          }
        }
      }

      // Dispatch as window CustomEvent for external scripting
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        }
      } catch (e) {
        // Ignore cross-origin context errors if any
      }
    }

    /**
     * Clear all listeners for an event or all events
     * @param {string} [eventName] 
     */
    clear(eventName) {
      if (eventName) {
        this.listeners.delete(eventName);
        this.onceListeners.delete(eventName);
      } else {
        this.listeners.clear();
        this.onceListeners.clear();
      }
    }
  }

  global.JSkidEventBus = JSkidEventBus;
  if (!global.jskidEventBus) {
    global.jskidEventBus = new JSkidEventBus();
  }
})(typeof window !== "undefined" ? window : globalThis);

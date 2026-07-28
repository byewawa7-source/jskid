/**
 * jSkript Addons API
 * Registration interface for custom JS extensions, events, and native functions.
 */
(function(global) {
  "use strict";

  class JSkriptAddonsAPI {
    constructor() {
      this.customFunctions = new Map();
      this.customEvents = new Map();
      this.customModules = new Map();
    }

    /**
     * Register a new native function for jSkript scripts
     */
    registerFunction(name, spec) {
      if (typeof spec.execute !== "function") {
        throw new TypeError(`Function spec for "${name}" must provide an execute() method`);
      }
      this.customFunctions.set(name, spec);
      if (global.jskidRuntime) {
        global.jskidRuntime.registerNative(name, spec.execute);
      }
      console.log(`[jSkript Addons] Registered function: ${name}`);
    }

    /**
     * Register a custom event trigger
     */
    registerEvent(name, spec) {
      this.customEvents.set(name, spec);
      console.log(`[jSkript Addons] Registered event: ${name}`);
    }

    /**
     * Register a custom standard library module
     */
    registerModule(modulePath, moduleObj) {
      this.customModules.set(modulePath, moduleObj);
      if (global.jskidStdlib) {
        global.jskidStdlib.modules.set(modulePath, moduleObj);
      }
      console.log(`[jSkript Addons] Registered module: ${modulePath}`);
    }
  }

  global.JSkriptAddonsAPI = JSkriptAddonsAPI;
  if (!global.jSkript) {
    global.jSkript = new JSkriptAddonsAPI();
  }
})(typeof window !== "undefined" ? window : globalThis);

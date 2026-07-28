/**
 * jMod Permission Manager & Enforcer
 */
(function(global) {
  "use strict";

  class PermissionError extends Error {
    constructor(message) {
      super(message);
      this.name = "PermissionError";
    }
  }

  class PermissionManager {
    constructor(modId, declaredPermissions = [], level = "chat") {
      this.modId = modId;
      this.permissions = new Set(declaredPermissions);
      this.level = level; // "global" | "chat"
    }

    check(permission, context = {}) {
      if (this.permissions.has("*")) return true;
      if (this.permissions.has(permission)) return true;

      // Handle domain wildcards like http:api.example.com
      if (permission.startsWith("http:") || permission.startsWith("websocket:")) {
        const [method, domain] = permission.split(":");
        return this.checkDomain(domain, method);
      }

      throw new PermissionError(`Mod "${this.modId}" attempted to use permission "${permission}" without declaring it in manifest.json`);
    }

    checkDomain(domain, method = "http") {
      const permWildcard = `${method}:*`;
      const domainPerm = `${method}:${domain}`;

      if (this.permissions.has(permWildcard)) return true;
      if (this.permissions.has(domainPerm)) return true;

      for (const p of this.permissions) {
        if (p.startsWith(`${method}:`) && p.includes("*")) {
          const pattern = p.replace(`${method}:`, "").replace(/\*/g, ".*");
          if (new RegExp(`^${pattern}$`).test(domain)) return true;
        }
      }

      throw new PermissionError(`Mod "${this.modId}" attempted to access network domain "${domain}" via ${method} without permission`);
    }

    has(permission) {
      try {
        return this.check(permission);
      } catch {
        return false;
      }
    }
  }

  global.PermissionError = PermissionError;
  global.PermissionManager = PermissionManager;
})(typeof window !== "undefined" ? window : globalThis);

/**
 * jStore Mod Installer & Updater
 * Uses simplified ModManager API.
 */
(function(global) {
  "use strict";

  class ModInstaller {
    constructor(modManager = null, storeClient = null) {
      this.modManager = modManager || global.jskidModManager;
      this.storeClient = storeClient || global.jskidStoreClient;
    }

    async install(modId) {
      if (!this.modManager || !this.storeClient) {
        throw new Error("ModManager or StoreClient not initialized");
      }

      const manifest = await this.storeClient.getModManifest(modId);

      // Install dependencies recursively
      if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
        for (const dep of manifest.dependencies) {
          if (!this.modManager.mods.has(dep.id)) {
            await this.install(dep.id);
          }
        }
      }

      const source = await this.storeClient.getModSource(modId);
      await this.modManager.install(manifest, source);
      console.log(`[jStore] Installed ${manifest.name} v${manifest.version}`);
      return true;
    }

    async uninstall(modId) {
      if (this.modManager) {
        await this.modManager.uninstall(modId);
      }
    }

    async checkForUpdates() {
      if (!this.modManager || !this.storeClient) return [];
      const updates = [];
      for (const [id, mod] of this.modManager.mods) {
        const storeMod = await this.storeClient.getMod(id);
        if (storeMod && this._compareVersions(storeMod.version, mod.manifest.version) > 0) {
          updates.push({ id, name: mod.manifest.name, current: mod.manifest.version, latest: storeMod.version });
        }
      }
      return updates;
    }

    _compareVersions(v1, v2) {
      const p1 = v1.split(".").map(Number);
      const p2 = v2.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if ((p1[i] || 0) > (p2[i] || 0)) return 1;
        if ((p1[i] || 0) < (p2[i] || 0)) return -1;
      }
      return 0;
    }
  }

  global.ModInstaller = ModInstaller;
  if (!global.jskidInstaller) {
    global.jskidInstaller = new ModInstaller();
  }
})(typeof window !== "undefined" ? window : globalThis);
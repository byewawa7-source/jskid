/**
 * jStore Client
 * Fetches mod index from GitHub repository. No offline fallback — shows 404 if unavailable.
 */
(function(global) {
  "use strict";

  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const method = options.method || "GET";
      GM_xmlhttpRequest({
        url: url,
        method: method,
        headers: options.headers || {},
        data: options.body || null,
        onload: function(response) {
          if (response.status >= 200 && response.status < 300) {
            resolve({
              ok: true,
              status: response.status,
              json: () => Promise.resolve(JSON.parse(response.responseText)),
              text: () => Promise.resolve(response.responseText)
            });
          } else {
            reject({ status: response.status, statusText: response.statusText, url });
          }
        },
        onerror: function(error) {
          reject({ status: 0, statusText: "Network error", url, error });
        }
      });
    });
  }

  class StoreClient {
    constructor() {
      this.indexUrl = "https://raw.githubusercontent.com/byewawa7-source/jskid-store/main/index.json";
      this.cache = null;
      this.cacheTime = 0;
      this.cacheDuration = 5 * 60 * 1000;
      this.lastError = null;
    }

    async fetchIndex(force = false) {
      if (!force && this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
        return this.cache;
      }
      try {
        const response = await gmFetch(this.indexUrl);
        this.cache = await response.json();
        this.cacheTime = Date.now();
        this.lastError = null;
        return this.cache;
      } catch (err) {
        this.lastError = err;
        throw new Error("Store index unavailable. Check your connection or try again later.");
      }
    }

    async getMod(modId) {
      const index = await this.fetchIndex();
      return index.mods.find((m) => m.id === modId) || null;
    }

    async getModManifest(modId) {
      const mod = await this.getMod(modId);
      if (!mod) throw new Error(`Mod "${modId}" not found in store index.`);
      const url = `https://raw.githubusercontent.com/byewawa7-source/jskid-store/main/${mod.path}manifest.json`;
      try {
        const response = await gmFetch(url);
        return await response.json();
      } catch {
        // Return minimal manifest if detailed one fails
        return {
          id: mod.id,
          name: mod.name,
          version: mod.version,
          author: mod.author,
          description: mod.description,
          type: mod.type,
          permissions: ["read:chat", "write:chat", "storage"]
        };
      }
    }

    async getModSource(modId) {
      const mod = await this.getMod(modId);
      if (!mod) throw new Error(`Mod "${modId}" not found in store index.`);
      const url = `https://raw.githubusercontent.com/byewawa7-source/jskid-store/main/${mod.path}main.jsk`;
      try {
        const response = await gmFetch(url);
        return await response.text();
      } catch {
        throw new Error(`Failed to fetch source for "${modId}".`);
      }
    }

    searchMods(query = "", filters = {}) {
      if (!this.cache || !this.cache.mods) return [];
      let results = [...this.cache.mods];
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.author.toLowerCase().includes(q) ||
            (m.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filters.type) results = results.filter((m) => m.type === filters.type);
      if (filters.sort === "downloads") results.sort((a, b) => b.downloads - a.downloads);
      else if (filters.sort === "rating") results.sort((a, b) => b.rating - a.rating);
      return results;
    }
  }

  global.StoreClient = StoreClient;
  if (!global.jskidStoreClient) {
    global.jskidStoreClient = new StoreClient();
  }
})(typeof window !== "undefined" ? window : globalThis);
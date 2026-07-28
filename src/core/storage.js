/**
 * jSkid Storage Layer
 * Manages GM storage, localStorage, IndexedDB, and isolated per-mod storage.
 */
(function(global) {
  "use strict";

  class StorageManager {
    constructor() {
      this.dbName = "jSkidDB";
      this.dbVersion = 2;
      this.dbPromise = null;
    }

    get(key, defaultValue = null) {
      try {
        if (typeof GM_getValue !== "undefined") {
          return GM_getValue(key, defaultValue);
        }
        const val = localStorage.getItem(`jskid:${key}`);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch (e) {
        console.warn(`[jSkid Storage] Failed to get ${key}:`, e);
        return defaultValue;
      }
    }

    set(key, value) {
      try {
        if (typeof GM_setValue !== "undefined") {
          GM_setValue(key, value);
        } else {
          localStorage.setItem(`jskid:${key}`, JSON.stringify(value));
        }
      } catch (e) {
        console.error(`[jSkid Storage] Failed to set ${key}:`, e);
      }
    }

    delete(key) {
      try {
        if (typeof GM_deleteValue !== "undefined") {
          GM_deleteValue(key);
        } else {
          localStorage.removeItem(`jskid:${key}`);
        }
      } catch (e) {
        console.error(`[jSkid Storage] Failed to delete ${key}:`, e);
      }
    }

    list() {
      try {
        if (typeof GM_listValues !== "undefined") {
          return GM_listValues();
        }
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("jskid:")) {
            keys.push(k.replace("jskid:", ""));
          }
        }
        return keys;
      } catch (e) {
        console.error(`[jSkid Storage] Failed to list keys:`, e);
        return [];
      }
    }

    async initDB() {
      if (this.dbPromise) return this.dbPromise;

      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
          return resolve(null);
        }
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("mod_store")) {
            db.createObjectStore("mod_store");
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings");
          }
          // Remove together_rooms store — jTogether is gone
          if (db.objectStoreNames.contains("together_rooms")) {
            db.deleteObjectStore("together_rooms");
          }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
          console.error("[jSkid IndexedDB Error]:", event.target.error);
          resolve(null);
        };
      });

      return this.dbPromise;
    }

    async storeData(storeName, key, value) {
      const db = await this.initDB();
      if (!db) {
        this.set(`idb_${storeName}_${key}`, value);
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    }

    async getData(storeName, key) {
      const db = await this.initDB();
      if (!db) {
        return this.get(`idb_${storeName}_${key}`);
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => reject(req.error);
      });
    }

    async deleteData(storeName, key) {
      const db = await this.initDB();
      if (!db) {
        this.delete(`idb_${storeName}_${key}`);
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    }

    async getAll(storeName) {
      const db = await this.initDB();
      if (!db) return {};
      return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.openCursor();
        const result = {};
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            result[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        req.onerror = () => reject(req.error);
      });
    }

    getModStorage(modId, chatContext = null) {
      return new ModStorage(modId, chatContext, this);
    }
  }

  class ModStorage {
    constructor(modId, chatContext = null, manager = null) {
      this.modId = modId;
      this.chatId = chatContext?.chatId || "global";
      this.characterId = chatContext?.characterId || null;
      this.manager = manager || global.jskidStorage || new StorageManager();
    }

    get storageKey() {
      return this.chatId === "global"
        ? `global_${this.modId}`
        : `chat_${this.chatId}_${this.modId}`;
    }

    async get(key, defaultValue = null) {
      const all = await this.getAll();
      return all && key in all ? all[key] : defaultValue;
    }

    async set(key, value) {
      const all = (await this.getAll()) || {};
      all[key] = value;
      await this.saveAll(all);
    }

    async delete(key) {
      const all = await this.getAll();
      if (all && key in all) {
        delete all[key];
        await this.saveAll(all);
      }
    }

    async getAll() {
      const data = await this.manager.getData("mod_store", this.storageKey);
      return data || {};
    }

    async saveAll(data) {
      await this.manager.storeData("mod_store", this.storageKey, data);
    }

    async clear() {
      await this.manager.deleteData("mod_store", this.storageKey);
    }

    async getSize() {
      const data = await this.getAll();
      return new Blob([JSON.stringify(data)]).size;
    }
  }

  global.StorageManager = StorageManager;
  global.ModStorage = ModStorage;
  if (!global.jskidStorage) {
    global.jskidStorage = new StorageManager();
  }
})(typeof window !== "undefined" ? window : globalThis);
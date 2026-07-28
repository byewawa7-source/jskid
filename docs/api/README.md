# JavaScript API Reference

> For mod authors and power users who want to use jSkid's JS APIs directly.

---

## Overview

jSkript compiles to JavaScript. Behind the scenes, every jSkript function call maps to a JavaScript API. You can use these directly in:
- `js:` blocks inside jSkript
- Custom addons
- Console debugging

---

## Engine API

### `window.jskidEngine`

The main engine instance, available after `jskid:ready`.

```javascript
// Check if loaded
if (window.jskidEngine) {
  console.log("jSkid version:", window.jskidEngine.version);
}
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `version` | `string` | jSkid version (e.g. `"1.0.0"`) |
| `initialized` | `boolean` | Whether engine is ready |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `on(event, fn)` | `(string, Function)` | Listen for engine events |
| `off(event, fn)` | `(string, Function)` | Remove event listener |
| `emit(event, data)` | `(string, any)` | Emit a custom event |

#### Events

| Event | Data | Description |
|---|---|---|
| `jskid:ready` | `{ version }` | Engine fully initialized |
| `jskid:mod:enabled` | `{ id }` | A mod was enabled |
| `jskid:mod:disabled` | `{ id }` | A mod was disabled |
| `jskid:error` | `{ error }` | Uncaught error occurred |

---

## EventBus

### `new EventBus()`

Pub/sub system for decoupled communication.

```javascript
const bus = new EventBus();
bus.on("chat:message", (data) => console.log(data));
bus.emit("chat:message", { sender: "Alice", text: "hi" });
bus.off("chat:message", handler);
```

#### Methods

| Method | Description |
|---|---|
| `on(event, fn)` | Subscribe to event |
| `once(event, fn)` | Subscribe once, auto-remove |
| `off(event, fn)` | Unsubscribe |
| `emit(event, data)` | Publish event to all listeners |
| `clear()` | Remove all listeners |

---

## ModManager

### `window.jskidModManager`

Manage installed mods.

```javascript
const mgr = window.jskidModManager;
mgr.install("my-mod");
mgr.enable("my-mod");
mgr.disable("my-mod");
mgr.uninstall("my-mod");
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `init()` | `()` | Load persisted mod states from IndexedDB |
| `install(source)` | `(object)` | Install mod from manifest/source |
| `enable(id)` | `(string)` | Enable a mod by ID |
| `disable(id)` | `(string)` | Disable a mod by ID |
| `uninstall(id)` | `(string)` | Remove mod completely |
| `get(id)` | `(string)` | Get mod info object |
| `list()` | `()` | Array of all installed mods |
| `on(event, fn)` | `(string, Function)` | Listen for mod events |

#### Mod Object

```javascript
{
  id: "my-mod",
  manifest: { /* manifest.json contents */ },
  enabled: true,
  source: "on chat...", // jSkript source
  config: {}, // user overrides
  status: "active", // "active" | "error" | "disabled"
  error: null // Error message if status is "error"
}
```

---

## StoreClient

### `window.jskidStoreClient`

Fetch mods from the remote store.

```javascript
const store = window.jskidStoreClient;
store.fetchIndex().then(index => {
  console.log("Total mods:", index.totalMods);
});
store.search("chat").then(results => { ... });
store.getMod("auto-greeter").then(mod => { ... });
store.install("auto-greeter").then(() => { ... });
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `fetchIndex()` | `()` | Fetch full mod index |
| `search(query)` | `(string)` | Search mods by name/tag/author |
| `getMod(id)` | `(string)` | Get single mod details |
| `install(id)` | `(string)` | Install mod to jSkid |
| `checkUpdates()` | `()` | Check for mod updates |

---

## TweaksManager

### `window.jskidTweaksManager`

Toggle UI tweaks and quality-of-life settings.

```javascript
const tweaks = window.jskidTweaksManager;
tweaks.set("show-timestamps", true);
tweaks.get("show-timestamps"); // true/false
tweaks.toggle("show-timestamps");
tweaks.getAll(); // object of all tweaks
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `get(id)` | `(string)` | Get current value |
| `set(id, value)` | `(string, any)` | Set value |
| `toggle(id)` | `(string)` | Flip boolean |
| `getAll()` | `()` | All tweaks with values |
| `reset(id)` | `(string)` | Reset to default |
| `resetAll()` | `()` | Reset everything |

---

## Storage

### `new Storage(dbName, version)`

IndexedDB wrapper.

```javascript
const db = new Storage("jskid", 1);
await db.initDB();
await db.put("settings", { theme: "dark" });
const settings = await db.get("settings");
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `initDB()` | `()` | Open/create database |
| `get(store, key)` | `(string, string)` | Read value |
| `put(store, key, value)` | `(string, string, any)` | Write value |
| `del(store, key)` | `(string, string)` | Delete value |
| `clear(store)` | `(string)` | Clear entire store |
| `all(store)` | `(string)` | Get all key/value pairs |
| `keys(store)` | `(string)` | Get all keys |

---

## JanitorAPI

Safe wrappers around JanitorAI internals.

```javascript
const api = window.jskidEngine.janitorAPI;

// Chat
api.sendChatMessage("Hello!");
api.getChatMessages().then(messages => { ... });

// UI
api.getElementById("chat-input");
api.querySelector(".message-list");

// Page state
api.getCurrentPage(); // "chat" | "characters" | ...
api.getCharacterInfo(); // current character data
```

#### Methods

| Category | Methods |
|---|---|
| Chat | `sendChatMessage`, `getChatMessages`, `clearChat` |
| DOM | `getElementById`, `querySelector`, `querySelectorAll` |
| Page | `getCurrentPage`, `getCharacterInfo`, `navigateTo` |
| UI | `showToast`, `hideToast`, `openModal` |

---

## DOMInjector

Observe and inject into JanitorAI's DOM.

```javascript
const injector = window.jskidEngine.domInjector;
injector.injectStyle("#my-mod { color: red; }");
injector.observe("#chat-container", (el) => { ... });
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `injectStyle(css)` | `(string)` | Append `<style>` to `<head>` |
| `injectHTML(html)` | `(string)` | Insert HTML into page |
| `observe(selector, fn)` | `(string, Function)` | Watch for element changes |
| `unobserve(selector)` | `(string)` | Stop observing |

---

## Console

### jSkid Console (in dashboard)

Run jSkript or JavaScript interactively:

```jskript
# jSkript
log "Hello from console"

# Raw JS
js:
  console.log(window.jskidEngine.version);
end js
```

---

## Error Handling

### Global Error Handler

```javascript
window.jskidEngine.on("jskid:error", (e) => {
  console.error("jSkid error:", e.error);
});
```

### Mod-level Errors

```jskript
on error:
  log "My mod errored: " + error.message
end on
```

---

## Type Reference

### EventData

```typescript
{
  name: string,
  data: any,
  timestamp: number
}
```

### ModManifest

```typescript
{
  id: string,
  name: string,
  version: string,
  author: string,
  description: string,
  type: "global" | "chat",
  permissions: string[],
  tags?: string[],
  license?: string,
  homepage?: string
}
```

### StoreIndex

```typescript
{
  schemaVersion: number,
  lastUpdated: string,
  totalMods: number,
  totalDownloads: number,
  categories: Array<{ id: string, name: string, count: number }>,
  mods: Array<ModEntry>
}
```

---

## Next Steps

- [Troubleshooting](../jskid/troubleshooting.md) — debug API issues
- [Architecture](../jskid/architecture.md) — understand how APIs connect
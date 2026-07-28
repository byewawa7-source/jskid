# jSkid Architecture & Core Guide

## Overview

jSkid operates as a client-side userscript modding framework for JanitorAI. It injects a reactive container, listens for single-page app (SPA) route changes, manages local and IndexedDB storage, and executes mod code in a safe execution environment.

```
jSkid Engine
├── Core Subsystems
│   ├── EventBus (Pub/Sub system)
│   ├── StorageManager (IndexedDB + localStorage)
│   ├── DOMInjector (Reactive element & style injection)
│   └── JanitorAPI (Hampter API & SSE stream parsing)
├── Subsystem Managers
│   ├── JSkript Engine (Lexer, Parser, Compiler, Runtime)
│   ├── ModManager (Global & Chat mod execution)
│   ├── StoreClient & Installer (jStore GitHub index & downloading)
│   ├── TweaksManager (Site customization & CSS injection)
│   └── RoomManager (jTogether group chat engine)
```

---

## Core Systems Reference

### 1. JSkidEventBus
The event bus provides decoupling between framework subsystems and mods.

```javascript
// Subscribe to event
const unsubscribe = jskidEventBus.on("jskid:chat:message", (data) => {
  console.log("New chat message:", data);
});

// Emit event
jskidEventBus.emit("jskid:chat:message", { content: "Hello world" });
```

### 2. StorageManager & ModStorage
Storage is split into fast key-value storage (Greasemonkey / `localStorage`) and structured IndexedDB (`jSkidDB`).

```javascript
// Accessing isolated mod storage
const modStore = jskidStorage.getModStorage("my-mod-id", { chatId: "chat-123" });
await modStore.set("hp", 100);
const hp = await modStore.get("hp");
```

### 3. DOMInjector
Injects HTML elements, waits for SPA nodes to appear, and observes route changes.

```javascript
// Wait for chat container in SPA
const chatEl = await jskidDOMInjector.waitForElement(".chat-container");

// Inject reactive component
jskidDOMInjector.inject("<div class='custom-hud'>HUD Active</div>", "beforeend", chatEl);
```

### 4. JanitorAPI
Wraps JanitorAI Hampter endpoints and extracts JWT auth tokens from Supabase cookies.

```javascript
// Send message via JanitorAI API
await janitorAPI.sendMessage(chatId, "Hello Character!", characterId);
```

# jMod System

## 1. Three Mod Types

| Type | Scope | Who Installs | When It Runs | Storage |
|------|-------|-------------|--------------|---------|
| **global** | Entire JanitorAI site | User from jStore (one-click) | On every page load | Persistent across sessions |
| **chat** | A specific character's chat session | User enters character's chat with mod dependency | Only in that specific chat session | Per-chat isolated storage |
| **character** | Bundled with a character definition | Creator lists deps, user accepts per-chat | Only when chatting with that character | Per-chat isolated storage |

### Key Design Decisions
- **Chat mods are per-chat, not per-character.** You can have different mods on different chats with the *same* character.
- **Globally installed mods are skipped** if a character requests them (version mismatch excluded).
- **Mod settings can differ per character chat** — each chat session has its own isolated mod state.
- **Also build a full UI panel** embedded in the JanitorAI character creator page *plus* document the JSON field for manual use.

---

## 2. Mod Structure
A jMod is a directory containing:
```
my-mod/
├── manifest.json       # Mod metadata & permissions
├── main.jsk            # Main jSkript source
├── icon.png            # Mod icon (128x128, optional)
├── screenshots/        # Preview images (optional)
│   ├── 1.png
│   └── 2.png
├── helpers.jsk         # Additional scripts (optional, imported)
└── assets/             # Static assets (optional)
```

---

## 3. Manifest Format
```json
{
  "id": "rpg-battle-system",
  "name": "RPG Battle System",
  "version": "1.0.0",
  "author": "Username",
  "description": "Adds turn-based combat to conversations",
  "type": "chat",
  "permissions": [
    "read:chat",
    "write:chat",
    "storage"
  ],
  "minJSkidVersion": "1.0.0",
  "maxJSkidVersion": "2.0.0",
  "icon": "icon.png",
  "screenshots": ["screenshots/1.png", "screenshots/2.png"],
  "tags": ["rpg", "combat", "game"],
  "dependencies": [],
  "conflicts": ["old-rpg-mod"],
  "license": "MIT",
  "homepage": "https://github.com/user/rpg-battle",
  "donate": "https://ko-fi.com/user"
}
```

---

## 4. Character Dependency System

### Character Definition Extension
When a character creator designs their character, they can add mod dependencies:

```json
// Field added to character object on JanitorAI
{
  "jmod_dependencies": [
    {
      "id": "rpg-battle-system",
      "name": "RPG Battle System",
      "version": ">=1.0.0",
      "required": true,
      "description": "Adds turn-based combat to conversations",
      "storeUrl": "https://jskid.dev/store/mods/rpg-battle-system"
    },
    {
      "id": "inventory-ui",
      "name": "Inventory UI",
      "version": ">=2.0.0",
      "required": false,
      "description": "Adds an inventory panel (recommended)"
    }
  ]
}
```

### Creator Panel UI (Injected into character creator page)
```
┌─────────────────────────────────────────────────────┐
│  jMod Dependencies                                   │
├─────────────────────────────────────────────────────┤
│  Search jStore for mods to attach to your character  │
│  [Search mods...]                                    │
│                                                     │
│  ─── Attached Mods ───                              │
│  RPG Battle System v1.0.0    ⚠ Required    [Remove] │
│  Inventory UI v2.0.0            Optional   [Remove] │
│  [+ Add Mod]                                        │
│                                                     │
│  Or paste mod URL from jStore:                       │
│  [_________________________________] [Add]          │
│                                                     │
│  Your character will prompt users to install         │
│  these mods when they start a chat.                 │
└─────────────────────────────────────────────────────┘
```

---

## 5. Chat Entry Flow (Dependency Resolution)

### Step-by-Step
```
1. User clicks "Chat" on a character card
2. jSkid intercepts the navigation
3. jSkid fetches character data, checks for jmod_dependencies
4. If no dependencies → proceed to chat normally
5. If dependencies exist:
   a. jSkid checks user's globally installed mods
   b. Globally installed mods with matching version → auto-skipped (already satisfied)
   c. Globally installed mods with version mismatch → treated as not installed
   d. Remaining deps → show dependency prompt
6. User accepts → mods loaded into chat session sandbox
7. User cancels → return to character page
8. On subsequent chats with same character → check again (user may have changed mind)
```

### Dependency Prompt UI
```
┌─────────────────────────────────────────────────────┐
│  This character uses mods                           │
│                                                     │
│  ─── Required (must accept to chat) ───            │
│  ☑ RPG Battle System v1.0.0    [Install] [Accept]  │
│     Adds turn-based combat to conversations         │
│                                                     │
│  ─── Optional ───                                   │
│  ☐ Inventory UI v2.0.0         [Install]            │
│     Adds an inventory panel (recommended)           │
│  ☑ Weather Effects v1.0.0      [Accept]             │
│     Adds atmospheric weather effects                │
│                                                     │
│  [Cancel]                    [Continue to Chat]     │
└─────────────────────────────────────────────────────┘
```

### State Management
```javascript
// Per-chat mod state (stored in IndexedDB, keyed by chatId)
{
  "chatId": "chat-uuid",
  "characterId": "char-uuid",
  "activeMods": ["rpg-battle-system", "inventory-ui"],
  "modConfigs": {
    "rpg-battle-system": {
      "difficulty": "hard",
      "enabled": true
    },
    "inventory-ui": {
      "theme": "dark",
      "enabled": true
    }
  },
  "declinedOptionalMods": ["weather-effects"],
  "installedAt": "2026-07-26T20:00:00Z"
}
```

---

## 6. Permission System

### Permission Categories
```
read:chat           - Read chat messages
write:chat          - Send/respond to chat messages
read:profile        - Read user profile
write:profile       - Modify user profile (requires approval each time)
read:ui             - Read DOM/UI state
write:ui            - Modify DOM/UI (inject elements, modify page)
read:storage        - Read mod's own storage
write:storage       - Write to mod's own storage
http:*              - Any HTTP request (requires approval each time for non-declared domains)
http:domain.com     - Specific domain only (auto-allowed)
websocket:*         - Any WebSocket (requires approval)
websocket:domain    - Specific domain only (auto-allowed)
sound               - Play sounds
clipboard           - Access clipboard (requires approval)
notifications       - Show notifications
user:personas       - Read/create user personas
character:data      - Read character definition data
```

### Permission Levels
```
auto              - Automatically granted (safe operations)
prompt-on-install - Shown in install prompt, then auto-allowed
prompt-each-time  - Prompts user each time mod uses it (e.g., write:profile)
prompt-per-chat   - Prompts once per chat session (for chat mods)
```

### Permission Prompt for Chat Mods (Combined)
```
┌─────────────────────────────────────────────────────┐
│  Chat Mods for "Elara the Elf Mage" request:         │
│                                                     │
│  RPG Battle System:                                 │
│  ☑ Read chat messages                               │
│  ☑ Send chat messages                               │
│  ☑ Read/write storage                               │
│                                                     │
│  Inventory UI:                                      │
│  ☑ Read chat messages                               │
│  ☐ Modify chat UI                                   │
│                                                     │
│  [Deny All]  [Accept Selected]  [Accept All]        │
└─────────────────────────────────────────────────────┘
```

### Runtime Enforcement
```javascript
class PermissionManager {
  constructor(modId, declaredPermissions, level = "chat") {
    this.modId = modId;
    this.permissions = new Set(declaredPermissions);
    this.level = level; // "global" | "chat"
  }
  
  check(permission, context = {}) {
    if (!this.permissions.has(permission)) {
      throw new PermissionError(
        `Mod "${this.modId}" attempted to use "${permission}" without declaring it`
      );
    }
    return true;
  }
  
  checkDomain(domain, method = "http") {
    const perm = `${method}:*`;
    const domainPerm = `${method}:${domain}`;
    
    if (this.permissions.has(perm)) return true;
    if (this.permissions.has(domainPerm)) return true;
    
    // Check for wildcard domain patterns
    for (const p of this.permissions) {
      if (p.startsWith(`${method}:`) && p.includes('*')) {
        const pattern = p.replace(`${method}:`, '').replace(/\*/g, '.*');
        if (new RegExp(`^${pattern}$`).test(domain)) return true;
      }
    }
    
    throw new PermissionError(
      `Mod "${this.modId}" attempted to access "${domain}" without permission`
    );
  }
}
```

---

## 7. Mod Lifecycle

### States
```
INSTALLED → LOADING → ACTIVE → UNLOADING → INACTIVE
                ↓          ↓
             ERROR      ERROR
```

### Lifecycle for Chat Mods
```
1. User clicks "Chat" on a character
2. jSkid intercepts, checks jmod_dependencies
3. Dependency prompt shown (if needed)
4. User accepts dependencies
5. Mod sources fetched (from store or local cache)
6. Manifest validated
7. Permissions checked
8. Sandbox created for chat session
9. Code compiled to bytecode
10. "on chat load" event fired to mod
11. Mod active during chat session
12. User navigates away → "on chat unload" fired
13. Sandbox destroyed
14. Chat mod state preserved in IndexedDB
15. If user returns to same chat → mods reloaded with saved state
```

### Lifecycle Methods
```javascript
class Mod {
  constructor(manifest, source, context) {
    this.manifest = manifest;
    this.source = source;
    this.context = context; // { chatId, characterId, type }
    this.sandbox = null;
    this.active = false;
  }
  
  async load() {
    // Compile source to bytecode
    // Create sandbox with permissions
    // Register event handlers
    // Fire "on mod load"
    this.active = true;
  }
  
  async unload() {
    // Remove event handlers
    // Clean up UI elements
    // Clear timers
    // Fire "on mod unload"
    // Save state to storage
    this.active = false;
  }
  
  async reload() {
    await this.unload();
    await this.load();
  }
  
  handleError(error) {
    // Log with mod ID and chat context
    // Disable only this mod for this chat
    // Notify user
  }
}
```

---

## 8. Sandbox Implementation
```javascript
class ModSandbox {
  constructor(modId, permissions, chatContext) {
    this.modId = modId;
    this.permManager = new PermissionManager(modId, permissions);
    this.chatContext = chatContext; // { chatId, characterId }
    this.stepCount = 0;
    this.maxSteps = 100000;
    this.executionTime = 0;
    this.maxExecutionTime = 5000; // 5 seconds per event
  }
  
  createContext() {
    return {
      variables: new Map(),
      parent: null,
      modId: this.modId,
      permissions: this.permManager,
      storage: new ModStorage(this.modId, this.chatContext),
      chatContext: this.chatContext,
      
      // Sandboxed functions
      reply: (text) => {
        this.permManager.check("write:chat");
        return JanitorAPI.sendMessage(this.chatContext.chatId, text, this.chatContext.characterId);
      },
      
      showUI: (component) => {
        this.permManager.check("write:ui");
        return UIManager.inject(component, this.chatContext.chatId);
      },
      
      // ... more sandboxed functions
    };
  }
  
  execute(bytecode, event) {
    this.stepCount = 0;
    const startTime = performance.now();
    
    try {
      // Execute bytecode with sandboxed context
      const result = this.runBytecode(bytecode, event);
      this.executionTime = performance.now() - startTime;
      return result;
    } catch (error) {
      this.executionTime = performance.now() - startTime;
      throw error;
    }
  }
  
  runBytecode(bytecode, event) {
    const context = this.createContext();
    const stack = [];
    let ip = 0; // instruction pointer
    
    while (ip < bytecode.length) {
      if (++this.stepCount > this.maxSteps) {
        throw new Error(`Mod "${this.modId}" exceeded max execution steps`);
      }
      
      const instruction = bytecode[ip];
      switch (instruction.op) {
        case "PUSH": stack.push(instruction.value); break;
        case "SET_VAR": context.variables.set(instruction.name, stack.pop()); break;
        case "GET_VAR": stack.push(context.variables.get(instruction.name)); break;
        case "CALL_FUNC": /* ... */ break;
        case "HALT": return stack.pop();
      }
      ip++;
    }
  }
}
```

---

## 9. Mod Storage (Per-Chat)

```javascript
class ModStorage {
  constructor(modId, chatContext = null) {
    this.modId = modId;
    this.chatId = chatContext?.chatId || 'global';
    this.characterId = chatContext?.characterId || null;
    this.dbName = `jskid_mod_${modId}`;
  }
  
  get storageKey() {
    return this.chatId === 'global' 
      ? `global_${this.modId}`
      : `chat_${this.chatId}_${this.modId}`;
  }
  
  async get(key) {
    const all = await this.getAll();
    return all?.[key];
  }
  
  async set(key, value) {
    const all = await this.getAll() || {};
    all[key] = value;
    await this.saveAll(all);
  }
  
  async delete(key) {
    const all = await this.getAll();
    if (all) {
      delete all[key];
      await this.saveAll(all);
    }
  }
  
  async getAll() {
    // IndexedDB scoped to mod + chat
    const data = await indexedDB.get(this.dbName, this.storageKey);
    return data || {};
  }
  
  async saveAll(data) {
    await indexedDB.set(this.dbName, this.storageKey, data);
  }
  
  async clear() {
    await indexedDB.delete(this.dbName, this.storageKey);
  }
  
  async getSize() {
    const data = await this.getAll();
    return new Blob([JSON.stringify(data)]).size;
  }
}
```

---

## 10. Mod Manager

```javascript
class ModManager {
  constructor() {
    this.globalMods = new Map();     // modId → Mod (loaded globally)
    this.chatMods = new Map();       // chatId → Map<modId, Mod> (loaded per chat)
    this.registry = new Map();       // modId → manifest (all installed)
    this.activeChatId = null;
  }
  
  // ─── Global Mods ───
  
  async installGlobal(manifest, source) {
    this.validateManifest(manifest);
    this.registry.set(manifest.id, manifest);
    await this.saveToDB(manifest, source);
  }
  
  async uninstallGlobal(modId) {
    await this.unloadGlobal(modId);
    this.registry.delete(modId);
    await this.removeFromDB(modId);
  }
  
  async enableGlobal(modId) {
    const manifest = this.registry.get(modId);
    const source = await this.getSource(modId);
    const mod = new Mod(manifest, source, { type: 'global' });
    await mod.load();
    this.globalMods.set(modId, mod);
  }
  
  async disableGlobal(modId) {
    await this.unloadGlobal(modId);
  }
  
  // ─── Chat Mods ───
  
  async resolveChatDependencies(chatId, characterId, dependencies) {
    const results = {
      required: { accept: [], install: [] },
      optional: { accept: [], install: [], decline: [] },
      skipped: []  // Already globally installed with matching version
    };
    
    for (const dep of dependencies) {
      const globalVersion = this.getGlobalModVersion(dep.id);
      
      if (globalVersion && this.versionSatisfies(globalVersion, dep.version)) {
        // Already installed globally with matching version → skip
        results.skipped.push(dep);
        continue;
      }
      
      if (globalVersion && !this.versionSatisfies(globalVersion, dep.version)) {
        // Version mismatch → needs reinstall
        // (keep in the list, user needs to update)
      }
      
      const isInstalled = await this.isModDownloaded(dep.id);
      if (dep.required) {
        if (isInstalled) {
          results.required.accept.push(dep);
        } else {
          results.required.install.push(dep);
        }
      } else {
        if (isInstalled) {
          results.optional.accept.push(dep);
        } else {
          results.optional.install.push(dep);
        }
      }
    }
    
    return results;
  }
  
  async loadChatMods(chatId, characterId, modIds, configs = {}) {
    if (!this.chatMods.has(chatId)) {
      this.chatMods.set(chatId, new Map());
    }
    
    const chatMods = this.chatMods.get(chatId);
    
    for (const modId of modIds) {
      const manifest = this.registry.get(modId);
      const source = await this.getSource(modId);
      const config = configs[modId] || {};
      
      const mod = new Mod(manifest, source, {
        type: 'chat',
        chatId,
        characterId,
        config
      });
      
      await mod.load();
      chatMods.set(modId, mod);
    }
    
    this.activeChatId = chatId;
  }
  
  async unloadChatMods(chatId) {
    const chatMods = this.chatMods.get(chatId);
    if (chatMods) {
      for (const [modId, mod] of chatMods) {
        await mod.unload();
      }
      this.chatMods.delete(chatId);
    }
    
    if (this.activeChatId === chatId) {
      this.activeChatId = null;
    }
  }
  
  // ─── Mod Config (Per-Chat Per-Mod) ───
  
  async getModConfig(chatId, modId) {
    return await this.storage.get(`config:${chatId}:${modId}`) || {};
  }
  
  async setModConfig(chatId, modId, config) {
    await this.storage.set(`config:${chatId}:${modId}`, config);
  }
  
  // ─── Utilities ───
  
  validateManifest(manifest) {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Invalid manifest: missing required fields');
    }
    if (!['global', 'chat', 'character'].includes(manifest.type)) {
      throw new Error(`Invalid mod type: ${manifest.type}`);
    }
  }
  
  getGlobalModVersion(modId) {
    const mod = this.globalMods.get(modId);
    return mod?.manifest?.version || null;
  }
  
  versionSatisfies(version, requirement) {
    // ">=1.0.0" → version >= 1.0.0
    // "^1.0.0" → version >= 1.0.0 and < 2.0.0
    // "~1.0.0" → version >= 1.0.0 and < 1.1.0
    // "1.0.0" → exact match
    // Simplistic semver matching
    const [op, req] = requirement.match(/^([><=!~^]*)?(.*)/).slice(1);
    const vParts = version.split('.').map(Number);
    const rParts = req.trim().split('.').map(Number);
    
    const cmp = (a, b) => {
      for (let i = 0; i < 3; i++) {
        if ((a[i] || 0) > (b[i] || 0)) return 1;
        if ((a[i] || 0) < (b[i] || 0)) return -1;
      }
      return 0;
    };
    
    switch (op) {
      case '>=': return cmp(vParts, rParts) >= 0;
      case '>':  return cmp(vParts, rParts) > 0;
      case '<':  return cmp(vParts, rParts) < 0;
      case '<=': return cmp(vParts, rParts) <= 0;
      case '^':  return cmp(vParts, rParts) >= 0 && vParts[0] === rParts[0];
      case '~':  return cmp(vParts, rParts) >= 0 && vParts[0] === rParts[0] && vParts[1] === rParts[1];
      default:   return cmp(vParts, rParts) === 0;
    }
  }
  
  getInstalledMods() {
    return Array.from(this.registry.values());
  }
  
  getChatMods(chatId) {
    return this.chatMods.get(chatId);
  }
  
  getActiveModsForCurrentChat() {
    if (this.activeChatId && this.chatMods.has(this.activeChatId)) {
      return Array.from(this.chatMods.get(this.activeChatId).values());
    }
    return [];
  }
}
```

---

## 11. Chat Interception Flow

```javascript
// When user clicks "Chat" on a character
// 1. Intercept the navigation/API call
// 2. Check character data for jmod_dependencies
// 3. If dependencies exist, show prompt
// 4. If accepted, load mods and proceed
// 5. If declined, stay on character page

class ChatInterceptor {
  constructor(modManager, storeClient) {
    this.modManager = modManager;
    this.storeClient = storeClient;
  }
  
  async onChatStart(chatId, characterId) {
    // Fetch character data
    const character = await JanitorAPI.getCharacter(characterId);
    const dependencies = character.jmod_dependencies;
    
    if (!dependencies || dependencies.length === 0) {
      return { proceed: true };
    }
    
    // Resolve dependencies
    const resolved = await this.modManager.resolveChatDependencies(
      chatId, characterId, dependencies
    );
    
    const allAccepted = [
      ...resolved.required.accept,
      ...resolved.optional.accept,
      ...resolved.skipped
    ];
    const needsDecision = [
      ...resolved.required.install,
      ...resolved.optional.install,
      ...resolved.optional.accept  // Optional that user might decline
    ];
    
    if (needsDecision.length === 0) {
      // All auto-satisfied
      await this.modManager.loadChatMods(chatId, characterId, 
        allAccepted.map(d => d.id));
      return { proceed: true };
    }
    
    // Show dependency prompt
    return new Promise((resolve) => {
      const prompt = new DependencyPrompt({
        characterName: character.name,
        required: resolved.required,
        optional: resolved.optional,
        skipped: resolved.skipped,
        onAccept: async (acceptedMods) => {
          // Install any new mods from store
          for (const dep of acceptedMods) {
            if (!this.modManager.registry.has(dep.id)) {
              const manifest = await this.storeClient.getModManifest(dep.id);
              const source = await this.storeClient.getModSource(dep.id);
              await this.modManager.installGlobal(manifest, source);
            }
          }
          
          await this.modManager.loadChatMods(chatId, characterId,
            acceptedMods.map(d => d.id));
          resolve({ proceed: true });
        },
        onDecline: () => {
          resolve({ proceed: false });
        }
      });
      prompt.show();
    });
  }
}
```

---

## 12. Error Isolation
- Each mod runs in its own sandbox
- Errors are caught and logged with mod ID + chat context
- One mod crashing doesn't affect other mods
- Crash counter: if a mod crashes 5 times in 1 minute, auto-disable for that chat
- User can manually disable any mod per chat
- Safe mode: hold Shift while loading to disable all mods
- Chat mod errors don't affect global mods (and vice versa)

---

## 13. Creator Dependency Panel (Injected UI)
The panel is injected into the JanitorAI character creator page. It:
1. Lets creators search the jStore for mods
2. Shows current character's attached mods
3. Allows setting required/optional per mod
4. Saves the dependency list to the character definition
5. Provides a preview of what users will see
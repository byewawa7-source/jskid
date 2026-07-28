# jSkid Core Engine

## 1. Userscript Bootstrap
- File: `jskid.user.js`
- Tampermonkey/Greasemonkey compatible
- @match `https://janitorai.com/*`
- Injects the jSkid engine after page load
- Version checking and auto-update

### Metadata Block
```javascript
// ==UserScript==
// @name         jSkid
// @namespace    https://janitorai.com
// @version      1.0.0
// @description  Modding framework for JanitorAI
// @author       jSkid Team
// @match        https://janitorai.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==
```

## 2. Initialization Pipeline
```
1. DOM Ready → Inject jSkid container
2. Load settings from storage
3. Initialize event bus
4. Load installed mod manifest
5. Initialize jSkript engine
6. Initialize jStore client
7. Initialize jTogether
8. Inject UI components (toolbar, settings panel, store browser)
9. Load and activate all enabled mods
10. Fire "jskid:ready" event
```

## 3. Event Bus
```javascript
// Central pub/sub event system
Events:
  - jskid:ready              # Engine fully loaded
  - jskid:mod:loaded         # Mod finished loading
  - jskid:mod:unloaded       # Mod was unloaded
  - jskid:mod:error          # Mod threw an error
  - jskid:chat:message       # New chat message
  - jskid:chat:character     # Character messages
  - jskid:ui:click           # UI element clicked
  - jskid:settings:change    # Setting changed
  - jskid:store:update       # Store index updated
```

## 4. DOM Injection Framework
```javascript
class DOMInjector {
  // Wait for element to exist (for SPA compatibility)
  waitForElement(selector, timeout)
  
  // Inject HTML at position
  inject(html, position, target)
  
  // Create reactive components
  createComponent(name, render, state)
  
  // CSS injection
  addStyles(css)
  
  // Mutation observer for SPA routing
  observePageChanges(callback)
}
```

## 5. Storage Layer
```javascript
class StorageManager {
  // GM storage (cross-session, small data)
  get(key, default)
  set(key, value)
  delete(key)
  list()
  
  // IndexedDB (large data, mod storage)
  openDB(name, version)
  storeData(store, key, value)
  getData(store, key)
  deleteData(store, key)
  getAll(store)
  
  // Mod-specific isolated storage
  getModStorage(modId)
  clearModStorage(modId)
}
```

## 6. SPA Router Observer
JanitorAI is a single-page app. The engine must:
1. Observe URL changes (pushState/popState)
2. Re-inject UI on route changes
3. Detect current page (chat page, profile, search, etc.)
4. Fire events when page context changes
5. Maintain state across navigation

## 7. UI Component Library
```javascript
Built-in components mods can use:
- Button, Text, Input, Dropdown, Modal
- Panel, Tab, Accordion, Tooltip
- HealthBar, ProgressBar, DamageNumber
- Notification, Toast, Alert
- FloatingText, Icon, Badge

Component system:
- Components are created with createComponent()
- They have lifecycle (mount, update, unmount)
- They can be positioned absolutely or relative
- They support event handlers
```

## 8. Error Handling
- Global error boundary for mod isolation
- Mod crashes don't affect other mods
- Error logging with mod ID context
- User-visible error notifications
- Safe mode (disable all mods if crash loop detected)
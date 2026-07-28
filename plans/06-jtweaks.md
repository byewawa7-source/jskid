# jTweaks — Settings & Customization

## 1. Overview
jTweaks is a comprehensive settings panel that lets users customize every aspect of JanitorAI. Settings are stored in IndexedDB and sync across sessions.

## 2. Settings Panel UI
```
┌─────────────────────────────────────────────┐
│  jTweaks  [Search settings...]              │
├─────────────────────────────────────────────┤
│  ┌─ Appearance ──────────────────────────┐  │
│  │ ☑ Dark Mode                           │  │
│  │ ☑ Compact Mode                        │  │
│  │ Font Size: [Medium ▼]                 │  │
│  │ Font Family: [System ▼]               │  │
│  │ Message Style: [Bubbles ▼]            │  │
│  │ ── Advanced ──                        │  │
│  │ Custom CSS: [textarea]                │  │
│  │ Custom Theme: [Import] [Export]       │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Chat ───────────────────────────────┐  │
│  │ ☑ Auto-scroll to bottom              │  │
│  │ ☑ Show typing indicator              │  │
│  │ ☑ Show message timestamps            │  │
│  │ ☑ Enter to send                      │  │
│  │ ☑ Auto-save drafts                   │  │
│  │ Message character limit: [2000]      │  │
│  │ Chat history depth: [All ▼]          │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Performance ────────────────────────┐  │
│  │ ☑ Lazy load images                   │  │
│  │ ☑ Reduce animations                  │  │
│  │ ☑ Disable particle effects           │  │
│  │ ☑ Memory saver mode                  │  │
│  │ API throttle: [Normal ▼]             │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Privacy ────────────────────────────┐  │
│  │ ☑ Hide online status                 │  │
│  │ ☑ Incognito browsing                 │  │
│  │ ☑ Clear history on exit              │  │
│  │ ☑ Disable analytics                  │  │
│  │ Block user tracking: [On ▼]          │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Notifications ──────────────────────┐  │
│  │ ☑ Sound effects                      │  │
│  │ ☑ Desktop notifications              │  │
│  │ ☑ Message received sound             │  │
│  │ Notification filter: [All ▼]         │  │
│  └───────────────────────────────────────┘  │
│  ┌─ Mods ───────────────────────────────┐  │
│  │ [Installed Mods List]                │  │
│  │ [Enable/Disable Toggle]              │  │
│  │ [Mod Settings]                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 3. Settings Categories

### Appearance
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| darkMode | boolean | false | Force dark mode |
| compactMode | boolean | false | Compact UI layout |
| fontSize | enum | "medium" | small, medium, large |
| fontFamily | enum | "system" | system, serif, sans, dyslexic |
| messageStyle | enum | "bubbles" | bubbles, flat, minimal |
| customCSS | text | "" | Custom CSS overrides |
| hideAvatars | boolean | false | Hide user/character avatars |
| hideTimestamps | boolean | false | Hide message timestamps |
| hideSidebar | boolean | false | Auto-hide sidebar |
| blurNSFW | boolean | true | Blur NSFW content |
| reducedMotion | boolean | false | Reduce animations |

### Chat
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| autoScroll | boolean | true | Auto-scroll to new messages |
| showTyping | boolean | true | Show typing indicator |
| showTimestamps | boolean | true | Show message timestamps |
| enterToSend | boolean | true | Enter sends, Shift+Enter newline |
| autoSaveDrafts | boolean | true | Auto-save message drafts |
| charLimit | number | 2000 | Max characters per message |
| historyDepth | enum | "all" | all, 100, 50, 25 messages |
| showCharacterName | boolean | true | Show character name in chat |
| showUserAvatar | boolean | true | Show user avatar in chat |
| markdownRendering | boolean | true | Render markdown in messages |

### Performance
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| lazyLoadImages | boolean | true | Lazy load images |
| reduceAnimations | boolean | false | Reduce CSS animations |
| disableParticles | boolean | false | Disable particle effects |
| memorySaver | boolean | false | Memory saver mode |
| apiThrottle | enum | "normal" | off, normal, aggressive |
| maxCachedChats | number | 50 | Max cached chat sessions |
| disableWebGL | boolean | false | Disable WebGL rendering |

### Privacy
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| hideOnline | boolean | false | Hide online status |
| incognito | boolean | false | Incognito browsing mode |
| clearOnExit | boolean | false | Clear history on exit |
| disableAnalytics | boolean | false | Disable tracking/analytics |
| blockTracking | boolean | true | Block user tracking scripts |
| hideProfile | boolean | false | Hide profile from others |
| privateBrowsing | boolean | false | Private browsing mode |

### Notifications
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| soundEnabled | boolean | true | Enable sound effects |
| desktopNotifications | boolean | true | Enable desktop notifications |
| messageSound | boolean | true | Play sound on new message |
| notificationFilter | enum | "all" | all, mentions, none |
| notificationTimeout | number | 5 | Notification display seconds |

### Mods
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| modEnabled | boolean | true | Master mod toggle |
| autoUpdate | boolean | true | Auto-update mods |
| devMode | boolean | false | Developer mode (debug console) |
| safeMode | boolean | false | Safe mode (disable all mods) |

## 4. Settings Manager
```javascript
class TweaksManager {
  constructor() {
    this.settings = {};
    this.defaults = {};
    this.listeners = new Map();
  }
  
  // Define a setting
  define(key, config) {
    this.defaults[key] = config.default;
    this.settings[key] = this.load(key) ?? config.default;
  }
  
  // Get a setting
  get(key) {
    return this.settings[key] ?? this.defaults[key];
  }
  
  // Set a setting
  set(key, value) {
    this.settings[key] = value;
    this.save(key, value);
    this.notify(key, value);
    this.apply(key, value);
  }
  
  // Reset to defaults
  reset(key) {
    this.set(key, this.defaults[key]);
  }
  
  // Reset all
  resetAll() {
    for (const key of Object.keys(this.settings)) {
      this.reset(key);
    }
  }
  
  // Apply setting immediately
  apply(key, value) {
    switch (key) {
      case 'darkMode':
        document.documentElement.classList.toggle('jskid-dark', value);
        break;
      case 'fontSize':
        document.documentElement.style.setProperty('--jskid-font-size', value);
        break;
      case 'customCSS':
        this.injectCustomCSS(value);
        break;
      // ... more apply handlers
    }
  }
  
  // Listen for changes
  onChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
  }
  
  notify(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(cb => cb(value));
    }
  }
  
  // Persistence
  load(key) {
    return localStorage.getItem(`jskid:setting:${key}`);
  }
  
  save(key, value) {
    localStorage.setItem(`jskid:setting:${key}`, JSON.stringify(value));
  }
  
  // Export/Import settings
  exportSettings() {
    return JSON.stringify(this.settings, null, 2);
  }
  
  importSettings(json) {
    const data = JSON.parse(json);
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value);
    }
  }
}
```

## 5. CSS Injection System
```javascript
class StyleInjector {
  constructor() {
    this.styleId = 'jskid-styles';
    this.customStyleId = 'jskid-custom';
  }
  
  inject(css) {
    let style = document.getElementById(this.styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = this.styleId;
      document.head.appendChild(style);
    }
    style.textContent += css;
  }
  
  injectCustom(css) {
    let style = document.getElementById(this.customStyleId);
    if (!style) {
      style = document.createElement('style');
      style.id = this.customStyleId;
      document.head.appendChild(style);
    }
    style.textContent = css;
  }
  
  // Pre-built themes
  injectDarkMode() {
    this.inject(`
      :root {
        --jskid-bg: #1a1a2e;
        --jskid-text: #e0e0e0;
        --jskid-primary: #7c3aed;
        --jskid-secondary: #4f46e5;
        --jskid-border: #2d2d44;
        --jskid-surface: #16213e;
      }
    `);
  }
  
  injectCompactMode() {
    this.inject(`
      .chat-message { padding: 4px 8px !important; }
      .chat-header { height: 40px !important; }
      .sidebar { width: 200px !important; }
    `);
  }
}
```

## 6. Theme System
- Built-in themes: Light, Dark, Midnight, Sepia, Forest, Ocean
- Custom theme import/export (JSON format)
- Theme format:
```json
{
  "name": "My Theme",
  "colors": {
    "bg": "#1a1a2e",
    "text": "#e0e0e0",
    "primary": "#7c3aed",
    "secondary": "#4f46e5",
    "border": "#2d2d44",
    "surface": "#16213e",
    "success": "#10b981",
    "warning": "#f59e0b",
    "danger": "#ef4444",
    "accent": "#8b5cf6"
  },
  "fonts": {
    "ui": "Inter, sans-serif",
    "message": "Georgia, serif"
  },
  "radii": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px"
  }
}
# Modding Guide

> Write, package, and publish jSkid mods. From hello-world to community releases.

---

## Quick Start

1. Open jSkid dashboard → **jMods** → **Create New Mod**
2. Give it a name and ID (e.g. `auto-greeter`)
3. Write jSkript code in the editor
4. Click **Save** and toggle it **On**

That's it. Your mod is running.

---

## Mod Structure

A mod is a directory with at minimum:

```
my-mod/
├── manifest.json    # Required — metadata
├── main.jsk         # Required — jSkript source
├── icon.png         # Optional — 128×128 PNG
└── README.md        # Optional — documentation
```

### manifest.json

```json
{
  "id": "my-mod",
  "name": "My Awesome Mod",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What this mod does",
  "type": "global",
  "permissions": ["read:chat", "write:chat"],
  "tags": ["chat", "fun"],
  "license": "MIT"
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | lowercase kebab-case, matches directory name |
| `name` | Yes | human-readable name |
| `version` | Yes | SemVer: `X.Y.Z` |
| `author` | Yes | your name or handle |
| `description` | Yes | short explanation |
| `type` | Yes | `"global"` or `"chat"` |
| `permissions` | Yes | array of required permissions |
| `tags` | No | categories for the store |
| `license` | No | e.g. `"MIT"`, `"GPL-3.0"` |

### Permissions

| Permission | What it allows |
|---|---|
| `read:chat` | Read chat messages |
| `write:chat` | Send messages |
| `read:ui` | Read DOM elements |
| `write:ui` | Modify the page |
| `read:storage` | Access IndexedDB |
| `write:storage` | Write to IndexedDB |
| `http:*` | Make HTTP requests |
| `websocket:*` | Open WebSockets |
| `sound` | Play audio |
| `clipboard` | Read/write clipboard |
| `notifications` | Show notifications |

---

## Writing main.jsk

```jskript
on chat message received:
  if message contains "hello":
    reply "Hi from my mod!"
  end if
end on
```

Use `include` to split code across files:

```jskript
include "commands.jsk"
include "utils.jsk"
```

---

## Debugging

Open jSkid → **Console** tab to see logs and errors:

```jskript
log "Debug: " + message
log "User: " + sender
```

Errors show in red with line numbers.

---

## .jmod File Format

A `.jmod` file is a single ZIP archive used to share and backup mods. It contains everything needed to recreate a mod installation.

### Structure

```
my-mod-1.0.0.jmod
└── (ZIP archive)
    ├── manifest.json    # Required — mod metadata
    └── main.jsk         # Required — jSkript source code
```

### Creating a .jmod

In the jSkid dashboard:
1. Go to **jMods** tab
2. Click **Export .jmod** on any installed mod
3. The file downloads automatically

### Installing a .jmod

1. Go to **jMods** tab
2. Click **Import .jmod**
3. Select the `.jmod` file
4. The mod is installed and ready to enable

### manifest.json Reference

Same fields as the directory-based format:

```json
{
  "id": "my-mod",
  "name": "My Awesome Mod",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What this mod does",
  "type": "global",
  "permissions": ["read:chat", "write:chat"],
  "tags": ["chat", "fun"],
  "license": "MIT"
}
```

### Use Cases

- **Backup** — export mods before updating jSkid
- **Sharing** — send mods to friends outside the store
- **Offline storage** — keep a local library of mods
- **Simple distribution** — single-file alternative to git repos

### Notes

- The `.jmod` format only includes `manifest.json` and `main.jsk`
- Optional files like `README.md` and `icon.png` are not included in the current version
- Importing a `.jmod` with an existing mod ID will prompt for replacement
- Imported mods are installed but disabled by default for safety

## Publishing to jStore

1. Push your mod to your fork of `jskid-store`
2. Create a PR with your `mods/your-mod-id/` folder
3. CI validates your mod automatically
4. Maintainers review and merge

---

## Example: Minimal Mod

**manifest.json:**
```json
{
  "id": "echo-bot",
  "name": "Echo Bot",
  "version": "1.0.0",
  "author": "Alice",
  "description": "Repeats everything you say",
  "type": "chat",
  "permissions": ["read:chat", "write:chat"]
}
```

**main.jsk:**
```jskript
on chat message received:
  reply message
end on
```

That's a complete, working mod.

---

## Next Steps

- [JSKRIPT Reference](../JSKRIPT/README.md) — learn the scripting language
- [Publishing to jStore](../STORE/README.md) — submit mods to the store
- [Troubleshooting](../jskid/troubleshooting.md) — fix common issues
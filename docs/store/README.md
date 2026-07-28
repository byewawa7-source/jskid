# jStore — Community Mod Store

> Browse, install, and publish mods for jSkid.

---

## What is jStore?

jStore is a community-driven repository of jSkid mods. It works like an app store:

- **Browse** — search and discover mods by other users
- **Install** — one-click install directly into JanitorAI
- **Publish** — share your mods with the community

All mods are **client-side userscripts** running in your browser. No account, no backend, no tracking.

---

## Browsing Mods

1. Open jSkid dashboard
2. Go to **jStore** tab
3. Use the search bar to find mods by name, tag, or author
4. Click a mod card to see details

### Mod Card Shows

- Mod name and icon
- Author
- Description
- Tags (e.g. `chat`, `fun`, `admin`)
- Download count
- Rating

### Sorting

- **Popular** — most downloads
- **Newest** — recently added
- **Top Rated** — highest rated

---

## Installing a Mod

1. Find a mod you like
2. Click the mod card to open details
3. Click **Install**
4. Go to **jMods** tab
5. Find the installed mod
6. Toggle it **On**

The mod is now active.

### Permissions

Before installing, jSkid shows you the permissions the mod needs:

```json
["read:chat", "write:chat", "http:api.example.com"]
```

Only install mods from authors you trust. Be especially careful with `http:*` and `websocket:*` — those let the mod access any network resource.

---

## Managing Installed Mods

### Enable / Disable

Toggle the switch next to a mod. Disabling doesn't delete it — just stops it from running.

### Configure

Some mods have settings. Click the mod name to expand and see config options.

### Uninstall

Click the **Uninstall** button. This removes the mod completely (can't be undone).

---

## Publishing a Mod

### Via Dashboard (upload form)

1. Go to **jStore** → click **+ Upload Mod**
2. Fill in:
   - **Mod ID**: lowercase kebab-case (e.g. `auto-greeter`)
   - **Display Name**: human-readable
   - **Description**: short explanation
   - **Tags**: comma-separated categories
   - **Source Code**: paste your `main.jsk`
3. Click **Publish**

### Via GitHub (for advanced users)

1. Fork `jskid-store` repo
2. Create a folder: `mods/your-mod-id/`
3. Add `manifest.json` and `main.jsk`
4. Push and open a PR
5. CI validates automatically
6. Maintainers merge

---

## Mod Lifecycle

```
Submit → Validate → Review → Publish → Update → Archive
```

- **Submit** — author uploads or pushes mod
- **Validate** — CI checks manifest syntax, permissions, code structure
- **Review** — maintainers review for quality and safety
- **Publish** — mod appears in jStore
- **Update** — author submits new version
- **Archive** — old versions are kept but marked outdated

---

## Creating a Good Mod

### manifest.json Example

```json
{
  "id": "auto-greeter",
  "name": "Auto Greeter",
  "version": "1.0.0",
  "author": "Alice",
  "description": "Automatically greets new users in chat",
  "type": "chat",
  "permissions": ["read:chat", "write:chat"],
  "tags": ["chat", "fun", "automation"],
  "license": "MIT",
  "homepage": "https://github.com/alice/auto-greeter"
}
```

### main.jsk Example

```jskript
on chat message received:
  if message contains "hello":
    reply "Welcome! 👋"
  end if
end on
```

---

## Store API

For mod developers who want to interact with the store programmatically:

```jskript
# Fetch mod info
set modInfo = store.getMod("auto-greeter")

# Install mod
store.install("auto-greeter")

# Check for updates
set updates = store.checkUpdates()
if updates has "auto-greeter":
  log "Update available!"
end if
```

See [API Reference](../API/README.md) for full documentation.

---

## Guidelines

1. **No malicious code** — spyware, phishing, or harmful mods will be removed
2. **Respect permissions** — only request what you need
3. **Credit sources** — if you use someone else's code, mention it
4. **Tag accurately** — don't tag `fun` for an admin tool
5. **Version SemVer** — `1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`

---

## Next Steps

- [Modding Guide](../MODS/README.md) — write your first mod
- [Publishing Guide](publishing.md) — submit to jStore (coming soon)
- [Troubleshooting](../jskid/troubleshooting.md) — fix common issues
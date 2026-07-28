# jStore Marketplace & Distribution Manual

**jStore** is a community mod distribution platform backed by GitHub raw storage and GitHub Pull Requests.

---

## 1. Store Index Format (`index.json`)

The master store index is stored at `jskid-store/main/index.json`:

```json
{
  "schemaVersion": 1,
  "lastUpdated": "2026-07-26T20:00:00Z",
  "totalMods": 42,
  "categories": [
    { "id": "chat", "name": "Chat Enhancements", "count": 15 },
    { "id": "rpg", "name": "RPG & Games", "count": 8 }
  ],
  "mods": [
    {
      "id": "rpg-battle-system",
      "name": "RPG Battle System",
      "version": "1.0.0",
      "author": "Antigravity",
      "description": "Turn-based combat system",
      "type": "chat",
      "downloads": 1234,
      "rating": 4.8,
      "path": "mods/rpg-battle-system/"
    }
  ]
}
```

---

## 2. Submitting a Mod to jStore

1. Open the **jSkid Dashboard -> jStore** tab.
2. Click **+ Upload Mod**.
3. Fill out the Mod ID, Display Name, Version, Type, Description, and `main.jsk` code.
4. Click **Submit Pull Request to jStore**.
5. The GitHub Action CI workflow validates your `manifest.json` and `main.jsk` syntax, rebuilds `index.json`, and merges your mod upon approval!

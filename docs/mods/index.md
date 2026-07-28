# jMod Developer Guide

## Mod Types

| Mod Type | Scope | Lifetime | Storage |
|---|---|---|---|
| **global** | Entire site | Persistent across all sessions | Global IndexedDB storage |
| **chat** | Specific chat session | Active during chat session | Per-chat isolated storage |
| **character** | Character definition | Attached to character creator definition | Per-chat isolated storage |

---

## Directory Structure

A jMod project folder contains:

```
my-mod/
├── manifest.json       # Metadata & permissions
├── main.jsk            # Main jSkript source code
├── icon.png            # Mod icon (128x128)
└── README.md           # Documentation
```

---

## Manifest Reference

```json
{
  "id": "my-mod-id",
  "name": "My Mod Name",
  "version": "1.0.0",
  "author": "Creator",
  "description": "Mod description text",
  "type": "chat",
  "permissions": [
    "read:chat",
    "write:chat",
    "storage"
  ],
  "dependencies": [
    { "id": "rpg-battle-system", "version": ">=1.0.0", "required": true }
  ]
}
```

---

## Permission Categories

- `read:chat`: Read chat messages.
- `write:chat`: Send automated chat messages.
- `storage`: Read/write isolated mod storage.
- `write:ui`: Inject reactive DOM components.
- `http:*` / `http:domain.com`: Access external HTTP networks.

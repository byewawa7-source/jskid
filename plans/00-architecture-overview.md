# jSkid Architecture Overview

## What is jSkid?
jSkid is a userscript that enhances janitorai.com with a modding system. It allows users to install community-made mods (jMods) written in a custom scripting language (jSkript), customize the site (jTweaks), and run group chats (jTogether).

## System Components

```
jSkid
├── Core Engine          # Userscript bootstrap, DOM injection, event bus, storage
├── jSkript              # Custom scripting language (lexer, parser, compiler, runtime)
├── jMod System          # Mod loading, sandboxing, permissions, lifecycle
├── jStore               # Community mod store (GitHub-based)
├── jTweaks              # Settings/tweaks panel
└── jTogether            # Group chat system
```

## Data Flow

```
User Action → Event Bus → jMod Runtime → Permission Check → DOM/API Action
                                ↑
                          jSkript Engine
                                ↑
                          jMod Source Code
```

## Storage Architecture
- **IndexedDB**: Mod data, user settings, chat history
- **localStorage**: Quick preferences, session data
- **GitHub API**: Store index, mod submissions

## Security Model
1. jMods declare permissions in manifest
2. Sandbox enforces permissions at runtime
3. No access to undeclared APIs
4. Network requests limited to declared domains
5. Storage isolated per mod
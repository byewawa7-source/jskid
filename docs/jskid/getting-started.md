# Getting Started with jSkid

## Installation

1. **Install Userscript Extension**
   Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) for your web browser.

2. **Add `jskid.user.js`**
   Open Tampermonkey dashboard, click **Create a new script**, and paste the contents of `jskid.user.js`.

3. **Navigate to JanitorAI**
   Open [janitorai.com](https://janitorai.com). Upon loading, you will see a purple floating button in the bottom-right corner.

---

## Using the jSkid Dashboard

Click the floating button to open the dashboard modal with 4 main tabs:

- **jMods**: View, enable, or disable installed mods.
- **jStore**: Browse community-made mods, view details, or upload your own.
- **jTweaks**: Customize JanitorAI settings (dark mode, compact layout, custom CSS, privacy settings).
- **jTogether**: Create and manage multi-character group chat rooms.

---

## Writing Your First jMod

Create a file named `main.jsk`:

```jskript
# Simple Greeting jMod
on chat message:
  if {user-message} contains "hello":
    reply "*smiles warmly* Hello there! How can I help you today?"
  end if
end on
```

Create `manifest.json`:

```json
{
  "id": "greeting-mod",
  "name": "Friendly Greeting Mod",
  "version": "1.0.0",
  "author": "YourName",
  "description": "Replies automatically when user says hello.",
  "type": "chat",
  "permissions": ["read:chat", "write:chat"]
}
```

Upload your mod via **jStore -> Upload Mod**!

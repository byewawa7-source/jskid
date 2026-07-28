# Getting Started

> New to jSkid? Start here. This guide walks you through installation, first launch, and what to do next.

---

## 1. Prerequisites

Before installing jSkid, make sure you have:

- A modern web browser: Chrome, Firefox, or Edge
- A userscript manager extension installed:
  - **Tampermonkey** (recommended) — [Install for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - **Violentmonkey** — [Install for Chrome](https://chrome.google.com/webstore/detail/violentmonkey/ejgffopjkljjnkphcfpbhglcmndeaooh)
  - **Greasemonkey** — Firefox only

No other software is needed. jSkid runs entirely in your browser.

---

## 2. Installation

### Option A: Install from latest release (recommended)

1. Go to https://github.com/byewawa7-source/jskid/releases/latest
2. Download `jskid.user.js`
3. Click the Tampermonkey/Violentmonkey icon in your browser toolbar
4. Click **Create a new script** or **Add new userscript**
5. Delete the default template and paste the downloaded `jskid.user.js` content
6. Save (Ctrl+S / Cmd+S)

### Option B: Install from raw URL

1. Install Tampermonkey first (see above)
2. Open this URL in your browser:
   `https://github.com/byewawa7-source/jskid/releases/latest/download/jskid.user.js`
3. Tampermonkey will show an installation prompt
4. Click **Install**

### Option C: Install for development (manual)

1. Clone the repo: `git clone https://github.com/byewawa7-source/jskid.git`
2. Copy `jskid.user.js` into your userscript manager
3. When the source changes, repeat this step

---

## 3. First Launch

1. Navigate to https://janitorai.com
2. You should see `[jSkid] Engine Ready!` in the browser console (F12 → Console tab)
3. A small **purple bubble** appears in the bottom-right corner of the screen
4. Click the bubble to open the jSkid dashboard

If you don't see the bubble:
- Refresh the page (Ctrl+R / Cmd+R)
- Check the console for errors
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 4. Dashboard Overview

The jSkid dashboard has several tabs:

| Tab | What it does |
|---|---|
| **jMods** | View, enable/disable, and manage installed mods |
| **jStore** | Browse and install community mods |
| **jTweaks** | Toggle UI changes and quality-of-life improvements |
| **Console** | Run jSkript commands interactively |
| **Settings** | Configure jSkid behavior |

### Quick Actions

- **Enable a mod**: Go to jMods → find mod → toggle switch
- **Install a mod**: Go to jStore → search → click Install
- **Run a script**: Go to Console → type jSkript code → press Enter

---

## 5. Your First jSkript Script

Let's write a simple auto-reply script.

1. Open the jSkid dashboard
2. Go to the **Console** tab
3. Paste this code:

```jskript
on chat message received:
  if message contains "hello":
    reply "Hi there! I'm automated by jSkid."
  end if
end on
```

4. Click **Run**

Now whenever someone says "hello" in chat, jSkid will reply automatically.

### Save as a Mod

Scripts in the Console are temporary. To save them permanently:

1. Go to **jMods** → **Create New Mod**
2. Give it a name: `Auto Greeter`
3. Paste the same jSkript code into the editor
4. Click **Save**
5. Enable the mod with the toggle switch

Your mod is now active on every page load.

---

## 6. Installing Mods from jStore

1. Open the jSkid dashboard
2. Go to **jStore**
3. Browse or search for mods
4. Click a mod to see its details
5. Click **Install**
6. Go to **jMods** and enable it

Some mods require permissions. jSkid will prompt you to approve them.

---

## 7. Understanding jSkript

jSkript is jSkid's scripting language. It looks like plain English.

**Basic structure:**

```jskript
on <event>:
  <do something>
end on
```

**Common events:**
- `chat message received` — when a new chat message appears
- `page loaded` — when the JanitorAI page finishes loading
- `button clicked` — when a specific button is clicked

**Common actions:**
- `reply "<text>"` — send a chat message
- `log "<text>"` — print to the console
- `set <name> to <value>` — create a variable

See [jskript/README.md](jskript/README.md) for the full language reference.

---

## 8. Next Steps

Ready to dive deeper?

- [jskript/README.md](jskript/README.md) — Learn jSkript from basics to advanced
- [mods/README.md](mods/README.md) — Write, package, and publish mods
- [store/README.md](store/README.md) — Publish mods to the jStore
- [api/README.md](api/README.md) — Use JavaScript APIs directly
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Fix common issues
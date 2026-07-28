# jSkript Intermediate: Modules

> Split your code into reusable files with `include`.

---

## Why Use Modules?

As your mods grow, one big file becomes hard to maintain. Modules let you:

- Split code by feature (commands, utils, data)
- Reuse code across multiple mods
- Keep related code together

---

## Including Files

Use `include` to import another jSkript file:

```jskript
include "utils.jsk"
include "lib/helpers.jsk"
```

Included files run in the **same scope**, so variables and functions are shared.

---

## File Structure

```
my-mod/
├── main.jsk       # Entry point
├── utils.jsk      # Helper functions
└── commands/
    ├── admin.jsk  # Admin commands
    └── fun.jsk    # Fun commands
```

**main.jsk:**

```jskript
include "utils.jsk"
include "commands/admin.jsk"
include "commands/fun.jsk"

on page loaded:
  log "Mod loaded!"
end on
```

---

## Relative Paths

Paths are relative to the mod's root directory:

```jskript
include "helpers.jsk"           # Same folder
include "lib/http.jsk"          # Subfolder
include "../shared/math.jsk"   # Parent folder (not recommended)
```

---

## Avoid Duplicate Includes

If you include the same file twice, its code runs twice. Guard against this:

```jskript
# utils.jsk
if __utils_loaded__ is not true:
  set __utils_loaded__ to true
  
  function helper():
    log "Helper"
  end function
end if
```

A better approach: only include files from your main entry point, not from within other includes.

---

## Organizing by Feature

### Good: Feature folders

```
commands/
  admin.jsk    # /ban, /kick, /mute
  economy.jsk  # /balance, /pay, /shop
  fun.jsk      # /roll, /8ball
```

### Bad: Everything in one file

```
# main.jsk — 2000 lines of mixed code
```

---

## Sharing State

All included files share the same global scope:

```jskript
# utils.jsk
set helperVersion to "1.0"

# main.jsk
include "utils.jsk"
log helperVersion  # "1.0"
```

But avoid polluting global scope. Group related variables in objects:

```jskript
# db.jsk
set db to { users: {}, rooms: {} }

function getUser(id):
  if db.users has id:
    return db.users[id]
  else:
    set db.users[id] to { name: "", level: 1 }
    return db.users[id]
  end if
end function
```

---

## Advanced: Dynamic Includes

Load modules conditionally:

```jskript
set mode to "dev"

if mode is "dev":
  include "debug.jsk"
else:
  include "release.jsk"
end if
```

Or load by name:

```jskript
function loadModule(name):
  include "modules/" + name + ".jsk"
end function

loadModule("chat")
loadModule("admin")
```

---

## Best Practices

1. **One responsibility per file** — `http.jsk` handles HTTP, `ui.jsk` handles DOM
2. **Name files after what they do** — `helpers.jsk`, `commands.jsk`, `state.jsk`
3. **Keep main.jsk minimal** — it should only wire things together
4. **Use descriptive include paths** — `commands/admin.jsk` not `a.jsk`
5. **Avoid circular includes** — A includes B, B includes A = infinite loop

---

## Example Project

**main.jsk:**
```jskript
include "state.jsk"
include "utils.jsk"
include "commands/chat.jsk"
include "commands/admin.jsk"

on page loaded:
  log "MyMod loaded!"
end on
```

**state.jsk:**
```jskript
set state to {
  users: {},
  settings: { debug: false }
}

function getState():
  return state
end function
```

**utils.jsk:**
```jskript
function logDebug(msg):
  if state.settings.debug:
    log "[DEBUG] " + msg
  end if
end function
```

**commands/chat.jsk:**
```jskript
on chat message received:
  if message starts with "!":
    handleCommand(message)
  end if
end on
```

---

## Next Steps

- [Error Handling](advanced/error-handling.md) — handle failures across modules
- [Async](advanced/async.md) — non-blocking operations in modular code
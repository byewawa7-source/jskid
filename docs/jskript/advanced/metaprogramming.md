# jSkript Advanced: Metaprogramming

> Generate and modify code dynamically. Power‑user techniques for advanced mods.

---

## What is Metaprogramming?

Metaprogramming is code that writes, modifies, or executes other code at runtime. In jSkript, this lets you:

- Generate event handlers from data
- Create DSLs (domain‑specific languages) for your mod
- Inspect and modify mods dynamically
- Build flexible plugin systems

---

## eval()

Evaluate a string as jSkript code:

```jskript
set code to "reply 'Hello from eval!'"
eval code
```

**Use cases:**
- Dynamic command execution
- Loading scripts from external sources
- Debug consoles

**Warnings:**
- `eval()` bypasses static analysis — syntax errors happen at runtime
- Never eval untrusted user input (XSS risk)
- Prefer functions over eval when possible

---

## Dynamic Function Creation

Build functions at runtime:

```jskript
function makeGreeter(greeting):
  return function(name):
    return greeting + ", " + name
  end function
end function

set sayHello = makeGreeter("Hello")
set sayHi = makeGreeter("Hi")

sayHello("Alice")  # "Hello, Alice"
sayHi("Bob")       # "Hi, Bob"
```

---

## Code Generation

Generate jSkript from data:

```jskript
set commands to {
  "ping":  "Pong!",
  "pong":  "Ping!",
  "hello": "Hi there!"
}

for each cmd in keys of commands:
  set handler to "on chat message received:\n  if message is '" + cmd + "':\n    reply '" + commands[cmd] + "'\n  end if\nend on"
  eval handler
end for
```

This creates event handlers from a config map.

---

## Reflection

Inspect mods and the runtime:

```jskript
# List all global variables
log keys of globals

# Check if a function exists
if globals has "myFunction":
  log "Function exists"
end if

# Get function signature
log signature of myFunction
```

---

## Macros / Source Transforms

Preprocess code before it runs:

```jskript
# Define a macro
macro logIf(condition, message):
  if condition:
    log message
  end if
end macro

# Use it
logIf(x > 10, "x is big")

# Expands to:
# if x > 10:
#   log "x is big"
# end if
```

Macros run at compile time, not runtime.

---

## Monkey Patching

Override existing behavior:

```jskript
# Save original
set originalReply = reply

# Override
function reply(text):
  if text contains "secret":
    originalReply "[REDACTED]"
  else:
    originalReply text
  end if
end function
```

Use with caution — this affects all mods.

---

## Hot Reloading

Recompile code without restarting the page:

```jskript
set lastSource to ""

function reloadIfChanged():
  set src to readFile("main.jsk")
  if src != lastSource:
    log "Reloading..."
    set lastSource to src
    eval src
  end if
end function

set timerId to setInterval(reloadIfChanged, 5000)
```

Great for development.

---

## Plugin Systems

Build extensible architectures:

```jskript
set plugins to {}

function registerPlugin(name, setup):
  set plugins[name] = { setup: setup, loaded: false }
end function

function loadPlugin(name):
  if plugins has name:
    plugins[name].setup()
    plugins[name].loaded = true
    log "Loaded plugin: " + name
  end if
end function

# Usage
registerPlugin("auto-reply", function():
  on chat message received:
    if message contains "hello":
      reply "Hi!"
    end if
  end on
end function)

loadPlugin("auto-reply")
```

---

## Safety Rules

1. **Never eval untrusted input** — only eval code you wrote
2. **Sandbox dynamically loaded code** — limit what it can access
3. **Version your generated code** — track what was generated when
4. **Log transformations** — keep a record of macro expansions
5. **Fail fast** — if generated code is invalid, throw immediately

---

## Real-World Example: Dynamic Command Loader

```jskript
set commandsDir = "./commands"
set commandFiles = listFiles(commandsDir)

for each file in commandFiles:
  set cmdName = filenameWithoutExtension(file)
  set cmdCode = readFile(commandsDir + "/" + file)
  
  # Wrap in a function
  set wrapped = "function cmd_" + cmdName + "():\n" + cmdCode + "\nend function"
  eval wrapped
  
  # Register
  set commands[cmdName] = cmd_" + cmdName
end for

# Dispatch
on chat message received:
  set parts = split message by " "
  set cmd = parts[0]
  if commands has cmd:
    commands[cmd]()
  end if
end on
```

---

## Next Steps

- [Performance](advanced/performance.md) — optimize generated code
- [Addons](advanced/addons.md) — extend jSkript itself
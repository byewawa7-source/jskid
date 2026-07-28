# jSkript Language Reference

> **jSkript** is jSkid's scripting language. It's designed to be readable and approachable, even if you've never programmed before.

---

## What is jSkript?

jSkript is a high-level scripting language that compiles to JavaScript. It's used to write mods for JanitorAI. Instead of writing raw JS, you write plain-English-ish commands.

**Example:**

```jskript
on chat message received:
  if sender is "Alice":
    reply "Hey Alice! How's it going?"
  end if
end on
```

This compiles to real JavaScript that runs in the browser.

---

## How to Learn jSkript

We recommend going through these sections in order:

### Basics (start here)
- [Syntax Overview](syntax.md) — how jSkript code is structured
- [Variables & Data](types-and-data.md) — numbers, strings, booleans, lists, objects
- [Events](events.md) — the `on ... end on` pattern
- [Cheat Sheet](cheatsheet.md) — quick reference for common patterns

### Intermediate
- [Control Flow](advanced/control-flow.md) — if/else, loops, conditionals
- [Functions](advanced/functions.md) — defining and calling functions
- [Modules & Scoping](advanced/modules.md) — organizing code across files
- [Error Handling](advanced/error-handling.md) — try/catch, graceful failures

### Advanced
- [Async & Promises](advanced/async.md) — non-blocking operations
- [Metaprogramming](advanced/metaprogramming.md) — dynamic code generation, reflection
- [Performance Tips](advanced/performance.md) — optimizing slow scripts
- [Addons & Hooks](advanced/addons.md) — extending jSkript itself

### Standard Library
- [stdlib/index.md](stdlib/index.md) — overview of built-in modules
- [string.md](stdlib/string.md) — text manipulation
- [list.md](stdlib/list.md) — array operations
- [math.md](stdlib/math.md) — arithmetic, rounding, random
- [object.md](stdlib/object.md) — working with objects/dicts
- [color.md](stdlib/color.md) — color conversion and manipulation
- [time.md](stdlib/time.md) — dates, formatting, delays
- [random.md](stdlib/random.md) — random numbers, choices, shuffles

### Examples
- [RPG Mod](examples/rpg-mod.md) — a complete chat RPG with stats, inventory, combat
- (More examples coming soon)

---

## Quick Reference

### Basic Structure

```jskript
on <event name>:
  <action>
end on
```

### Variables

```jskript
set x to 10
set name to "Alice"
set isActive to true
```

### Conditionals

```jskript
if x > 5:
  reply "Big number"
else if x == 5:
  reply "Exactly 5"
else:
  reply "Small number"
end if
```

### Loops

```jskript
while x > 0:
  log x
  set x to x - 1
end while

for each item in list:
  log item
end for
```

### Functions

```jskript
function greet(name):
  return "Hello, " + name
end function

reply greet("World")
```

### Events

```jskript
on chat message received:
  reply "I see your message!"
end on

on page loaded:
  log "Page is ready"
end on

on button clicked with id "submit":
  reply "Button clicked!"
end on
```

---

## Compilation

jSkript compiles to JavaScript at runtime. This means:

- No build step needed — write code, run it
- Syntax errors show up in the Console tab with line numbers
- You can drop raw JavaScript into jSkript if needed via the `js` block

```jskript
js:
  console.log("Raw JS works too");
end js
```

---

## Need Help?

- [../troubleshooting.md](../troubleshooting.md) — script won't run? Check here
- [../api/README.md](../api/README.md) — use JavaScript APIs directly
- Open an issue on GitHub
# jSkript Language Overview

**jSkript** is a readable, Skript-inspired scripting language for JanitorAI. It uses line-based statements, indentation blocks, and intuitive English keywords.

---

## Language Highlights

- **Readable Syntax**: Natural keywords (`set`, `to`, `add`, `if`, `loop`, `on event`).
- **Curly Brace Variables**: Variables are written inside `{}` curly braces (e.g. `{score}`, `{player}'s hp`).
- **String Interpolation**: Include variable values directly inside strings using `%{variable}%` (e.g. `"Hello %{name}%"`).
- **Indentation Blocks**: Code blocks are delimited by indentation and closed with explicit `end` keywords (`end if`, `end loop`, `end function`).
- **Event-Driven**: Built-in event blocks (`on chat message:`, `every 5 seconds:`, `on mod load:`).

---

## Quick Code Example

```jskript
# RPG Health System Example
template Player:
  hp: number = 100
  maxHp: number = 100
end template

on mod load:
  set {hero} to new Player
  set {hero}'s hp to 85
  log "Hero HP: %{hero}'s hp%/%{hero}'s maxHp%"
end on

on chat message:
  if {user-message} contains "attack":
    subtract 15 from {hero}'s hp
    reply "*The monster attacks!* Your HP is now %{hero}'s hp%."
  end if
end on
```

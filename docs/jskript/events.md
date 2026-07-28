# jSkript Event System Reference

jSkript features an event-driven architecture. Events allow mods to respond asynchronously to chat updates, UI interactions, lifecycle hooks, and timers.

---

## 1. Chat Events

### `on chat message:`
Fires whenever a new message is sent in the current chat session.

- **Available Scope Variables**:
  - `{user-message}` (*text*): Content of the message.
  - `{chat-id}` (*text*): ID of the active chat.
  - `{character-id}` (*text*): ID of the character in chat.

```jskript
on chat message:
  if {user-message} contains "!roll":
    set {d20} to stdlib/random.int(1, 20)
    reply "🎲 You rolled a %{d20}%!"
  end if
end on
```

---

## 2. Timer Events

### `every N seconds:` / `every N minutes:`
Fires repeatedly at regular time intervals.

```jskript
every 30 seconds:
  add 1 to {stamina}
  log "Stamina regenerated to %{stamina}%"
end on
```

### `after N seconds:`
Fires once after a delayed period.

```jskript
after 5 seconds:
  reply "*A strange shadow lurks in the distance...*"
end on
```

---

## 3. Lifecycle Events

### `on mod load:`
Fires when the mod is compiled and loaded into memory.

```jskript
on mod load:
  set {gold} to 50
  log "Mod initialized with default gold."
end on
```

### `on mod unload:`
Fires before the mod is disabled or cleaned up.

```jskript
on mod unload:
  log "Cleaning up mod state..."
end on
```

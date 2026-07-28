# jSkript Basics: Events

> Events are the heart of jSkript. They let your mod react when things happen in the browser.

---

## What is an Event?

An event is something that happens on the page:
- A chat message arrives
- A user clicks a button
- The page finishes loading
- A character is selected

You write code that **listens** for these events and **responds** to them.

---

## Event Syntax

```jskript
on <event name>:
  <your code here>
end on
```

Every event handler starts with `on` and ends with `end on`.

---

## Common Events

### Chat Events

```jskript
on chat message received:
  log "New message: " + message
end on
```

Available in the handler:
- `sender` — who sent the message
- `message` — the text content
- `timestamp` — when it was sent
- `isMe` — whether you sent it

### Page Events

```jskript
on page loaded:
  log "Page is ready!"
end on
```

`page loaded` fires once when the JanitorAI SPA finishes loading a new route.

### Interaction Events

```jskript
on button clicked with id "send-btn":
  reply "Button was clicked!"
end on
```

```jskript
on input submitted with id "chat-input":
  log "User typed: " + input.value
end on
```

---

## Event Data

Every event provides special variables you can use inside the handler.

| Event | Available Variables |
|---|---|
| `chat message received` | `sender`, `message`, `timestamp`, `isMe` |
| `page loaded` | `url`, `path` |
| `button clicked` | `id`, `element` |
| `input submitted` | `id`, `value` |
| `character selected` | `characterId`, `characterName` |
| `room joined` | `roomId`, `roomName` |

---

## Multiple Events

You can listen for multiple events in one script:

```jskript
on page loaded:
  log "Welcome!"
end on

on chat message received:
  if message contains "ping":
    reply "pong"
  end if
end on
```

---

## Event Scope

Variables declared inside an event handler only exist inside that handler:

```jskript
on chat message received:
  set msg to message
  set count to 1
end on

# msg and count are NOT available here
```

To share data between events, use **global variables**:

```jskript
# Declare at top level
set lastMessage to ""

on chat message received:
  set lastMessage to message
end on

on button clicked with id "repeat":
  reply lastMessage  # accessible globally
end on
```

---

## Event Cancellation

Some events can be cancelled to prevent default behavior:

```jskript
on chat message received:
  if message contains "badword":
    cancel event  # Stop the message from appearing
  end if
end on
```

> **Note:** Not all events support cancellation. Check the API reference for details.

---

## Event Priority

If multiple mods listen for the same event, they run in order of priority:

```json
{
  "priority": 100
}
```

Higher numbers run first. Default priority is `0`.

---

## Debugging Events

To see all events as they fire, use the `any` wildcard:

```jskript
on any event:
  log event.name + ": " + event.data
end on
```

This is useful for discovering what events are available.

---

## Performance Tip

Don't do heavy work in high-frequency events like `chat message received`. Use debouncing:

```jskript
on chat message received:
  wait 500ms
  # Only runs if no new message arrived within 500ms
  log "Recent message: " + message
end on
```

---

## Next Steps

- [Control Flow](advanced/control-flow.md) — conditionals and loops
- [Functions](advanced/functions.md) — organize event handlers
- [API Reference](../API/README.md) — full list of events and actions
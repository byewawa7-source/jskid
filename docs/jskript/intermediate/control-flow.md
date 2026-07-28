# jSkript Intermediate: Control Flow

> Learn to make decisions and repeat actions with conditionals and loops.

---

## Conditionals

### `if / else if / else`

Execute different code based on conditions:

```jskript
if message contains "hello":
  reply "Hi there!"
else if message contains "bye":
  reply "Goodbye!"
else:
  reply "I don't understand"
end if
```

### Comparison Operators

| Operator | Meaning |
|---|---|
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |
| `contains` | String/list contains substring/item |
| `in` | Value is in list |
| `is` | Same object or `null` check |
| `matches` | Regex pattern match |

**Examples:**

```jskript
if x > 10:
  log "Big"
end if

if name contains "admin":
  reply "Welcome"
end if

if status is null:
  set status to "idle"
end if

if email matches "^[a-z]+@example\\.com$":
  log "Valid email"
end if
```

---

## Loops

### `while` Loop

Repeat while a condition is true:

```jskript
set count to 5
while count > 0:
  log count
  set count to count - 1
end while
# Output: 5 4 3 2 1
```

**Warning:** Make sure the condition eventually becomes false, or you'll create an infinite loop.

```jskript
# WRONG — infinite loop!
while true:
  reply "spam"
end while
```

### `for` Loop

Loop over a range or list:

```jskript
# Loop over a range
for each i from 1 to 5:
  log i
end for
# Output: 1 2 3 4 5

# Loop over a list
set fruits to ["apple", "banana", "cherry"]
for each fruit in fruits:
  log fruit
end for
```

### Loop Control

#### `break` — exit early

```jskript
for each i from 1 to 10:
  if i == 5:
    break  # Stop the loop
  end if
  log i
end for
# Output: 1 2 3 4
```

#### `continue` — skip to next iteration

```jskript
for each i from 1 to 5:
  if i == 3:
    continue  # Skip 3
  end if
  log i
end for
# Output: 1 2 4 5
```

---

## Match / When

Pattern matching for clean conditionals:

```jskript
match command:
  when "start":
    log "Starting..."
  when "stop":
    log "Stopping..."
  when "restart":
    log "Restarting..."
  else:
    log "Unknown command"
end match
```

This is cleaner than a long chain of `if / else if`.

---

## Ternary Operator

Inline conditional for simple cases:

```jskript
set status to (x > 0 ? "positive" : "non-positive")
```

This is equivalent to:

```jskript
if x > 0:
  set status to "positive"
else:
  set status to "non-positive"
end if
```

---

## Guard Clauses

Use early returns to avoid deep nesting:

```jskript
# WRONG — deeply nested
on chat message received:
  if sender is not "Me":
    if message is not empty:
      if message contains "hello":
        reply "Hi!"
      end if
    end if
  end if
end on

# RIGHT — guard clauses
on chat message received:
  if sender is "Me":
    return
  end if
  if message is empty:
    return
  end if
  if message contains "hello":
    reply "Hi!"
  end if
end on
```

---

## Try / Catch

Handle errors gracefully:

```jskript
try:
  set result to 10 / 0
catch error:
  log "Error: " + error.message
  set result to 0
end try
```

Use this when:
- Parsing user input
- Making HTTP requests
- Working with external data

---

## Logical Operators Shortcuts

### `and` / `or` short-circuit

```jskript
# Short-circuit: second part only runs if needed
if user and user.isAdmin:
  log "Admin"
end if

if cache[key] or fetchFromDB(key):
  log "Got value"
end if
```

### Ternary in loops

```jskript
for each user in users:
  set label to (user.isAdmin ? "Admin" : "User")
  log user.name + " (" + label + ")"
end for
```

---

## Real-World Example

```jskript
on chat message received:
  # Guard clauses
  if isMe:
    return
  end if
  if message is empty:
    return
  end if

  # Parse command
  set parts to split message by " "
  set command to parts[0]

  match command:
    when "!help":
      reply "Commands: !help, !info, !ping"
    when "!info":
      reply "jSkid v1.0 — running on " + page.name
    when "!ping":
      reply "Pong!"
    else:
      if command starts with "!":
        reply "Unknown command: " + command
      end if
  end match
end on
```

---

## Next Steps

- [Functions](advanced/functions.md) — reusable code blocks
- [Modules](advanced/modules.md) — organize code across files
- [Error Handling](advanced/error-handling.md) — advanced error patterns
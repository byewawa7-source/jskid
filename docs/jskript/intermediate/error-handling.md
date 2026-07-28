# jSkript Intermediate: Error Handling

> Write robust mods that handle failures gracefully.

---

## Why Handle Errors?

Without error handling, a single mistake can crash your entire mod:

```jskript
# This will crash if message is null
set firstChar to message[0]
```

Error handling lets you:
- Prevent crashes
- Show friendly error messages
- Log problems for debugging
- Continue running when something fails

---

## Try / Catch

Wrap risky code in a `try` block:

```jskript
try:
  set result to 10 / 0
catch error:
  log "Something went wrong: " + error.message
  set result to 0
end try
```

**How it works:**
1. Code in `try` runs normally
2. If an error occurs, execution jumps to `catch`
3. The `error` variable contains details about what failed
4. The mod continues running

---

## Common Errors to Catch

### Division by zero

```jskript
try:
  set ratio to total / count
catch error:
  set ratio to 0
end try
```

### Missing keys in objects

```jskript
try:
  set email to user.email
catch error:
  set email to "no-email"
end try
```

### Invalid conversions

```jskript
try:
  set num to "not-a-number" as number
catch error:
  set num to 0
end try
```

### HTTP requests failing

```jskript
try:
  set data to http get "https://api.example.com/data"
catch error:
  log "Network error: " + error.message
  set data to {}
end try
```

---

## The `error` Object

When an error is caught, you get an object with:

| Property | Description |
|---|---|
| `error.message` | Human-readable description |
| `error.type` | Error category (e.g. "TypeError", "NetworkError") |
| `error.stack` | Stack trace for debugging |

```jskript
catch error:
  log "Error: " + error.type + " — " + error.message
end try
```

---

## Finally

Run cleanup code whether or not an error occurred:

```jskript
try:
  set file to open "config.json"
  set config to parse file
catch error:
  log "Failed to load config"
  set config to {}
finally:
  close file
end try
```

`finally` always runs, even if there was no error.

---

## Throwing Errors

You can throw your own errors:

```jskript
function divide(a, b):
  if b == 0:
    throw error "Cannot divide by zero"
  end if
  return a / b
end function
```

Use `throw` when:
- Input is invalid
- A required resource is missing
- Your function can't do its job

---

## Error Handling Patterns

### Guard Clauses with Errors

```jskript
function processUser(user):
  if user is null:
    throw error "User is required"
  end if
  if user has "id" is not true:
    throw error "User must have an id"
  end if
  # ... safe to proceed
end function
```

### Retry Logic

```jskript
function fetchWithRetry(url, retries=3):
  try:
    return http get url
  catch error:
    if retries > 0:
      wait 1s
      return fetchWithRetry(url, retries - 1)
    else:
      throw error "Failed after 3 retries"
    end if
  end try
end function
```

### Fallback Values

```jskript
function getConfig(key, default=null):
  try:
    return settings[key]
  catch error:
    return default
  end try
end function

set timeout to getConfig("timeout", 5000)  # 5000 if missing
```

---

## Logging Errors

Always log errors for debugging:

```jskript
try:
  set data to loadData()
catch error:
  log "[ERROR] Failed to load data: " + error.message
  log "[ERROR] Type: " + error.type
  set data to []
end try
```

---

## Global Error Handler

Catch all uncaught errors in your mod:

```jskript
on error:
  log "[UNCAUGHT] " + error.message
  # Optionally report to a logging service
end on
```

This is your safety net.

---

## Best Practices

1. **Don't swallow errors silently** — at minimum, log them
2. **Catch specific errors** — don't wrap everything in one big try/catch
3. **Fail gracefully** — show a fallback, not a broken UI
4. **Use meaningful messages** — "Failed to save" not "Error 42"
5. **Clean up in finally** — close files, release locks, etc.

---

## Next Steps

- [Async](advanced/async.md) — error handling with promises
- [Performance](advanced/performance.md) — avoid error-prone patterns
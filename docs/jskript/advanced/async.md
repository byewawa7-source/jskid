# jSkript Advanced: Async & Promises

> Non-blocking operations: delays, network requests, and concurrent tasks.

---

## Why Async Matters

Blocking code freezes the entire mod — and the page:

```jskript
# BLOCKS the page for 5 seconds!
wait 5s
reply "Done"
```

jSkript uses async patterns so the UI stays responsive while waiting.

---

## Wait / Delay

Pause execution without blocking:

```jskript
reply "Starting..."
wait 2s
reply "2 seconds passed"
```

Supported durations:
- `wait 1s` — 1 second
- `wait 500ms` — 500 milliseconds
- `wait 1.5s` — 1.5 seconds

---

## After / Scheduled

Run code later without pausing current execution:

```jskript
reply "Task scheduled"

after 5s:
  reply "5 seconds later!"
end after

reply "This runs immediately"
```

`after` doesn't block — it schedules for later and continues.

---

## Promises

A promise represents a future value. Use `await` to pause until it resolves:

```jskript
set userData to await fetchUser("123")
reply "User: " + userData.name
```

### Creating Promises

```jskript
function fetchUser(id):
  return promise:
    http get "https://api.example.com/users/" + id
  end promise
end function
```

### Handling Errors with Promises

```jskript
try:
  set data to await fetchData()
catch error:
  reply "Failed: " + error.message
end try
```

### Multiple Promises

Run concurrently and wait for all:

```jskript
set [users, posts, comments] to await all([
  fetchUsers(),
  fetchPosts(),
  fetchComments()
])
```

Wait for the first to complete:

```jskript
set fastest to await race([
  fetchFromServerA(),
  fetchFromServerB(),
  fetchFromServerC()
])
```

---

## HTTP Requests

Fetch data from APIs:

```jskript
try:
  set response to http get "https://api.example.com/data"
  set data to response.json()
  log "Got " + length of data + " items"
catch error:
  log "Request failed: " + error.message
end try
```

### GET Request

```jskript
set response to http get "https://api.example.com/users"
```

### POST Request

```jskript
set response to http post "https://api.example.com/users" with {
  body: { name: "Alice", role: "admin" }
}
```

### Headers & Auth

```jskript
set response to http get "https://api.example.com/protected" with {
  headers: {
    "Authorization": "Bearer TOKEN",
    "Accept": "application/json"
  }
}
```

---

## Timers

### One-shot Timer

```jskript
set timerId to setInterval(function():
  log "Tick"
end function, 1000)

# Later: cancel it
clearInterval(timerId)
```

### Repeating Timer

```jskript
# Every 5 seconds
set timerId to setInterval(function():
  checkForUpdates()
end function, 5000)

# Stop it
clearInterval(timerId)
```

### Delayed Execution

```jskript
set timeoutId to setTimeout(function():
  reply "Delayed message"
end function, 3000)

# Cancel before it runs
clearTimeout(timeoutId)
```

---

## WebSockets

Real-time communication:

```jskript
set ws to websocket "wss://api.example.com/chat"

ws.on open:
  log "Connected!"
  ws.send "Hello server"
end on

ws.on message:
  set data to ws.receive()
  log "Got: " + data
end on

ws.on close:
  log "Disconnected"
end on

ws.on error:
  log "Error: " + error.message
end on
```

---

## Concurrent Patterns

### Parallel Fetch

```jskript
function fetchAll(urls):
  set promises to []
  for each url in urls:
    add promise: http get url end promise to promises
  end for
  return await all(promises)
end function

set results to fetchAll([
  "https://api.example.com/1",
  "https://api.example.com/2",
  "https://api.example.com/3"
])
```

### Throttle

Limit how often a function runs:

```jskript
function throttle(fn, delayMs):
  set lastRun to 0
  return function(...args):
    set now to currentTime()
    if now - lastRun >= delayMs:
      lastRun = now
      fn(...args)
    end if
  end function
end function

set throttledLog = throttle(function(msg):
  log msg
end function, 1000)

# Only logs once per second max
throttledLog("hi")
throttledLog("hi")
throttledLog("hi")
```

---

## Best Practices

1. **Don't block** — use `after` instead of `wait` when possible
2. **Handle errors** — always wrap async in try/catch
3. **Cancel timers** — clean up intervals/timeouts when mods disable
4. **Limit concurrency** — don't fire 100 API calls at once
5. **Use timeouts** — set a max wait time for network requests

```jskript
set response to await http get url with { timeout: 5000 }
```

---

## Next Steps

- [Metaprogramming](advanced/metaprogramming.md) — dynamic code generation
- [Performance](advanced/performance.md) — optimize slow scripts
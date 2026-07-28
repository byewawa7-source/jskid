# jSkript Advanced: Performance

> Optimize your mods to run fast and smooth.

---

## Why Performance Matters

A slow mod can:
- Freeze the page for everyone
- Cause tab crashes
- Drain battery on laptops/phones
- Make interactions feel laggy

Always profile before optimizing. The biggest bottlenecks are usually:
- Heavy work inside `chat message received`
- Unnecessary re-renders
- Memory leaks from uncleaned intervals

---

## Measure First

Use the built-in profiler:

```jskript
set startTime to now()

# ... your code ...

set elapsedMs = now() - startTime
log "Completed in " + elapsedMs + "ms"
```

Or browser devtools:
1. F12 → Performance tab
2. Record while using your mod
3. Look for long tasks (>50ms is bad)

---

## Avoid Blocking

Blocking code stops the entire page:

```jskript
# BLOCKS — don't do this
for each i from 1 to 1000000:
  doSomething()
end for
```

Use chunking or `after`:

```jskript
set i to 0
function processChunk():
  set end to i + 1000
  while i < end and i < 1000000:
    doSomething()
    set i to i + 1
  end while
  if i < 1000000:
    after 0s:
      processChunk()
    end after
  end if
end function

processChunk()
```

---

## Debounce High-Frequency Events

Chat messages fire fast. Debounce to avoid running expensive logic on every message:

```jskript
set debounceTimer to null

on chat message received:
  if debounceTimer is not null:
    clearTimeout(debounceTimer)
  end if
  set debounceTimer to setTimeout(function():
    processMessage(message)
  end function, 300)
end on
```

Only runs `processMessage` after 300ms of silence.

---

## Throttle Repeated Work

Run logic at most once per interval:

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

set throttledUpdate = throttle(function():
  updateUI()
end function, 1000)

# UI updates at most once per second
on dataChanged:
  throttledUpdate()
end on
```

---

## Efficient DOM Access

Cache DOM queries. Don't search the DOM repeatedly:

```jskript
# WRONG — searches DOM every message
on chat message received:
  set input = getElementById("chat-input")
  set inputValue = input.value
end on

# RIGHT — cache once
set chatInput = getElementById("chat-input")
on chat message received:
  set inputValue = chatInput.value
end on
```

---

## Memory Leaks

Common leak sources:
1. **Uncleared timers** — always `clearInterval` / `clearTimeout` when mod disables
2. **Listeners not removed** — unbind events on disable
3. **Growing arrays** — prune old data

```jskript
set timerId = setInterval(update, 1000)
set listenerId = on chat message received: processMessage() end on

function cleanup():
  clearInterval(timerId)
  unbind listenerId
  set cachedData to {}  # Free memory
end function
```

---

## Lazy Loading

Only load data when needed:

```jskript
set userCache = {}

function getUser(id):
  if userCache has id:
    return userCache[id]
  end if
  set user = fetchUserFromDB(id)
  set userCache[id] = user
  return user
end function
```

---

## Batch Operations

Combine multiple operations into one:

```jskript
# WRONG — 100 HTTP requests
for each id in userIds:
  http get "https://api.example.com/user/" + id
end for

# RIGHT — one batch request
http post "https://api.example.com/users/batch" with {
  body: { ids: userIds }
}
```

---

## Strings

Use string builders for large concatenations:

```jskript
# WRONG — creates many temp strings
set output to ""
for each item in items:
  set output to output + item + ","
end for

# RIGHT — join is faster
set output = join items with ","
```

---

## Lists

Preallocate when size is known:

```jskript
# SLOW — repeated resizing
set bigList = []
for each i from 1 to 10000:
  add i to bigList
end for

# FAST — single allocation
set bigList = range(1, 10000)
```

---

## Caching

Memoize expensive computations:

```jskript
set fibCache = { 0: 0, 1: 1 }

function fib(n):
  if fibCache has n:
    return fibCache[n]
  end if
  set result = fib(n-1) + fib(n-2)
  set fibCache[n] = result
  return result
end function
```

---

## When Not to Optimize

- **Don't optimize early** — make it work, then make it fast
- **Don't optimize rare paths** — focus on code that runs often
- **Don't sacrifice readability** — clear code > clever code

Rule of thumb: if it's under 16ms, it's fast enough.
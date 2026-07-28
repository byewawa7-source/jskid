# Stdlib: Time

> Date, time, and delay functions. Available globally.

---

## `now()`

Current timestamp in milliseconds since Unix epoch.

```jskript
set now = now()
```

## `formatDate(<timestamp>, <pattern>)`

Format a timestamp.

```jskript
formatDate(now(), "YYYY-MM-DD")       # "2024-12-31"
formatDate(now(), "HH:mm:ss")         # "23:59:59"
formatDate(now(), "MMM DD, YYYY")     # "Dec 31, 2024"
```

Pattern tokens:
- `YYYY` — 4-digit year
- `MM` — 2-digit month
- `DD` — 2-digit day
- `HH` — 2-digit hour (24h)
- `mm` — 2-digit minute
- `ss` — 2-digit second
- `MMM` — short month name

## `wait <duration>`

Pause execution.

```jskript
wait 1s
wait 500ms
wait 2.5s
```

## `after <duration>: ... end after`

Schedule code to run later.

```jskript
after 3s:
  reply "3 seconds passed!"
end after
```

## `setTimeout(fn, ms)`

One-shot timer.

```jskript
set id = setTimeout(function():
  log "Delayed"
end function, 1000)
```

## `setInterval(fn, ms)`

Repeating timer.

```jskript
set id = setInterval(function():
  log "Tick"
end function, 1000)
```

## `clearTimeout(<id>)`

Cancel a timeout.

## `clearInterval(<id>)`

Cancel an interval.

```jskript
clearInterval(id)
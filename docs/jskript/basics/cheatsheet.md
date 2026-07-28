# jSkript Cheat Sheet

> Quick copy-paste reference for common jSkript patterns.

---

## Variables & Output

```jskript
set x to 10
set name to "Alice"
set isActive to true

reply "Hello, " + name
log "Debug: x = " + x
```

---

## Conditionals

```jskript
if x > 5:
  reply "Big"
else if x == 5:
  reply "Exactly 5"
else:
  reply "Small"
end if

if name contains "admin":
  reply "Welcome admin"
end if

if x in [1, 2, 3]:
  reply "In range"
end if
```

---

## Loops

```jskript
# While loop
while x > 0:
  log x
  set x to x - 1
end while

# For loop over list
for each item in items:
  log item
end for

# For loop with index
for each i from 1 to 10:
  log i
end for
```

---

## Lists

```jskript
set items to ["a", "b", "c"]
add "d" to items
remove "b" from items
set first to items[0]
set last to items[-1]
set count to length of items
```

---

## Objects

```jskript
set user to { name: "Alice", age: 30 }
set name to user.name
set user.age to 31
if user has "email":
  log user.email
end if
```

---

## Functions

```jskript
function greet(name):
  return "Hello, " + name
end function

reply greet("World")
```

---

## Events

```jskript
on page loaded:
  log "Ready"
end on

on chat message received:
  if message contains "hello":
    reply "Hi!"
  end if
end on

on button clicked with id "my-btn":
  reply "Clicked"
end on
```

---

## Math

```jskript
set sum to 1 + 2
set diff to 5 - 3
set prod to 2 * 4
set quot to 10 / 3
set mod to 10 % 3
set pow to 2 ^ 3

round 3.7       # 4
floor 3.7       # 3
ceil 3.2        # 4
random 1 to 10  # random number
```

---

## Strings

```jskript
set upper to upper of "hello"
set lower to lower of "HELLO"
set trimmed to trim of "  text  "
set parts to split "a,b,c" by ","
set joined by join ["a","b","c"] with "-"
```

---

## Timing

```jskript
wait 1s
wait 500ms
after 5s:
  log "5 seconds passed"
end after
```

---

## Includes

```jskript
include "utils.jsk"
include "lib/helpers.jsk"
```

---

## Raw JS

```jskript
js:
  const el = document.getElementById("my-id");
  el.style.color = "red";
end js
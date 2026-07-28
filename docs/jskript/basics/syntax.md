# jSkript Basics: Syntax

> The foundational rules of jSkript. Learn how code is structured before writing your first script.

---

## The `on ... end on` Pattern

Every jSkript script starts with an **event handler**. This tells jSkript when to run your code.

```jskript
on <event name>:
  <your code here>
end on
```

**Example:**

```jskript
on page loaded:
  log "Page has finished loading!"
end on
```

---

## Statements

A statement is a single instruction. jSkript statements usually end with a newline — no semicolons needed.

```jskript
set x to 5
reply "Hello"
log "Debug info"
```

---

## Comments

Use `#` for single-line comments:

```jskript
# This is a comment
set x to 5  # inline comment also works
```

---

## Strings

Text values are surrounded by double quotes:

```jskript
set name to "Alice"
reply "Hello, " + name + "!"
```

Escape special characters with `\`:

```jskript
set quote to "She said \"hello\""
set newline to "Line 1\nLine 2"
```

---

## Numbers

Integers and decimals:

```jskript
set age to 25
set pi to 3.14159
```

---

## Booleans

True or false:

```jskript
set isActive to true
set isAdmin to false
```

---

## Keywords Reference

| Keyword | Purpose |
|---|---|
| `set` | Assign a value to a variable |
| `if` / `else if` / `else` | Conditional logic |
| `while` / `for` | Loops |
| `function` / `end function` | Define a function |
| `return` | Return a value from a function |
| `on` / `end on` | Event handler |
| `reply` | Send a chat message |
| `log` | Print to console |
| `include` | Import another jSkript file |

---

## Common Mistakes

1. **Missing `end if` / `end on`**
   ```jskript
   # WRONG
   if x > 5:
     reply "Big"
   
   # RIGHT
   if x > 5:
     reply "Big"
   end if
   ```

2. **Curly quotes**
   ```jskript
   # WRONG
   reply ""Hello""
   
   # RIGHT
   reply "Hello"
   ```

3. **Wrong indentation** (optional but recommended)
   ```jskript
   # Both work, but indented is easier to read
   if x > 5:
     reply "Big"
   end if
   ```

---

## Next Steps

- [Variables & Data](types-and-data.md) — work with different data types
- [Events](events.md) — available events and how to use them
- [Cheat Sheet](cheatsheet.md) — quick copy-paste patterns
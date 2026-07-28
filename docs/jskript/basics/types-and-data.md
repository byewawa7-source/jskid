# jSkript Basics: Variables & Data

> Learn about jSkript's data types: numbers, strings, booleans, lists, and objects.

---

## Variables

Variables store data. Use `set` to create or update them:

```jskript
set name to "Alice"
set age to 30
```

Variable names:
- Must start with a letter
- Can contain letters, numbers, and underscores
- Are case-sensitive (`name` and `Name` are different)

---

## Data Types

### Strings

Text surrounded by double quotes:

```jskript
set greeting to "Hello, world!"
set empty to ""
```

**Operations:**
- Concatenation: `"Hello, " + name`
- Length: `length of "hello"` → `5`
- Substring: `"hello" from 1 to 3` → `"ell"`

### Numbers

Integers and decimals:

```jskript
set count to 42
set price to 19.99
```

**Operations:**
- Addition: `1 + 2`
- Subtraction: `5 - 3`
- Multiplication: `2 * 4`
- Division: `10 / 3` → `3.333...`
- Integer division: `10 // 3` → `3`
- Modulo: `10 % 3` → `1`

### Booleans

True or false values:

```jskript
set isActive to true
set isDone to false
```

**Operators:**
- `and` — both must be true
- `or` — at least one must be true
- `not` — flips true/false

```jskript
if isActive and isAdmin:
  reply "Welcome, admin!"
end if
```

### Lists

Ordered collections of values:

```jskript
set fruits to ["apple", "banana", "cherry"]
set numbers to [1, 2, 3, 4, 5]
set mixed to [1, "two", true, [4, 5]]
```

**Operations:**
- Length: `length of fruits` → `3`
- Access by index: `fruits[0]` → `"apple"` (0-indexed)
- Last item: `fruits[-1]` → `"cherry"`
- Slice: `numbers from 1 to 3` → `[2, 3]`
- Append: `add "orange" to fruits`
- Remove: `remove "banana" from fruits`

**Looping over lists:**

```jskript
for each fruit in fruits:
  log fruit
end for
```

### Objects (Dictionaries)

Key-value pairs:

```jskript
set user to {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
}
```

**Operations:**
- Access: `user.name` → `"Alice"`
- Set: `set user.age to 31`
- Check key: `user has "email"` → `true`

**Looping over objects:**

```jskript
for each key in user:
  log key + ": " + user[key]
end for
```

---

## Null / Empty Values

Use `null` for missing or unknown values:

```jskript
set result to null
if result is null:
  log "No result yet"
end if
```

Check for empty list or string:

```jskript
if items is empty:
  log "No items"
end if
```

---

## Type Coercion

jSkript automatically converts types in many contexts:

```jskript
set x to "5" + 3        # "53" (string concatenation)
set y to "5" + "3"      # "53"
set z to "10" * 2       # 20 (numeric multiplication)
set w to "10" / 2       # 5 (numeric division)
```

Be careful with `+` — it concatenates strings but adds numbers.

---

## Constants

Use `const` for values that shouldn't change:

```jskript
const MAX_ITEMS = 100
const GREETING = "Hello!"
```

Trying to change a `const` will throw an error.

---

## Type Checking

Check a value's type:

```jskript
type of 42         # "number"
type of "hello"    # "string"
type of true       # "boolean"
type of [1, 2, 3]  # "list"
type of {a: 1}     # "object"
```

---

## Next Steps

- [Control Flow](advanced/control-flow.md) — if/else, loops
- [Functions](advanced/functions.md) — reusable code blocks
- [Events](events.md) — respond to page actions
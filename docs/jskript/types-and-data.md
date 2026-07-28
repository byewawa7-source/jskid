# jSkript Data Types & Type System Guide

jSkript supports dynamic typing with several built-in primitives and structured data types.

---

## 1. Type Overview Table

| Type Name | Example | Description |
|---|---|---|
| `text` | `"Hello world"` | String literals enclosed in double or single quotes |
| `number` | `42`, `3.14159` | Integer or floating-point numeric value |
| `boolean` | `true`, `false` | Boolean truth value |
| `list` | `list(1, 2, 3)` | Ordered array of elements |
| `object` | `object("key": "val")` | Key-value dictionary map |
| `null` | `null` | Absence of value |
| `template` | `new Player` | Instantiated struct template instance |

---

## 2. Text (Strings) & Interpolation

Strings use double quotes `"` or single quotes `'`. Variables can be embedded inside strings using `%{var}%`:

```jskript
set {name} to "Elara"
set {greeting} to "Greetings, %{name}%!"
```

---

## 3. Lists (Arrays)

Lists store ordered sequences of values:

```jskript
set {inventory} to list("Health Potion", "Iron Sword", "Magic Scroll")

# Array helper stdlib operations
set {len} to stdlib/list.length({inventory})
set {firstItem} to stdlib/list.first({inventory})
add "Golden Shield" to {inventory}
```

---

## 4. Objects (Dictionaries)

Key-value mapping data structure:

```jskript
set {stats} to object("strength": 18, "agility": 14, "intelligence": 12)
set {str} to stdlib/object.get({stats}, "strength")
```

---

## 5. Templates (Structs)

Templates define reusable struct shapes with named fields and optional default values:

```jskript
template Item:
  name: text
  value: number = 10
  isEquipped: boolean = false
end template

set {potion} to new Item
set {potion}'s name to "Super Potion"
set {potion}'s value to 50
```

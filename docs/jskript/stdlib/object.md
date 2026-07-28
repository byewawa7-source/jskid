# Stdlib: Object

> Object/dictionary helpers. Available globally.

---

## `keys of <object>`

Get all keys as a list.

```jskript
keys of {a: 1, b: 2}  # ["a","b"]
```

## `values of <object>`

Get all values as a list.

```jskript
values of {a: 1, b: 2}  # [1,2]
```

## `merge <object1> with <object2>`

Combine two objects (shallow merge).

```jskript
merge {a: 1} with {b: 2}  # {a:1, b:2}
```

## `clone <object>`

Deep copy.

```jskript
set original = {a: {nested: true}}
set copy = clone original
```

## `has <key> in <object>`

Check if key exists.

```jskript
if user has "email":
  log user.email
end if
```

## Access properties

```jskript
user.name
user["name"]
set user.age to 30
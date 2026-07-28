# Stdlib: List

> Array/list operations. Available globally.

---

## `add <item> to <list>`

Append an item.

```jskript
add "x" to items
```

## `remove <item> from <list>`

Remove first match.

```jskript
remove "x" from items
```

## `length of <list>`

Count items.

```jskript
length of [1,2,3]  # 3
```

## Access by index

```jskript
items[0]    # First item
items[-1]   # Last item
items[1]    # Second item
```

## Slice

```jskript
items from 1 to 3  # Items 1-3
```

## `sort <list>`

Sort ascending.

```jskript
set nums to [3,1,2]
sort nums  # [1,2,3]
```

## `reverse <list>`

Reverse in place.

```jskript
reverse items
```

## `filter <list> by <condition>`

Keep matching items.

```jskript
set evens = filter [1,2,3,4] by x % 2 == 0  # [2,4]
```

## `map <list> by <expression>`

Transform items.

```jskript
set doubled = map [1,2,3] by x * 2  # [2,4,6]
```

## `join <list> with <separator>`

Combine into string.

```jskript
join ["a","b","c"] with "-"  # "a-b-c"
```

## `randomChoice <list>`

Pick one random item.

```jskript
randomChoice ["rock","paper","scissors"]
```

## `shuffle <list>`

Randomize order.

```jskript
shuffle [1,2,3,4]  # e.g. [3,1,4,2]
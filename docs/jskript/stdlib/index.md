# jSkript Standard Library

> Built-in modules for common tasks. Available everywhere without importing.

---

## Modules

| Module | Purpose | Key Functions |
|---|---|---|
| [String](string.md) | Text manipulation | `upper`, `lower`, `trim`, `split`, `join` |
| [List](list.md) | Array operations | `add`, `remove`, `sort`, `filter`, `map` |
| [Math](math.md) | Arithmetic & random | `round`, `floor`, `ceil`, `random`, `min`, `max` |
| [Object](object.md) | Object/dict helpers | `keys`, `values`, `merge`, `clone` |
| [Color](color.md) | Color conversion | `hexToRgb`, `rgbToHex`, `hslToRgb` |
| [Time](time.md) | Dates & delays | `now`, `formatDate`, `wait`, `after` |
| [Random](random.md) | Randomization | `random`, `randomChoice`, `shuffle` |

---

## Usage

Stdlib functions are globally available — no import needed:

```jskript
set upper to upper of "hello"
set list to [3, 1, 2]
sort list
set now to now()
```

---

## String

```jskript
upper of "hello"           # "HELLO"
lower of "HELLO"           # "hello"
trim of "  text  "         # "text"
split "a,b,c" by ","       # ["a","b","c"]
join ["a","b"] with "-"    # "a-b"
length of "hello"          # 5
"hello" from 1 to 3        # "ell"
```

---

## List

```jskript
add "x" to items
remove "x" from items
sort items
filter items by x > 5
map items by x * 2
length of items
items[0]
items[-1]
```

---

## Math

```jskript
round 3.7      # 4
floor 3.7      # 3
ceil 3.2       # 4
min(3, 1, 4)   # 1
max(3, 1, 4)   # 4
random 1 to 10 # random int
```

---

## Object

```jskript
keys of {a: 1, b: 2}       # ["a","b"]
values of {a: 1, b: 2}     # [1,2]
merge {a: 1} with {b: 2}   # {a:1, b:2}
clone {a: 1}               # {a:1}
```

---

## Time

```jskript
now()                      # timestamp ms
formatDate(now(), "YYYY-MM-DD")
wait 1s
after 5s: ... end after
```

---

## Color

```jskript
hexToRgb("#ff8800")        # {r:255, g:136, b:0}
rgbToHex(255, 136, 0)      # "#ff8800"
hslToRgb(0.08, 1, 0.5)     # {r:255, g:136, b:0}
```

---

## Random

```jskript
random 1 to 10             # int
randomFloat 0 to 1         # float
randomChoice(["a","b","c"]) # "a"|"b"|"c"
shuffle [1,2,3,4]          # [3,1,4,2]
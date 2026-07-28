# Stdlib: Math

> Arithmetic and rounding functions. Available globally.

---

## `round <number>`

Round to nearest integer.

```jskript
round 3.7   # 4
round 3.2   # 3
```

## `floor <number>`

Round down.

```jskript
floor 3.7   # 3
floor 3.2   # 3
```

## `ceil <number>`

Round up.

```jskript
ceil 3.7   # 4
ceil 3.2   # 4
```

## `min(<numbers...>)`

Smallest value.

```jskript
min(3, 1, 4)   # 1
min([5,2,8])   # 2
```

## `max(<numbers...>)`

Largest value.

```jskript
max(3, 1, 4)   # 4
max([5,2,8])   # 8
```

## `random <min> to <max>`

Random integer in range (inclusive).

```jskript
random 1 to 10   # e.g. 7
random 0 to 1    # 0 or 1
```

## `abs <number>`

Absolute value.

```jskript
abs(-5)   # 5
abs(3)    # 3
```

## `sqrt <number>`

Square root.

```jskript
sqrt 16   # 4
sqrt 2    # 1.414...
```

## `pow <base> <exponent>`

Power.

```jskript
pow 2 3   # 8
pow 3 2   # 9
```

## Arithmetic Operators

These work directly on numbers:

```jskript
set sum = 1 + 2      # 3
set diff = 5 - 3     # 2
set prod = 2 * 4     # 8
set quot = 10 / 3    # 3.333...
set mod = 10 % 3     # 1
set power = 2 ^ 3    # 8
# Stdlib: Random

> Randomization utilities. Available globally.

---

## `random <min> to <max>`

Random integer in range (inclusive).

```jskript
random 1 to 10    # e.g. 7
random 0 to 1     # 0 or 1
random -5 to 5    # e.g. -3
```

## `randomFloat <min> to <max>`

Random float in range.

```jskript
randomFloat 0 to 1      # e.g. 0.3742
randomFloat 0 to 100    # e.g. 42.7
```

## `randomChoice(<list>)`

Pick one random item from a list.

```jskript
randomChoice ["rock","paper","scissors"]   # "rock"
randomChoice [1,2,3,4,5]                  # 3
```

## `shuffle(<list>)`

Shuffle a list in place and return it.

```jskript
set deck = [1,2,3,4,5,6]
shuffle deck   # e.g. [4,1,6,2,5,3]
```

## `weightedRandom(<object>)`

Pick a key weighted by its value.

```jskript
set loot = {
  "common":  70,
  "rare":    25,
  "legendary": 5
}
weightedRandom loot  # "common" (70% chance)
```

## `noise(<x>)`

Simple pseudo-random noise function (deterministic).

```jskript
noise 0.5   # 0.0 - 1.0
```

Useful for generating terrain, scatter, etc.
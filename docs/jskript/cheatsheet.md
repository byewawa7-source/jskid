# jSkript Syntax Cheatsheet

Quick reference for all jSkript keywords, structures, and operators.

---

## Variables & Math

```jskript
# Declarations
set {name} to "Hero"
set {hp} to 100
set {isAlive} to true
set {items} to list("sword", "shield", "potion")

# Math
add 10 to {hp}
subtract 5 from {hp}
multiply {gold} by 2
divide {mana} by 4

# Strings
append "!" to {text}
prepend ">> " to {text}
replace "monster" with "dragon" in {text}
trim {text}
split {text} by ","
join {list} with ", "

# Interpolation
reply "Greetings %{name}%, your HP is %{hp}%."
```

---

## Control Flow

```jskript
# If / Else
if {score} >= 100:
  reply "You win!"
else if {score} >= 50:
  reply "Almost!"
else:
  reply "Try again!"
end if

# Switch
switch {class}:
  case "warrior":
    set {hp} to 150
  case "mage":
    set {hp} to 70
  default:
    set {hp} to 100
end switch
```

---

## Loops

```jskript
# Fixed
loop 5 times:
  reply "Counting..."
end loop

# Range
loop {i} from 1 to 10:
  reply "Item %{i}%"
end loop

# List Iteration
loop through {items}:
  reply "Item: {loop-item}"
end loop

# While
while {hp} > 0:
  subtract 10 from {hp}
end while
```

---

## Functions & Structs

```jskript
# Function
function add(a, b):
  return {a} + {b}
end function

# Template (Struct)
template Character:
  name: text
  level: number = 1
  hp: number = 100
end template

set {hero} to new Character
set {hero}'s name to "Arthur"
set {hero}'s level to 5
```

---

## Events

```jskript
# Chat Event
on chat message:
  if {user-message} contains "hello":
    reply "Hello there!"
  end if
end on

# Lifecycle
on mod load:
  log "Mod loaded successfully!"
end on

# Timers
every 10 seconds:
  log "10 seconds passed"
end on
```

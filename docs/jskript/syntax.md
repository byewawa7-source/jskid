# jSkript Syntax Reference

## 1. Variables & Assignment

```jskript
# Basic assignment
set {name} to "Hero"
set {hp} to 100
set {isAlive} to true
set {items} to list("sword", "potion")

# Math mutations
add 10 to {hp}
subtract 5 from {hp}
multiply {gold} by 2
divide {mana} by 4

# String mutations
append "!" to {name}
prepend "Sir " to {name}
replace "old" with "new" in {text}
```

---

## 2. Control Flow

```jskript
# If / Else If / Else
if {hp} > 50:
  reply "Feeling strong!"
else if {hp} > 0:
  reply "Wounded..."
else:
  reply "Fallen!"
end if

# Switch / Case
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

## 3. Loops

```jskript
# Fixed iteration
loop 5 times:
  reply "Echo..."
end loop

# While loop
while {hp} > 0:
  subtract 10 from {hp}
end while
```

---

## 4. Functions & Templates

```jskript
# Functions
function calculateDamage(baseDmg, armor):
  return {baseDmg} - {armor}
end function

# Templates (Structs)
template Character:
  name: text
  hp: number = 100
end template

set {c} to new Character
set {c}'s name to "Elara"
```

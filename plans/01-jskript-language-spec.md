# jSkript Language Specification

## 1. Overview
jSkript is a Skript-inspired scripting language designed for janitorai.com modding. It prioritizes readability while being powerful enough for complex mods including mini-games, interactive UIs, and state machines.

## 2. Syntax Rules
- Indentation-based blocks (like Python/Skript)
- Keywords are lowercase English words
- Variables are enclosed in `{}` curly braces
- Strings use double quotes `"`
- Line-based (one statement per line)
- Comments start with `#` or `//`

## 3. Comments
```
# Single line comment
// Also a single line comment
```

## 4. Variables
```
# Declaration & assignment
set {name} to "value"
set {count} to 42
set {isReady} to true
set {items} to list("a", "b", "c")
set {config} to object("key": "value")

# Variable operations
add 5 to {count}
subtract 3 from {count}
multiply {count} by 2
divide {count} by 4

# String operations
append "!" to {text}
prepend ">> " to {text}
replace "old" with "new" in {text}
trim {text}
split {text} by ","
join {list} with ", "

# Existence check
exists {variable}
type of {variable}
```

## 5. Data Types
| Type | Example | Description |
|------|---------|-------------|
| text | `"hello"` | String |
| number | `42`, `3.14` | Integer or float |
| boolean | `true`, `false` | Boolean |
| list | `list(1, 2, 3)` | Ordered array |
| object | `object("k": "v")` | Key-value map |
| range | `range(1 to 10)` | Numeric range |
| null | `null` | Null value |
| function | `function(x): ...` | First-class function |
| template | `template(...)` | Reusable struct |

## 6. Control Flow
```
# If/else if/else
if {score} >= 100:
    reply "You win!"
else if {score} >= 50:
    reply "Almost!"
else:
    reply "Keep trying!"
end if

# Inline conditional
set {msg} to "Win!" if {score} >= 100 else "Lose"

# Switch
switch {class}:
    case "warrior":
        set {hp} to 150
    case "mage":
        set {hp} to 80
    default:
        set {hp} to 100
end switch
```

## 7. Loops
```
# Fixed
loop 10 times:
    # ...
end loop

# Range
loop {i} from 1 to 10:
    reply "%{i}%"
end loop

# List iteration
loop through {items}:
    reply "{loop-item}"
end loop

# While
while {hp} > 0:
    subtract 10 from {hp}
end while

# Break/continue
loop 100 times:
    if {done}:
        break
    end if
    if {skip}:
        continue
    end if
end loop
```

## 8. Functions
```
# Basic
function greet(name):
    reply "Hello %{name}%"
end function

# Return value
function add(a, b):
    return {a} + {b}
end function

# Default parameters
function createItem(name, type = "common"):
    return object("name": {name}, "type": {type})
end function

# Lambda
set {square} to lambda(x): return {x} * {x}

# Async
async function fetchData(url):
    http get {url}
    return {last-response}
end function
```

## 9. Templates (Structs/Classes)
```
template Player:
    name: text
    hp: number = 100
    maxHp: number = 100
    level: number = 1
end template

set {p} to new Player
set {p}'s name to "Hero"
reply "%{p}'s hp%/%{p}'s maxHp%"

# Method-like
function Player.takeDamage(dmg):
    subtract {dmg} from {this}'s hp
end function
```

## 10. Events
```
# Chat events
on chat message:
on character message:
on user message:

# UI events
on button click "id":
on panel open "id":

# Custom events
on event "name" with {data}:

# Timer events
every 5 seconds:
after 10 seconds:

# Lifecycle
on mod load:
on mod unload:
```

## 11. Import System
```
# Import from standard library
import "stdlib/math"
import "stdlib/random" as "rng"

# Import specific functions
import "stdlib/string" functions "split", "join"

# Import from other mods
import "author/mod-name"

# Import from URL
import "https://raw.githubusercontent.com/..."

# Local imports (multi-file mods)
import "./helpers.jsk"
import "./ui/components.jsk"

# Version pinning
import "author/mod-name" version ">=1.0.0"

# Usage after import
set {result} to math.clamp({val}, 0, 100)
```

## 12. Standard Library Modules
- `stdlib/math` - Math functions (clamp, lerp, random, etc.)
- `stdlib/string` - String manipulation (split, join, replace, etc.)
- `stdlib/list` - List operations (map, filter, sort, etc.)
- `stdlib/object` - Object operations (merge, keys, values, etc.)
- `stdlib/random` - Random generation
- `stdlib/time` - Timers, delays, formatting
- `stdlib/color` - Color manipulation
- `stdlib/json` - JSON parsing/serialization
- `stdlib/event` - Event creation and management

## 13. Advanced Features
- **WebSocket**: Real-time connections
- **File I/O**: Sandboxed storage read/write
- **Sound**: Audio playback
- **Canvas/Drawing**: Simple graphics
- **State Machine**: Built-in state management
- **Serialization**: Save/load game state
- **Debugging**: breakpoint, debug, assert, log, inspect
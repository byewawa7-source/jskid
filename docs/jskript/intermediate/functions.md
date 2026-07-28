# jSkript Intermediate: Functions

> Organize your code with reusable functions.

---

## Defining Functions

Use `function` and `end function`:

```jskript
function greet(name):
  return "Hello, " + name
end function

reply greet("Alice")  # "Hello, Alice"
```

---

## Parameters

Functions can accept multiple parameters:

```jskript
function add(a, b):
  return a + b
end function

set sum to add(3, 5)  # 8
```

---

## Return Values

Use `return` to send a value back:

```jskript
function getGreeting(name, timeOfDay):
  if timeOfDay is "morning":
    return "Good morning, " + name
  else:
    return "Hello, " + name
  end if
end function
```

If you don't use `return`, the function returns `null`.

---

## Default Parameters

Provide default values for optional parameters:

```jskript
function greet(name, greeting="Hello"):
  return greeting + ", " + name
end function

greet("Alice")           # "Hello, Alice"
greet("Bob", "Hi")       # "Hi, Bob"
```

---

## Variable Arguments

Accept any number of arguments:

```jskript
function sumAll(*args):
  set total to 0
  for each n in args:
    set total to total + n
  end for
  return total
end function

sumAll(1, 2, 3)        # 6
sumAll(10, 20, 30, 40) # 100
```

---

## Scope

Variables inside a function are local to that function:

```jskript
set x to 10

function double():
  set x to x * 2      # Creates a NEW local x
  return x
end function

double()  # returns 20
log x     # still 10 (global x unchanged)
```

To modify a global variable, use the `global` keyword:

```jskript
set x to 10

function double():
  global x
  set x to x * 2
end function

double()
log x  # 20
```

---

## Closures

Functions can "remember" variables from their parent scope:

```jskript
function makeCounter():
  set count to 0
  function increment():
    global count
    set count to count + 1
    return count
  end function
  return increment
end function

set counter to makeCounter()
counter()  # 1
counter()  # 2
counter()  # 3
```

This is powerful for creating stateful mods.

---

## Callbacks

Pass functions as arguments:

```jskript
function process(text, handler):
  set words to split text by " "
  for each word in words:
    handler(word)
  end for
end function

function logWord(word):
  log "Word: " + word
end function

process("hello world", logWord)
```

---

## Method Syntax

Call functions on objects:

```jskript
set user to {
  name: "Alice",
  greet: function(greeting="Hello"):
    return greeting + ", " + this.name
  end function
}

user.greet()           # "Hello, Alice"
user.greet("Hi")       # "Hi, Alice"
```

---

## Recursion

Functions can call themselves:

```jskript
function factorial(n):
  if n <= 1:
    return 1
  end if
  return n * factorial(n - 1)
end function

factorial(5)  # 120
```

Be careful with recursion — deep recursion can hit stack limits.

---

## Real-World Example

```jskript
# Mod: Command Parser
set commands to {}

function registerCommand(name, handler):
  set commands[name] to handler
end function

function handleCommand(input):
  set parts to split input by " "
  set cmd to parts[0]
  if commands has cmd:
    return commands[cmd](parts)
  else:
    return "Unknown command: " + cmd
  end if
end function

# Register commands
registerCommand("!ping", function(args):
  return "Pong!"
end function)

registerCommand("!echo", function(args):
  return join args with " "
end function)

# Parse user input
on chat message received:
  if message starts with "!":
    reply handleCommand(message)
  end if
end on
```

---

## Next Steps

- [Modules](advanced/modules.md) — split code across files
- [Error Handling](advanced/error-handling.md) — handle failures gracefully
- [Async](advanced/async.md) — non-blocking operations
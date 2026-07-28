# jSkript Engine Architecture

## 1. Pipeline
```
Source Code → Lexer → Tokens → Parser → AST → Compiler → Bytecode → Runtime → Output
```

## 2. Lexer
- File: `src/jskript/lexer/lexer.js`
- Tokenizes source code into tokens
- Handles strings, numbers, variables, keywords, operators, indentation

### Token Types
```
KEYWORD: set, to, if, else, end, loop, function, return, etc.
IDENTIFIER: variable names, function names
STRING: "quoted text"
NUMBER: 42, 3.14
VARIABLE: {varName}
OPERATOR: +, -, *, /, =, !=, >, <, >=, <=
SYMBOL: (, ), :, ", ', .
INDENT: indentation level (space-based)
NEWLINE: line break
COMMENT: # ... or // ...
EOF: end of file
```

### Grammar Keywords
```
set, to, add, subtract, multiply, divide, by, from
if, else, end, then, switch, case, default
loop, times, from, to, through, while, break, continue
function, return, lambda, async, template, new
reply, send, show, hide, trigger, on, every, after
import, as, version, functions
true, false, null, and, or, not
append, prepend, replace, trim, split, join, in
exists, type, of, clone, delete, clear
map, filter, sort, reverse, shuffle, includes
stop, play, set, get, read, write, list, matching
debug, assert, log, inspect, breakpoint
```

## 3. Parser
- File: `src/jskript/parser/parser.js`
- Builds AST from token stream
- Handles indentation-based block structure
- Validates syntax

### AST Node Types
```
Program: root node with statement list
VariableDeclaration: set {x} to value
IfStatement: if/else if/else blocks
SwitchStatement: switch/case blocks
LoopStatement: loop blocks (fixed, range, list, while)
FunctionDeclaration: function definition
LambdaExpression: anonymous function
TemplateDeclaration: struct definition
NewExpression: template instantiation
EventBlock: event handler
ImportStatement: import
BinaryExpression: a + b, a > b
UnaryExpression: not a, -a
CallExpression: functionName(args)
MemberAccess: {obj}'s property
IndexAccess: {list}[index]
SliceExpression: {list}[1 to 3]
ReturnStatement: return value
BreakStatement: break
ContinueStatement: continue
Literal: string, number, boolean, null
VariableRef: {varName}
ListLiteral: list(...)
ObjectLiteral: object("k": v)
```

## 4. Compiler
- File: `src/jskript/compiler/compiler.js`
- Optimizes AST into executable bytecode
- Inlines constants where possible
- Resolves variable scopes

### Compilation Steps
1. Scope analysis (global vs function-local)
2. Constant folding (2 + 2 → 4)
3. Variable resolution
4. Bytecode generation
5. Permission check injection

## 5. Bytecode Format
```javascript
// Simple instruction set
[
  { op: "PUSH", value: "hello" },
  { op: "SET_VAR", name: "msg" },
  { op: "GET_VAR", name: "msg" },
  { op: "CALL_FUNC", name: "reply", args: 1 },
  { op: "JUMP_IF_FALSE", target: 42 },
  { op: "JUMP", target: 10 },
  { op: "RETURN", value: null },
  { op: "HALT" }
]
```

### Opcodes
```
PUSH        - Push literal onto stack
POP         - Remove top of stack
SET_VAR     - Set variable
GET_VAR     - Get variable value
ADD         - Binary operations
SUB
MUL
DIV
POW
EQ          - Equal
NEQ         - Not equal
GT          - Greater than
LT          - Less than
GTE         - Greater or equal
LTE         - Less or equal
NOT         - Boolean not
AND         - Boolean and
OR          - Boolean or
JUMP        - Unconditional jump
JUMP_IF_FALSE - Conditional jump
CALL_FUNC   - Call function
CALL_NATIVE - Call native/JS function
RETURN      - Return from function
MAKE_LIST   - Create list
MAKE_OBJECT - Create object
INDEX_GET   - Get index/key
INDEX_SET   - Set index/key
MEMBER_GET  - Get property ({obj}'s prop)
MEMBER_SET  - Set property
NEW_TEMPLATE - Create template instance
IMPORT_MOD  - Import module
HALT        - Stop execution
```

## 6. Runtime
- File: `src/jskript/runtime/runtime.js`
- Executes bytecode
- Manages call stack and scope chains
- Handles permissions

### Execution Context
```
{
  variables: Map<string, any>,
  parent: Context | null,
  permissions: Set<string>,
  modId: string,
  storage: ModStorage
}
```

### Sandbox
- All native function calls go through permission check
- Blocked operations throw PermissionError
- Runtime measures execution time (anti-freeze)
- Max execution steps limit (100,000 per event)
- Recursion depth limit (100)
- Memory limit per mod (50MB)

## 7. Standard Library
- File: `src/jskript/stdlib/`
- Implemented in JavaScript
- Exposed to jSkript via `stdlib/` namespace

### Modules
```
stdlib/math
  - clamp(value, min, max)
  - lerp(a, b, t)
  - random(min, max)
  - randomFloat(min, max)
  - floor, ceil, round, abs, sqrt
  - min, max
  - sin, cos, tan (radians)
  - degToRad, radToDeg
  - distance(x1, y1, x2, y2)
  - mapRange(value, inMin, inMax, outMin, outMax)

stdlib/string
  - length(str)
  - upper(str), lower(str)
  - trim(str)
  - split(str, delimiter)
  - join(list, delimiter)
  - replace(str, find, replace)
  - startsWith(str, prefix)
  - endsWith(str, suffix)
  - contains(str, substr)
  - substring(str, start, end)
  - padLeft(str, length, char)
  - padRight(str, length, char)
  - reverse(str)
  - format(template, ...args)

stdlib/list
  - length(list)
  - first(list), last(list)
  - get(list, index)
  - set(list, index, value)
  - add(list, item)
  - remove(list, item)
  - removeIndex(list, index)
  - clear(list)
  - contains(list, item)
  - indexOf(list, item)
  - map(list, lambda)
  - filter(list, lambda)
  - sort(list, ascending?)
  - reverse(list)
  - shuffle(list)
  - slice(list, start, end)
  - flatten(list)

stdlib/object
  - keys(obj)
  - values(obj)
  - entries(obj)
  - hasKey(obj, key)
  - get(obj, key, default?)
  - set(obj, key, value)
  - remove(obj, key)
  - merge(obj1, obj2)
  - clone(obj)
  - size(obj)
  - isEmpty(obj)

stdlib/random
  - int(min, max)
  - float(min, max)
  - boolean()
  - element(list)
  - elements(list, count) - pick multiple
  - shuffle(list)
  - chance(percentage) - 0-100
  - seed(value) - set seed for reproducibility
  - guid() - generate UUID
  - string(length) - random alphanumeric

stdlib/time
  - now() - current timestamp
  - format(timestamp, format) - format date
  - wait(milliseconds) - async delay
  - measure() - performance measurement
  - since(timestamp) - ms since timestamp
  - parse(str) - parse date string
  - diff(t1, t2, unit) - difference between dates

stdlib/color
  - rgb(r, g, b)
  - rgba(r, g, b, a)
  - hex("#FF0000")
  - hsl(h, s, l)
  - parse(str) - parse color string
  - toHex(color)
  - toRgb(color)
  - blend(color1, color2, ratio)
  - darken(color, amount)
  - lighten(color, amount)
  - random()
  - gradient(from, to, steps)

stdlib/json
  - parse(string)
  - stringify(value, pretty?)
  - isValid(string)
  - toTable(json) - for displaying

stdlib/event
  - create(name)
  - emit(name, data)
  - on(name, callback)
  - off(name, callback)
  - once(name, callback)
  - wait(name) - async wait for event
```

## 8. Addon API (JavaScript)
- File: `src/jskript/addons/api.js`
- Allows JavaScript developers to extend jSkript

```javascript
// Register a new native function
jSkript.registerFunction("myModule.myFunction", {
  name: "my function",
  description: "Does something cool",
  args: [
    { name: "input", type: "text" }
  ],
  returns: "text",
  execute(input) {
    return `Processed: ${input}`;
  }
});

// Register a custom event
jSkript.registerEvent("myCustomEvent", {
  name: "my custom event",
  description: "Fires when something happens",
  trigger() {
    // Call this when you want the event to fire
    this.fire({ someData: "value" });
  }
});

// Register a standard library module
jSkript.registerModule("stdlib/custom", {
  help(text) {
    showNotification(text);
  },
  warn(text) {
    showAlert(text);
  }
});
```

## 9. Debugging & Developer Tools
```
Built-in jSkid Debug Console:
- Real-time variable inspection
- Step-through execution
- Breakpoint management
- Error stack traces (with line numbers)
- Performance profiling
- Mod state viewer
- Permission usage monitor
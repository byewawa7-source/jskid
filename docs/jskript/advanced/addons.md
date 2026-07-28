# jSkript Advanced: Addons & Hooks

> Extend jSkript itself with custom modules, hooks, and integrations.

---

## What are Addons?

Addons are plugins that hook into jSkript's internals. They let you:

- Add new built-in functions (e.g., `http`, `websocket`)
- Modify how the compiler works
- Add new event types
- Integrate with external APIs

---

## Addon Structure

An addon is a JavaScript file that exports a function:

```javascript
// my-addon.js
export default function(api) {
  // Register new functions
  api.registerFunction("greet", {
    type: "function",
    args: ["name"],
    returns: "string",
    execute(ctx, args) {
      return "Hello, " + args.name;
    }
  });
  
  // Register new events
  api.registerEvent("my-custom-event", {
    description: "Fires when something happens",
    data: { /* schema */ }
  });
}
```

---

## The Addon API

The `api` object passed to your addon provides:

| Method | Purpose |
|---|---|
| `api.registerFunction(name, def)` | Add a new function |
| `api.registerEvent(name, def)` | Add a new event |
| `api.registerOperator(name, precedence, fn)` | Add an operator |
| `api.hook(hookName, callback)` | Listen for compiler/runtime hooks |
| `api.addImport(path, module)` | Allow `include` for a path |

---

## Hook System

Hooks let you intercept compilation and execution:

```javascript
export default function(api) {
  // Runs after every line is compiled
  api.hook("compile:after", (node, context) => {
    // Inject logging
    if (node.type === "FunctionCall" && node.name === "sendMessage") {
      context.emit('log "[SEND] " + node.args[0]');
    }
  });
  
  // Runs before a mod script starts
  api.hook("runtime:before", (mod) => {
    console.log("Loading mod: " + mod.name);
  });
}
```

Available hooks:
- `compile:before` — before AST is compiled
- `compile:after` — after each node is compiled
- `runtime:before` — before mod script executes
- `runtime:after` — after mod script finishes
- `event:emit` — before an event is dispatched
- `event:listened` — after an event handler runs

---

## Adding Built-in Functions

Create functions that look like native jSkript:

```javascript
export default function(api) {
  api.registerFunction("rgb", {
    type: "function",
    args: ["r", "g", "b"],
    returns: "string",
    execute(ctx, args) {
      const r = Math.round(args.r);
      const g = Math.round(args.g);
      const b = Math.round(args.b);
      return `rgb(${r}, ${g}, ${b})`;
    }
  });
}
```

Now jSkript code can call:

```jskript
set color to rgb(255, 128, 0)
```

---

## Creating Custom Events

```javascript
export default function(api) {
  api.registerEvent("notification shown", {
    description: "Fires when a browser notification appears",
    data: {
      title: "string",
      body: "string",
      icon: "string?"
    }
  });
}
```

To fire the event:

```javascript
api.emit("notification shown", {
  title: "Hello",
  body: "World",
  icon: null
});
```

---

## External Integrations

Addons can wrap external APIs:

```javascript
export default function(api) {
  api.registerFunction("openweathermap", {
    type: "function",
    args: ["city"],
    returns: "object",
    async execute(ctx, args) {
      const apiKey = ctx.settings.get("openweathermap_key");
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${args.city}&appid=${apiKey}`;
      const response = await fetch(url);
      return await response.json();
    }
  });
}
```

---

## Loading Addons

Addons are loaded from `.github/scripts/addons/` in the repo:

```
.github/scripts/addons/
├── http.js         # HTTP functions
├── websocket.js    # WebSocket support
├── storage.js      # Storage helpers
└── my-addon.js     # Your custom addon
```

Configure which addons load in `manifest.json`:

```json
{
  "addons": ["http", "websocket", "storage"]
}
```

---

## Addon Best Practices

1. **Namespace your functions** — `mymod_doThing()` not just `doThing()`
2. **Document everything** — add JSDoc to every function
3. **Fail gracefully** — network errors shouldn't crash jSkript
4. **Respect permissions** — check for `http:*` before making requests
5. **Clean up** — remove listeners/timers on mod disable

---

## Real-World Example: HTTP Addon

```javascript
export default function(api) {
  api.registerFunction("httplib_get", {
    type: "function",
    args: ["url", "options?"],
    returns: "object",
    async execute(ctx, args) {
      if (!ctx.hasPermission("http:*")) {
        throw new Error("Permission denied: http:*");
      }
      
      const response = await fetch(args.url, {
        method: "GET",
        headers: args.options?.headers || {},
        body: args.options?.body
      });
      
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: await response.text()
      };
    }
  });
}
```

---

## Next Steps

- [API Reference](../API/README.md) — full API documentation
- [Performance](performance.md) — optimize your addon
# Troubleshooting

> Common issues, debug tips, and FAQ.

---

## Installation Issues

### "Script not running" / No purple bubble

1. Open the browser console (F12 → Console)
2. Look for `[jSkid]` prefixed messages
3. Check for errors like `SyntaxError`, `ReferenceError`, or 404s

**Common causes:**
- Userscript manager is disabled for janitorai.com
- Another userscript is blocking jSkid
- Browser extension conflict

**Fix:**
- Enable jSkid in your userscript manager
- Disable other mods/userscripts temporarily
- Try a private/incognito window

### Userscript won't install

Make sure you're installing the **full** `jskid.user.js` file, not just a partial snippet. The file should be several KB in size.

---

## Runtime Issues

### Console shows: `window.jskidStoreUI is undefined`

This means the store UI hasn't loaded yet. Usually fixed by:
- Refreshing the page
- Waiting a few seconds for all modules to load

### Console shows: `window.jskidTweaksManager is undefined`

Same as above — the engine hasn't fully initialized. Refresh the page.

### Mods don't run

1. Check the mod is enabled in the jMods tab
2. Check the mod has required permissions in its `manifest.json`
3. Open Console tab in jSkid dashboard — look for red error messages
4. Make sure the mod's `main.jsk` has valid jSkript syntax

### Store shows "404" or "Store unavailable"

The GitHub store repo is unreachable. Causes:
- No internet connection
- GitHub raw content is blocked (some networks/countries)
- Store repo is private or deleted

**Fix:**
- Check your connection
- If the store is blocked, you can still install mods manually via URL

### Auto-reply mod creates infinite loops

If your mod replies to its own messages, you'll get a loop. Fix:

```jskript
on chat message received:
  if sender is "Me":
    return  # Don't reply to myself
  end if
  if message contains "hello":
    reply "Hi!"
  end if
end on
```

---

## jSkript Errors

### "Unexpected token" / Syntax error

Check:
- All `if` statements have `end if`
- All `on` blocks have `end on`
- Strings use straight quotes `"`, not curly quotes `""`
- Colons `:` after event names and condition headers

### Variable not found

jSkript is statically scoped. Variables declared inside an event handler only exist inside that handler.

```jskript
# WRONG — x doesn't exist outside the event
on chat message received:
  set x to 10
end on
log x  # ERROR

# RIGHT — declare outside
set x to 10
on chat message received:
  set x to x + 1
end on
log x  # works
```

### "Permission denied"

Your mod tried to do something it didn't declare in `manifest.json`. Add the permission:

```json
{
  "permissions": ["write:chat"]
}
```

---

## Debug Tips

### Enable verbose logging

In the jSkid Console, run:

```jskript
log "Debug mode on"
```

This prints all events and errors with timestamps.

### Inspect a mod's state

```jskript
log mods.my-mod.status
log mods.my-mod.config
```

### Test jSkript without saving

Use the Console tab to test snippets before saving them as a mod.

### Watch event bus

```jskript
on any event:
  log event.name + ": " + event.data
end on
```

---

## Browser-Specific Issues

### Chrome
- Make sure Tampermonkey has "Allow access to file URLs" disabled (it breaks things)
- Disable other extensions that inject scripts

### Firefox
- Violentmonkey works best; Greasemonkey has limited API support
- Enable `javascript.options.wasm` in `about:config` for jSkript

### Edge
- Same as Chrome (Tampermonkey works)

---

## Still Stuck?

1. Search existing issues: https://github.com/byewawa7-source/jskid/issues
2. Open a new issue with:
   - Browser + version
   - Userscript manager + version
   - Console output (F12 → Console)
   - Steps to reproduce
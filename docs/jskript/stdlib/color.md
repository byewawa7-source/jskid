# Standard Library: `stdlib/color`

The `stdlib/color` module provides utility functions for generating and converting color values into CSS-compatible strings. These colors can be used in UI components, styled chat messages, HUD overlays, and any other jSkid UI element that accepts color values.

## Importing

```jskript
import "stdlib/color"
```

Or with an alias:

```jskript
import "stdlib/color" as "color"
```

---

## Color Formats in jSkid

jSkid UI components accept CSS color strings wherever a color value is expected. The functions in this module all return strings in the appropriate CSS format:

| Format   | Example Output              | Description                              |
|----------|-----------------------------|------------------------------------------|
| RGB      | `"rgb(255, 128, 0)"`        | Red, Green, Blue channels (0–255 each)   |
| RGBA     | `"rgba(255, 128, 0, 0.5)"`  | RGB + alpha transparency (0.0–1.0)       |
| Hex      | `"#ff8000"`                 | 3 or 6 digit hexadecimal notation        |
| HSL      | `"hsl(30, 100%, 50%)"`      | Hue (0–360), Saturation (%), Lightness (%)|
| Random   | `"#a3f721"`                 | Random hex color                         |

---

## Function Reference

### `rgb(r, g, b)`

Creates a CSS `rgb()` color string from three channel values.

| Parameter | Type     | Description                             |
|-----------|----------|-----------------------------------------|
| `r`       | `number` | Red channel intensity, `0`–`255`        |
| `g`       | `number` | Green channel intensity, `0`–`255`      |
| `b`       | `number` | Blue channel intensity, `0`–`255`       |

**Returns:** `text` — a CSS color string like `"rgb(255, 128, 0)"`.

**Notes:**
- Values are clamped to the `[0, 255]` range automatically.
- Decimal values are truncated to the nearest integer.

**Example:**

```jskript
import "stdlib/color"

set {orange} to stdlib/color.rgb(255, 140, 0)
ui.setBackgroundColor({orange})
reply "Background set to {orange}"
# Output: Background set to rgb(255, 140, 0)
```

---

### `rgba(r, g, b, a)`

Creates a CSS `rgba()` color string with an alpha (transparency) channel.

| Parameter | Type     | Description                                            |
|-----------|----------|--------------------------------------------------------|
| `r`       | `number` | Red channel, `0`–`255`                                 |
| `g`       | `number` | Green channel, `0`–`255`                               |
| `b`       | `number` | Blue channel, `0`–`255`                                |
| `a`       | `number` | Alpha, `0.0` (fully transparent) to `1.0` (fully opaque)|

**Returns:** `text` — a CSS color string like `"rgba(0, 0, 0, 0.5)"`.

**Notes:** The alpha channel is expressed as a decimal between `0.0` and `1.0`, not as an integer 0–255.

**Example:**

```jskript
import "stdlib/color"

# Semi-transparent dark overlay
set {overlay} to stdlib/color.rgba(0, 0, 0, 0.6)
ui.addPanel({
    "id": "darken_overlay",
    "background": {overlay}
})
```

**Example — Color-coded message with opacity:**

```jskript
import "stdlib/color"

set {danger} to stdlib/color.rgba(220, 38, 38, 0.85)
ui.showBanner("⚠️ Zone entering critical state!", {danger})
```

---

### `hex(hexStr)`

Parses and validates a hexadecimal color string, returning it in normalized form.

| Parameter | Type   | Description                                                     |
|-----------|--------|-----------------------------------------------------------------|
| `hexStr`  | `text` | A color string in 3-digit (`#abc`) or 6-digit (`#aabbcc`) format|

**Returns:** `text` — the normalized hex string (always lowercase, always prefixed with `#`). Returns `"#000000"` if the input is invalid.

**Notes:**
- The `#` prefix is optional in the input.
- 3-digit shorthand (e.g., `"f0a"`) is expanded to 6-digit form (`"#ff00aa"`).
- Alpha channels (8-digit hex) are not supported by this function — use `rgba()` instead.

**Example:**

```jskript
import "stdlib/color"

set {brandColor} to stdlib/color.hex("#1E90FF")
ui.setText("title", "Hello!", {brandColor})

# Shorthand form
set {red} to stdlib/color.hex("f00")
reply "Normalized: {red}"
# Output: Normalized: #ff0000
```

---

### `hsl(h, s, l)`

Creates a CSS `hsl()` color string from hue, saturation, and lightness values.

| Parameter | Type     | Description                                              |
|-----------|----------|----------------------------------------------------------|
| `h`       | `number` | Hue angle in degrees, `0`–`360`. Wraps around (e.g., 390 → 30)|
| `s`       | `number` | Saturation percentage, `0`–`100`                         |
| `l`       | `number` | Lightness percentage, `0`–`100`                          |

**Returns:** `text` — a CSS color string like `"hsl(210, 100%, 56%)"`.

**Notes:**
- HSL is particularly useful for programmatically creating color themes, as you can shift the hue while keeping saturation and lightness constant.
- `l=0` is black, `l=100` is white, `l=50` with `s=100` gives fully saturated colors.

**Example:**

```jskript
import "stdlib/color"

# Create a gradient of colors by rotating hue
set {i} to 0
while {i} < 360:
    set {c} to stdlib/color.hsl({i}, 80, 55)
    ui.addColorSwatch({c})
    add 30 to {i}
```

**Example — Player rank colors using hue:**

```jskript
import "stdlib/color"

function getRankColor(rank):
    if {rank} == "bronze":
        return stdlib/color.hsl(30, 60, 45)
    else if {rank} == "silver":
        return stdlib/color.hsl(0, 0, 70)
    else if {rank} == "gold":
        return stdlib/color.hsl(45, 100, 50)
    else if {rank} == "diamond":
        return stdlib/color.hsl(200, 100, 70)
    return stdlib/color.hsl(0, 0, 50)

set {col} to getRankColor(player.getRank())
ui.setNameplateColor(player.id(), {col})
```

---

### `random()`

Generates a random hex color string.

**Returns:** `text` — a randomly generated 6-digit hex color string, e.g., `"#a3f721"`.

**Notes:** Each call produces a new color. The output is fully random and not seeded — if you need reproducibility, consider `hsl()` with a seeded hue value instead.

**Example:**

```jskript
import "stdlib/color"

set {bgColor} to stdlib/color.random()
ui.setBackgroundColor({bgColor})
reply "Background set to: {bgColor}"
```

**Example — Colorful player name tags:**

```jskript
import "stdlib/color"
import "stdlib/object"

set {playerColors} to {}

on playerJoin:
    set {id} to player.id()
    if not stdlib/object.hasKey({playerColors}, {id}):
        set {col} to stdlib/color.random()
        set {playerColors} to stdlib/object.set({playerColors}, {id}, {col})
    ui.setNameplateColor({id}, stdlib/object.get({playerColors}, {id}))
```

---

## Complete Practical Examples

### Color-Coded Health Bar

```jskript
import "stdlib/color"

function getHealthColor(hp, maxHp):
    set {pct} to ({hp} / {maxHp}) * 100

    if {pct} > 60:
        # Healthy green
        return stdlib/color.hsl(120, 70, 45)
    else if {pct} > 30:
        # Warning orange
        return stdlib/color.hsl(40, 100, 50)
    else:
        # Danger red
        return stdlib/color.hsl(0, 85, 45)

on playerStatChange("hp"):
    set {color} to getHealthColor(player.hp(), player.maxHp())
    ui.setProgressBarColor("health_bar", {color})
    ui.setProgressBarValue("health_bar", player.hp() / player.maxHp())
```

---

### Rarity-Based Color System

```jskript
import "stdlib/color"

set {rarityColors} to {
    "common":    "#9e9e9e",
    "uncommon":  "#4caf50",
    "rare":      "#2196f3",
    "epic":      "#9c27b0",
    "legendary": "#ff9800"
}

function getItemColor(rarity):
    if stdlib/object.hasKey({rarityColors}, {rarity}):
        return stdlib/color.hex(stdlib/object.get({rarityColors}, {rarity}))
    return stdlib/color.hex("#ffffff")

function showItemTooltip(item):
    set {rarity} to stdlib/object.get({item}, "rarity")
    set {col} to getItemColor({rarity})
    set {name} to stdlib/object.get({item}, "name")
    ui.showTooltip({name}, {col})
```

---

### Dynamic Gradient Background

```jskript
import "stdlib/color"
import "stdlib/time"

async function animateBackground():
    set {hue} to 0
    while true:
        set {c1} to stdlib/color.hsl({hue}, 75, 35)
        set {c2} to stdlib/color.hsl(({hue} + 60) % 360, 75, 55)
        ui.setGradient("main_bg", {c1}, {c2})
        add 1 to {hue}
        if {hue} >= 360:
            set {hue} to 0
        await stdlib/time.wait(50)

call animateBackground()
```

---

## See Also

- [`stdlib/random`](./random.md) — For seeded or weighted random generation patterns
- [`stdlib/time`](./time.md) — For animating colors over time using `wait()`
- [jSkid UI API](../../api/ui.md) — For applying colors to UI components

# jSkript Example: Chat RPG

> A complete, working RPG mod with stats, inventory, and combat.

---

## What This Mod Does

- Players have HP, ATK, DEF, and gold
- Enemies spawn randomly in chat
- Players can `!attack`, `!heal`, and `!shop`
- Inventory system with items
- Level progression

---

## File Structure

```
rpg-mod/
├── manifest.json
├── main.jsk
├── state.jsk
├── combat.jsk
├── shop.jsk
└── utils.jsk
```

---

## manifest.json

```json
{
  "id": "chat-rpg",
  "name": "Chat RPG",
  "version": "1.0.0",
  "author": "Alice",
  "description": "RPG with combat, items, and shops in chat",
  "type": "chat",
  "permissions": ["read:chat", "write:chat", "read:storage", "write:storage"],
  "tags": ["game", "rpg", "fun"]
}
```

---

## main.jsk

```jskript
include "state.jsk"
include "utils.jsk"
include "combat.jsk"
include "shop.jsk"

on page loaded:
  log "Chat RPG loaded! Type !help for commands."
end on

on chat message received:
  if isMe:
    return
  end if
  if message starts with "!":
    handleCommand(message)
  end if
end on
```

---

## state.jsk

```jskript
set db to {
  players: {},
  enemies: {},
  items: {
    "potion": { name: "Health Potion", cost: 10, effect: "heal", value: 20 },
    "sword": { name: "Iron Sword", cost: 50, effect: "atk", value: 5 },
    "shield": { name: "Wooden Shield", cost: 40, effect: "def", value: 3 }
  }
}

function getPlayer(id):
  if db.players has id is not true:
    set db.players[id] to {
      id: id,
      name: id,
      hp: 100,
      maxHp: 100,
      atk: 10,
      def: 5,
      gold: 50,
      level: 1,
      xp: 0,
      inventory: [],
      inCombat: false
    }
  end if
  return db.players[id]
end function

function savePlayer(player):
  db.players[player.id] = player
end function
```

---

## combat.jsk

```jskript
function spawnEnemy():
  set templates to [
    { name: "Slime", hp: 20, atk: 3, def: 1, xp: 10, gold: 5 },
    { name: "Goblin", hp: 40, atk: 6, def: 2, xp: 25, gold: 15 },
    { name: "Wolf", hp: 60, atk: 10, def: 4, xp: 50, gold: 30 }
  ]
  set template = randomChoice(templates)
  set id = "enemy_" + currentTime()
  set db.enemies[id] = {
    id: id,
    name: template.name,
    hp: template.hp,
    maxHp: template.hp,
    atk: template.atk,
    def: template.def,
    xp: template.xp,
    gold: template.gold
  }
  reply "🐉 A wild " + template.name + " appeared! HP: " + template.hp
end function

function attackEnemy(player, enemyId):
  if db.enemies has enemyId is not true:
    reply "Enemy not found."
    return
  end if
  set enemy = db.enemies[enemyId]
  set dmg = max(1, player.atk - enemy.def)
  set enemy.hp = enemy.hp - dmg
  reply "⚔️ You hit " + enemy.name + " for " + dmg + " damage!"
  
  if enemy.hp <= 0:
    reply "🎉 " + enemy.name + " defeated! +" + enemy.xp + " XP, +" + enemy.gold + " gold"
    player.xp = player.xp + enemy.xp
    player.gold = player.gold + enemy.gold
    player.inCombat = false
    remove db.enemies[enemyId]
    checkLevelUp(player)
  else:
    # Enemy counterattacks
    set enemyDmg = max(1, enemy.atk - player.def)
    set player.hp = player.hp - enemyDmg
    reply "💥 " + enemy.name + " hits you for " + enemyDmg + " damage!"
    
    if player.hp <= 0:
      player.hp = player.maxHp
      player.gold = max(0, player.gold - 10)
      player.inCombat = false
      reply "💀 You died! Lost 10 gold. HP restored."
    end if
  end if
  savePlayer(player)
end function
```

---

## shop.jsk

```jskript
function buyItem(player, itemId):
  if db.items has itemId is not true:
    reply "Item not found."
    return
  end if
  set item = db.items[itemId]
  if player.gold < item.cost:
    reply "Not enough gold! You need " + item.cost + "."
    return
  end if
  
  set player.gold = player.gold - item.cost
  add itemId to player.inventory
  savePlayer(player)
  reply "🛒 Bought " + item.name + "! (" + item.cost + " gold)"
end function

function useItem(player, itemId):
  if player.inventory has itemId is not true:
    reply "You don't have that item."
    return
  end if
  set item = db.items[itemId]
  
  if item.effect is "heal":
    set player.hp = min(player.maxHp, player.hp + item.value)
    reply "❤️ Healed " + item.value + " HP!"
  else if item.effect is "atk":
    player.atk = player.atk + item.value
    reply "⚔️ Attack increased by " + item.value + "!"
  else if item.effect is "def":
    player.def = player.def + item.value
    reply "🛡️ Defense increased by " + item.value + "!"
  end if
  
  remove itemId from player.inventory
  savePlayer(player)
end function
```

---

## utils.jsk

```jskript
function checkLevelUp(player):
  set xpNeeded = player.level * 100
  if player.xp >= xpNeeded:
    player.level = player.level + 1
    player.xp = player.xp - xpNeeded
    player.maxHp = player.maxHp + 20
    player.hp = player.maxHp
    player.atk = player.atk + 2
    player.def = player.def + 1
    reply "⬆️ Level up! You are now level " + player.level
  end if
end function

function handleCommand(input):
  set parts = split input by " "
  set cmd = parts[0]
  set player = getPlayer(sender)
  
  match cmd:
    when "!help":
      reply "Commands: !stats, !attack, !heal, !shop, !buy <item>, !use <item>"
    
    when "!stats":
      reply "📊 " + player.name + " | Lv." + player.level + " | HP:" + player.hp + "/" + player.maxHp + " | ATK:" + player.atk + " | DEF:" + player.def + " | 💰" + player.gold
    
    when "!attack":
      if db.enemies is empty:
        spawnEnemy()
      end if
      set enemyId = randomChoice(keys of db.enemies)
      attackEnemy(player, enemyId)
    
    when "!heal":
      if player.gold >= 5:
        set player.gold = player.gold - 5
        set player.hp = player.maxHp
        savePlayer(player)
        reply "💊 Healed for 5 gold!"
      else:
        reply "Not enough gold (need 5)."
      end if
    
    when "!shop":
      reply "🛒 Shop: potion (10g), sword (50g), shield (40g). Type !buy <item>"
    
    when "!buy":
      if length of parts < 2:
        reply "Usage: !buy <item>"
        return
      end if
      buyItem(player, parts[1])
    
    when "!use":
      if length of parts < 2:
        reply "Usage: !use <item>"
        return
      end if
      useItem(player, parts[1])
    
    else:
      if cmd starts with "!":
        reply "Unknown command. Type !help"
      end if
  end match
end function
```

---

## How It Works

1. **State** — All player/enemy data lives in a `db` object stored in memory (and optionally persisted to IndexedDB)
2. **Commands** — `handleCommand` parses `!commands` and dispatches
3. **Combat** — Turn-based: player attacks, enemy counterattacks
4. **Shop** — Buy items with gold, use them for buffs/healing
5. **Progression** — XP from kills → level up → stats increase

---

## Extending This Mod

Ideas to add:
- More enemy types with special abilities
- Equipment slots (weapon, armor)
- Party system (multiple players)
- Quests and rewards
- Leaderboards
- Persist data to IndexedDB so it survives page refreshes

---

## Notes

- All data is in-memory — refresh the page to reset
- Combat is instanced per player (everyone sees their own enemies)
- Use `read:storage` + `write:storage` permissions to persist
# jTogether — Group Chat System

## 1. Overview
jTogether enables multi-character group chats within JanitorAI. Users can create "rooms" with multiple characters that interact with each other and the user in a single conversation thread.

## 2. Architecture

```
┌─────────────────────────────────────────────┐
│              jTogether Engine                 │
├─────────────────────────────────────────────┤
│                                              │
│  Room Manager → Room State → Message Router  │
│       ↑                          ↑           │
│  Character Pool           AI Orchestrator     │
│       ↑                          ↑           │
│  JanitorAI API ─────────→ Character API      │
│                                              │
└─────────────────────────────────────────────┘
```

## 3. Room System

### Room Data Structure
```javascript
{
  id: "room-uuid",
  name: "Fantasy Tavern",
  createdBy: "User123",
  createdAt: "2026-07-26T20:00:00Z",
  characters: [
    {
      id: "char-1",
      name: "Elara",
      persona: "A wise elven mage who speaks in riddles",
      janitorId: "janitor-char-id",
      avatar: "url",
      color: "#7c3aed",     // Message color
      isActive: true,
      turnOrder: 1
    },
    {
      id: "char-2",
      name: "Thorn",
      persona: "A grumpy dwarf blacksmith with a heart of gold",
      janitorId: "janitor-char-id-2",
      avatar: "url",
      color: "#f59e0b",
      isActive: true,
      turnOrder: 2
    }
  ],
  settings: {
    turnMode: "free",         // "free" or "round-robin"
    responseLength: "medium",  // "short", "medium", "long"
    randomizeOrder: false,
    autoReply: true,
    replyDelay: 2000,         // Simulated "typing" delay
    userParticipates: true,
    maxMessagesPerTurn: 1,
    systemPrompt: "You are in a fantasy tavern. The atmosphere is cozy."
  },
  messageHistory: [
    // Array of message objects
  ]
}
```

### Message Data Structure
```javascript
{
  id: "msg-uuid",
  roomId: "room-uuid",
  type: "user" | "character" | "system",
  sender: {
    id: "char-1" | "user",
    name: "Elara" | "User123"
  },
  target: "all" | "char-2" | "user", // Who the message is directed to
  content: "Welcome to my tavern, traveler!",
  timestamp: "2026-07-26T20:05:00Z",
  metadata: {
    emotion: "happy",
    action: "bows gracefully",
    isAction: false  // *acts out a scene* vs dialogue
  }
}
```

## 4. Room Manager
```javascript
class RoomManager {
  constructor() {
    this.rooms = new Map();      // roomId → Room
    this.activeRoom = null;
    this.messageQueue = [];
    this.isProcessing = false;
  }
  
  createRoom(name, characters, settings) { }
  deleteRoom(roomId) { }
  getRoom(roomId) { }
  listRooms() { }
  
  setActiveRoom(roomId) {
    this.activeRoom = roomId;
    this.renderRoom(roomId);
  }
  
  async sendMessage(roomId, content, target = "all") {
    const room = this.rooms.get(roomId);
    const message = {
      id: generateId(),
      roomId,
      type: "user",
      sender: { id: "user", name: room.createdBy },
      target,
      content,
      timestamp: new Date().toISOString()
    };
    room.messageHistory.push(message);
    this.renderMessage(message);
    await this.processCharacterResponses(room);
  }
  
  async processCharacterResponses(room) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      // Determine which characters should respond
      const lastMessage = room.messageHistory[room.messageHistory.length - 1];
      let responders;
      
      if (room.settings.turnMode === "round-robin") {
        // Next character in turn order
        responders = [this.getNextInTurn(room)];
      } else {
        // All active characters or specific target
        if (lastMessage.target === "all") {
          responders = room.characters.filter(c => c.isActive);
        } else {
          responders = room.characters.filter(c => c.id === lastMessage.target);
        }
      }
      
      // Generate responses (with simulated delay)
      for (const char of responders) {
        await this.delay(room.settings.replyDelay);
        const response = await this.generateCharacterResponse(room, char, lastMessage);
        room.messageHistory.push(response);
        this.renderMessage(response);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  async generateCharacterResponse(room, character, context) {
    // Build prompt with context
    const prompt = this.buildGroupPrompt(room, character, context);
    
    // Call JanitorAI API (or alternative)
    const response = await JanitorAPI.sendMessage(character.janitorId, prompt);
    
    return {
      id: generateId(),
      roomId: room.id,
      type: "character",
      sender: { id: character.id, name: character.name },
      target: "all",
      content: response.text,
      timestamp: new Date().toISOString(),
      metadata: {
        emotion: response.emotion || "neutral"
      }
    };
  }
  
  buildGroupPrompt(room, character, context) {
    let prompt = `You are in a group conversation.\n`;
    prompt += `Setting: ${room.settings.systemPrompt}\n\n`;
    prompt += `Characters present:\n`;
    for (const char of room.characters) {
      prompt += `- ${char.name}: ${char.persona}\n`;
    }
    prompt += `\nYour name is ${character.name}. Your persona: ${character.persona}\n\n`;
    prompt += `Recent conversation:\n`;
    const recent = room.messageHistory.slice(-10);
    for (const msg of recent) {
      prompt += `${msg.sender.name}: ${msg.content}\n`;
    }
    prompt += `\nRespond as ${character.name} would, staying true to your persona.`;
    return prompt;
  }
  
  getNextInTurn(room) {
    const lastCharMsg = [...room.messageHistory].reverse()
      .find(m => m.type === "character");
    const lastIndex = room.characters.findIndex(c => c.id === lastCharMsg?.sender?.id);
    const nextIndex = (lastIndex + 1) % room.characters.length;
    return room.characters[nextIndex];
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 5. Character Pool
```javascript
class CharacterPool {
  constructor() {
    this.characters = new Map(); // characterId → CharacterData
  }
  
  async addFromJanitorAI(janitorId) {
    // Fetch character data from JanitorAI
    const data = await JanitorAPI.getCharacter(janitorId);
    this.characters.set(janitorId, {
      id: janitorId,
      name: data.name,
      avatar: data.avatar,
      description: data.description,
      greeting: data.greeting,
      definition: data.definition,
      tags: data.tags
    });
    return this.characters.get(janitorId);
  }
  
  async searchCharacters(query) {
    // Search JanitorAI for characters
    return JanitorAPI.searchCharacters(query);
  }
  
  getCharacter(id) {
    return this.characters.get(id);
  }
  
  removeCharacter(id) {
    this.characters.delete(id);
  }
}
```

## 6. Message Routing
- Messages can be directed to specific characters: `@Elara: Hello!`
- Messages can be directed to all: no prefix
- System messages appear in a special style
- Character responses show with their color-coded name

## 7. UI Components

### Room Panel
```
┌─────────────────────────────────────────────┐
│  🏠 Fantasy Tavern        [⚙ Settings] [✕] │
├─────────────────────────────────────────────┤
│  Characters:                                │
│  [Elara 🟢] [Thorn 🟢] [+ Add Character]   │
├─────────────────────────────────────────────┤
│  ─── Chat ───                               │
│                                             │
│  [User] Hello everyone!                     │
│                                             │
│  🟣 Elara:                                  │
│  Welcome to my tavern, traveler! The fire   │
│  is warm and the ale is flowing. ♪          │
│                                             │
│  🟠 Thorn:                                  │
│  Hmph. Another adventurer? Fine, sit       │
│  wherever. Just don't touch my tools.      │
│                                             │
│  [User @Thorn] What kind of tools?          │
│                                             │
│  🟠 Thorn:                                  │
│  The kind that'll take your fingers off     │
│  if you're not careful! *grumbles*         │
│                                             │
├─────────────────────────────────────────────┤
│  [@Elara] [Say something...]        [Send] │
└─────────────────────────────────────────────┘
```

### Character Selector
```
┌─────────────────────────────────────────────┐
│  Add Character to Room                       │
├─────────────────────────────────────────────┤
│  [Search JanitorAI characters...]            │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Avatar   │ │ Avatar   │ │ Avatar   │    │
│  │ Elara    │ │ Thorn    │ │ Lyra     │    │
│  │ Elf Mage │ │ Dwarf    │ │ Bard     │    │
│  │ [Add]    │ │ [Add]    │ │ [Add]    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  Or paste a JanitorAI URL:                   │
│  [https://janitorai.com/characters/...]     │
│  [Import Character]                          │
└─────────────────────────────────────────────┘
```

### Room Settings
```
┌─────────────────────────────────────────────┐
│  Room Settings                                │
├─────────────────────────────────────────────┤
│  Room Name: [Fantasy Tavern]                │
│                                             │
│  Turn Mode: [Free-for-all ▼]                │
│  • Free-for-all: Everyone can respond       │
│  • Round-robin: Ordered turns               │
│                                             │
│  Response Length: [Medium ▼]                │
│                                             │
│  ⚙ Advanced Settings:                       │
│  ☑ User participates in chat                │
│  ☑ Auto-reply for characters                │
│  Reply delay: [2 seconds ▼]                 │
│  Max messages per turn: [1]                 │
│  ☑ Randomize turn order                     │
│  System Prompt: [textarea]                  │
│                                             │
│  [Save] [Cancel]                             │
└─────────────────────────────────────────────┘
```

## 8. AI Orchestrator
```javascript
class AIOrchestrator {
  constructor() {
    this.apiEndpoint = "https://api.janitorai.com/v1/chat/completions";
    this.model = "gpt-3.5-turbo"; // Default model
  }
  
  async generateResponse(character, prompt, context) {
    const messages = [
      {
        role: "system",
        content: `You are ${character.name}. ${character.persona || character.description}`
      },
      ...context.map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        name: msg.sender.name,
        content: msg.content
      })),
      {
        role: "user",
        content: prompt
      }
    ];
    
    // Call JanitorAI API
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await this.getToken()}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 250,
        temperature: 0.8
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async getToken() {
    // Get auth token from JanitorAI session
    return localStorage.getItem("janitorai_token");
  }
}
```

## 9. State Persistence
- Rooms saved to IndexedDB
- Chat history per room
- Character pool cached
- Export room as JSON (shareable)
- Import room from JSON

## 10. Features Summary
- Multiple characters in one chat
- Color-coded messages per character
- @mentions to direct messages
- Free-for-all or round-robin turn modes
- Search and add characters from JanitorAI
- Room settings (system prompt, reply delay, etc.)
- Export/import rooms
- Character persona management
- Simulated typing indicators per character
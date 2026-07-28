# JanitorAI API Integration

## 1. Authentication
- OAuth via Discord or Google against Supabase Auth
- JWT (ES256) stored in cookies: `sb-auth-auth-token.0` and `sb-auth-auth-token.1`
- Every API call sends: `Authorization: Bearer <jwt>`, `x-client-session-id: cs_<random>`, `x-app-version`
- Anonymous browsing is first-class: guest can type messages, auth modal only appears on send

## 2. Complete Endpoint Reference

### Characters
| Method | Path | Purpose |
|---|---|---|
| GET | `/hampter/characters` | Browse/search. Params: page, language, mode (all/sfw), sort (popular/latest), search, custom_tags[], following, favorites, user_id[] |
| GET | `/hampter/characters/{character_id}` | Full character definition |

### Chats & Messages
| Method | Path | Purpose |
|---|---|---|
| POST | `/hampter/chats` | Create chat - `{ character_id }` |
| GET | `/hampter/chats/{chat_id}` | Full detail: character, chat, chatMessages, personas |
| GET | `/hampter/chats/homepage?page=` | Paginated continue chatting feed |
| POST | `/hampter/chats/{chat_id}/messages` | Append message |
| PATCH | `/hampter/chats/{chat_id}/messages/{message_id}` | Edit message text (also greeting swipe) |
| DELETE | `/hampter/chats/{chat_id}/messages` | Bulk delete messages |
| GET | `/hampter/chats/character/{character_id}/persona` | Active persona/chat association |
| GET | `/hampter/chats/public/character/{character_id}` | Public chat logs |
| GET | `/hampter/chats/public/history` | Own published-chat history |

### Generation
| Method | Path | Purpose |
|---|---|---|
| POST | `/generateAlpha` | Stream AI reply (SSE). Modes: NEW, CONTINUE, ALTERNATIVE |
| POST | `/generateAlpha/cancel` | Cancel in-flight generation |

### Social
| Method | Path | Purpose |
|---|---|---|
| GET | `/hampter/favorites/character/{id}/count` | Favorite count |
| GET | `/hampter/favorites/myfavorites/{id}` | Boolean has favorited |
| GET | `/hampter/following/v2/myfollowing` | Following list |
| GET | `/hampter/profiles/{user_id}` | Public profile + CSS customization |
| GET | `/hampter/profiles/search` | Creator directory |

### Reviews
| Method | Path | Purpose |
|---|---|---|
| GET | `/hampter/reviews/{character_id}` | Reviews |
| GET | `/hampter/reviews/counts/{character_id}` | Like/dislike counts |
| GET | `/hampter/reviews/settings/{character_id}` | Comment permissions |
| GET | `/hampter/reviews/emoji-definitions` | ~620 custom emoji reactions |

### Subscriptions & Tags
| Method | Path | Purpose |
|---|---|---|
| GET | `/hampter/subscriptions/plans` | Pricing/entitlements |
| GET | `/hampter/tags` | Canonical tag list |
| GET | `/hampter/tags/exists?tagSlug=` | Custom tag slug dedupe |

### Notifications
| Method | Path | Purpose |
|---|---|---|
| GET | `/notifs/api/notifications/{user_id}` | Notification feed |
| GET | `/notifs/api/notifications/count/{user_id}` | Unread count |
| WS | `wss://janitorai.com/notifs/ws/hub` | Realtime push |

### Telemetry
| Method | Path | Purpose |
|---|---|---|
| POST | `/jstats/init` | Statsig bootstrap |
| POST | `/jstats/ingest` | Batched events |

## 3. Character Object Schema (from HAR)
```json
{
  "id": "uuid",
  "name": "Character Name",
  "chat_name": "Display name in chat",
  "avatar": "filename.webp",
  "description": "Rich HTML description",
  "personality": "Personality text",
  "scenario": "Scenario text",
  "example_dialogs": "Example dialogs",
  "first_message": "First message text",
  "first_messages": ["array of alternate first messages"],
  "custom_tags": ["tag1", "tag2"],
  "tags": [{"id": 1, "name": "Male", "slug": "male"}],
  "is_nsfw": true,
  "is_image_nsfw": false,
  "is_explicit_for_anon": false,
  "is_public": true,
  "is_deleted": false,
  "allow_proxy": true,
  "allow_published_chats": true,
  "showdefinition": false,
  "showDefinitionOverride": false,
  "creator_id": "uuid",
  "creator_name": "Username",
  "creator_verified": false,
  "creator_plusbadge": false,
  "obscenity_score": 1,
  "text_obscenity_score": 1,
  "token_counts": {
    "personality_tokens": 5887,
    "first_message_tokens": 848,
    "example_dialog_tokens": 1962,
    "scenario_tokens": 3505,
    "total_tokens": 12202
  },
  "stats": { "chat": 9397, "message": 347492 },
  "scripts": [
    { "type": "lorebook", "id": "uuid", "title": "Script Title", "theme": "red", "message_count": 270534 },
    { "type": "advanced", "id": "uuid", "title": "Advanced Script", "message_count": 281468 }
  ],
  "soundcloud_track_id": "2275621268",
  "first_published_at": "2026-06-05T21:01:30.912Z",
  "scheduled_publish_at": null,
  "silent_publish": null
}
```

## 4. Generation Pipeline
- POST to `/generateAlpha` with full chat history, character data, profile, userConfig
- Response is SSE stream with OpenAI-compatible chunks
- `generateMode`: NEW, CONTINUE, ALTERNATIVE
- `userConfig.api`: "janitor" or "api_key" (BYOK)
- Two budget dimensions: "rolling" (5h) and "weekly"
- `BudgetExhaustedError` on quota rejection
- `EntitlementMissingError` for subscription-gated features

## 5. Frontend Store Architecture
The app uses ~17 MobX-style stores accessible via `window._storeState_`:
- `user` - User profile, config, auth state
- `settings` - App settings, locale
- `Sp` - Personas
- `navigate` - Router state
- `notifications` - Notification feed
- `tags` - Tag data
- `Ss` - Chat carousel store
- `SQ` - Recent public chats store
- `Sv` - Character store (per-character data)
- `Sy` - Search state
- `Sd` - Usage budget
- `Se` - Subscription state

## 6. jSkid JanitorAPI Wrapper
```javascript
class JanitorAPI {
  constructor() {
    this.baseUrl = "https://janitorai.com";
    this.token = null;
    this.clientSessionId = null;
    this.userId = null;
  }

  init() {
    this.token = this.extractToken();
    this.userId = this.extractUserId();
    this.clientSessionId = "cs_" + crypto.randomUUID();
    this.interceptFetch();
  }

  extractToken() {
    const cookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("sb-auth-auth-token.0="));
    if (!cookie) return null;
    const base64 = cookie.split("=")[1].replace("base64-", "");
    try {
      const parsed = JSON.parse(atob(base64));
      return parsed.access_token;
    } catch { return null; }
  }

  getHeaders() {
    return {
      "Authorization": "Bearer " + this.token,
      "x-client-session-id": this.clientSessionId,
      "x-app-version": "9.1.11",
      "Content-Type": "application/json"
    };
  }

  async getCharacter(characterId) {
    const res = await fetch(this.baseUrl + "/hampter/characters/" + characterId, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async createChat(characterId) {
    const res = await fetch(this.baseUrl + "/hampter/chats", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ character_id: characterId })
    });
    return res.json();
  }

  async getChat(chatId) {
    const res = await fetch(this.baseUrl + "/hampter/chats/" + chatId, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async sendMessage(chatId, content, characterId) {
    const res = await fetch(this.baseUrl + "/hampter/chats/" + chatId + "/messages", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        is_bot: false,
        is_main: true,
        message: content,
        character_id: characterId,
        chat_id: chatId
      })
    });
    return res.json();
  }

  async editMessage(chatId, messageId, newContent) {
    const res = await fetch(
      this.baseUrl + "/hampter/chats/" + chatId + "/messages/" + messageId,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ message: newContent })
      }
    );
    return res.json();
  }

  async deleteMessages(chatId, messageIds) {
    const res = await fetch(
      this.baseUrl + "/hampter/chats/" + chatId + "/messages",
      {
        method: "DELETE",
        headers: this.getHeaders(),
        body: JSON.stringify({ message_ids: messageIds })
      }
    );
    return res.json();
  }

  async generateReply(chatData, chatMessages, profile, userConfig, mode) {
    const body = {
      chat: chatData,
      chatMessages: chatMessages,
      clientPlatform: "web",
      generateMode: mode || "NEW",
      generateType: "CHAT",
      profile: profile,
      profiles: [profile],
      forcedPromptGenerationCacheRefetch: {
        character: false, chat: false, profile: false, script: false
      },
      userConfig: userConfig
    };
    const res = await fetch(this.baseUrl + "/generateAlpha", {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "X-Request-ID": this.userId,
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(body)
    });
    return this.parseSSE(res);
  }

  async cancelGeneration() {
    await fetch(this.baseUrl + "/generateAlpha/cancel", {
      method: "POST",
      headers: this.getHeaders()
    });
  }

  parseSSE(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    return {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            const { done, value } = await reader.read();
            if (done) return { done: true };
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            const chunks = lines
              .filter(l => l.startsWith("data: "))
              .map(l => JSON.parse(l.slice(6)));
            return { done: false, value: chunks };
          }
        };
      }
    };
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    const self = this;
    window.fetch = function(...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      if (url && url.includes("/generateAlpha")) {
        window.dispatchEvent(new CustomEvent("jskid:generation", {
          detail: { url, args }
        }));
      }
      if (url && url.includes("/hampter/chats") && args[1]?.method === "POST") {
        window.dispatchEvent(new CustomEvent("jskid:message:sent", {
          detail: { url, body: args[1]?.body }
        }));
      }
      return originalFetch.apply(this, args);
    };
  }
}
```

## 7. DOM Observation for SPA
```javascript
class JanitorDOMObserver {
  constructor() {
    this.observer = null;
    this.currentPath = window.location.pathname;
  }

  start() {
    this.observer = new MutationObserver((mutations) => {
      if (window.location.pathname !== this.currentPath) {
        this.currentPath = window.location.pathname;
        this.onRouteChange(this.currentPath);
      }
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const msgEl = node.matches?.('[class*="message"]')
              ? node
              : node.querySelector?.('[class*="message"]');
            if (msgEl) {
              this.onNewMessage(msgEl);
            }
          }
        }
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  onRouteChange(path) {
    const pageType = this.detectPage(path);
    window.dispatchEvent(new CustomEvent("jskid:page:change", {
      detail: { path, pageType }
    }));
  }

  detectPage(path) {
    if (path.startsWith("/chat/")) return "chat";
    if (path.startsWith("/characters/")) return "character";
    if (path.startsWith("/create_character")) return "create-character";
    if (path.startsWith("/profile/")) return "profile";
    if (path.includes("/search")) return "search";
    return "unknown";
  }

  stop() {
    this.observer?.disconnect();
  }
}
```

## 8. Store State Access
The app serializes its full MobX state into `window._storeState_` on every SSR render. jSkid can read this to get current user, config, personas, and more without making API calls:

```javascript
function getJanitorStore() {
  try {
    return JSON.parse(document.getElementById("__NEXT_DATA__")?.textContent
      || document.querySelector("script:contains('_storeState_')")?.textContent
      || "{}");
  } catch { return {}; }
}

function getCurrentUser() {
  const state = window._storeState_;
  return state?.user?.profile || null;
}

function getPersonas() {
  const state = window._storeState_;
  return state?.Sp?.personas || [];
}

function getUserConfig() {
  const state = window._storeState_;
  return state?.user?.config || null;
}
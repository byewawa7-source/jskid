/**
 * JanitorAI API Integration Module
 * Wraps JanitorAI REST & SSE streaming endpoints, auth token resolution, and store state.
 */
(function(global) {
  "use strict";

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
      this.clientSessionId = "cs_" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
      this.interceptFetch();
    }

    extractToken() {
      if (typeof document === "undefined") return null;
      const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("sb-auth-auth-token.0="));
      if (!cookie) return null;
      const base64 = cookie.split("=")[1].replace("base64-", "");
      try {
        const parsed = JSON.parse(atob(base64));
        return parsed.access_token || null;
      } catch {
        return null;
      }
    }

    extractUserId() {
      const state = this.getStoreState();
      return state?.user?.profile?.id || null;
    }

    getStoreState() {
      if (typeof window === "undefined") return {};
      if (window._storeState_) return window._storeState_;
      try {
        const nextData = document.getElementById("__NEXT_DATA__")?.textContent;
        if (nextData) {
          const parsed = JSON.parse(nextData);
          return parsed.props?.pageProps?.initialState || {};
        }
      } catch {}
      return {};
    }

    getHeaders() {
      const headers = {
        "x-client-session-id": this.clientSessionId,
        "x-app-version": "9.1.11",
        "Content-Type": "application/json"
      };
      if (this.token) {
        headers["Authorization"] = "Bearer " + this.token;
      }
      return headers;
    }

    async getCharacter(characterId) {
      const res = await fetch(`${this.baseUrl}/hampter/characters/${characterId}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} fetching character`);
      return res.json();
    }

    async searchCharacters(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/hampter/characters?${query}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} searching characters`);
      return res.json();
    }

    async createChat(characterId) {
      const res = await fetch(`${this.baseUrl}/hampter/chats`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ character_id: characterId })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} creating chat`);
      return res.json();
    }

    async getChat(chatId) {
      const res = await fetch(`${this.baseUrl}/hampter/chats/${chatId}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} fetching chat`);
      return res.json();
    }

    async sendMessage(chatId, content, characterId) {
      const res = await fetch(`${this.baseUrl}/hampter/chats/${chatId}/messages`, {
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
      if (!res.ok) throw new Error(`HTTP error ${res.status} sending message`);
      return res.json();
    }

    async editMessage(chatId, messageId, newContent) {
      const res = await fetch(`${this.baseUrl}/hampter/chats/${chatId}/messages/${messageId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ message: newContent })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} editing message`);
      return res.json();
    }

    async deleteMessages(chatId, messageIds) {
      const res = await fetch(`${this.baseUrl}/hampter/chats/${chatId}/messages`, {
        method: "DELETE",
        headers: this.getHeaders(),
        body: JSON.stringify({ message_ids: messageIds })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status} deleting messages`);
      return res.json();
    }

    async generateReply(chatData, chatMessages, profile, userConfig, mode = "NEW") {
      const body = {
        chat: chatData,
        chatMessages: chatMessages,
        clientPlatform: "web",
        generateMode: mode,
        generateType: "CHAT",
        profile: profile,
        profiles: [profile],
        forcedPromptGenerationCacheRefetch: {
          character: false, chat: false, profile: false, script: false
        },
        userConfig: userConfig
      };
      const res = await fetch(`${this.baseUrl}/generateAlpha`, {
        method: "POST",
        headers: {
          ...this.getHeaders(),
          "X-Request-ID": this.userId || "anonymous",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify(body)
      });
      return this.parseSSE(res);
    }

    async cancelGeneration() {
      await fetch(`${this.baseUrl}/generateAlpha/cancel`, {
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
                .map(l => {
                  try { return JSON.parse(l.slice(6)); } catch { return null; }
                })
                .filter(Boolean);
              return { done: false, value: chunks };
            }
          };
        }
      };
    }

    interceptFetch() {
      if (typeof window === "undefined") return;
      const originalFetch = window.fetch;
      const self = this;
      window.fetch = function(...args) {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
        if (url && url.includes("/generateAlpha")) {
          window.dispatchEvent(new CustomEvent("jskid:generation", { detail: { url, args } }));
        }
        if (url && url.includes("/hampter/chats") && args[1]?.method === "POST") {
          window.dispatchEvent(new CustomEvent("jskid:message:sent", { detail: { url, body: args[1]?.body } }));
        }
        return originalFetch.apply(this, args);
      };
    }
  }

  global.JanitorAPI = JanitorAPI;
  if (!global.janitorAPI) {
    global.janitorAPI = new JanitorAPI();
    global.janitorAPI.init();
  }
})(typeof window !== "undefined" ? window : globalThis);

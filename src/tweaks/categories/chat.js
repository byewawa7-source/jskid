/**
 * jTweaks Chat Category Settings
 */
(function(global) {
  "use strict";

  const manager = global.jskidTweaksManager;
  if (!manager) return;

  manager.define("autoScroll", {
    category: "Chat",
    label: "Auto-scroll to Bottom",
    description: "Automatically scroll to new messages as AI replies stream in",
    type: "boolean",
    default: true
  });

  manager.define("enterToSend", {
    category: "Chat",
    label: "Enter Key Sends Message",
    description: "Press Enter to send, Shift+Enter for line break",
    type: "boolean",
    default: true
  });

  manager.define("autoSaveDrafts", {
    category: "Chat",
    label: "Auto-save Drafts",
    description: "Automatically save un-sent chat drafts across navigation",
    type: "boolean",
    default: true
  });
})(typeof window !== "undefined" ? window : globalThis);

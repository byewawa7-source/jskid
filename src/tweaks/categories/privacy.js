/**
 * jTweaks Privacy Category Settings
 */
(function(global) {
  "use strict";

  const manager = global.jskidTweaksManager;
  if (!manager) return;

  manager.define("blockTracking", {
    category: "Privacy",
    label: "Block Telemetry & Trackers",
    description: "Block outbound Statsig analytics and telemetry requests",
    type: "boolean",
    default: true
  });

  manager.define("incognito", {
    category: "Privacy",
    label: "Incognito Mode",
    description: "Do not persist recent chats or search history in local storage",
    type: "boolean",
    default: false
  });
})(typeof window !== "undefined" ? window : globalThis);

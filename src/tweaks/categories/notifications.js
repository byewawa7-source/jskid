/**
 * jTweaks Notifications Category Settings
 */
(function(global) {
  "use strict";

  const manager = global.jskidTweaksManager;
  if (!manager) return;

  manager.define("soundEnabled", {
    category: "Notifications",
    label: "Sound Effects",
    description: "Play subtle sound effects on message completion",
    type: "boolean",
    default: true
  });

  manager.define("desktopNotifications", {
    category: "Notifications",
    label: "Desktop Notifications",
    description: "Show OS notifications when AI finishes generating responses while tab is hidden",
    type: "boolean",
    default: true
  });
})(typeof window !== "undefined" ? window : globalThis);

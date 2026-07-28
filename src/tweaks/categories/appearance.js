/**
 * jTweaks Appearance Category Settings
 */
(function(global) {
  "use strict";

  const manager = global.jskidTweaksManager || (global.TweaksManager ? new global.TweaksManager() : null);
  if (!manager) return;

  manager.define("darkMode", {
    category: "Appearance",
    label: "Dark Mode",
    description: "Force dark mode theme across JanitorAI UI",
    type: "boolean",
    default: false
  });

  manager.define("compactMode", {
    category: "Appearance",
    label: "Compact Layout",
    description: "Reduce message paddings and sidebar spacing for high-density UI",
    type: "boolean",
    default: false
  });

  manager.define("fontSize", {
    category: "Appearance",
    label: "Font Size",
    description: "Set font size for conversation messages",
    type: "enum",
    options: ["small", "medium", "large"],
    default: "medium"
  });

  manager.define("customCSS", {
    category: "Appearance",
    label: "Custom CSS Overrides",
    description: "Inject custom CSS styling rules",
    type: "text",
    default: ""
  });
})(typeof window !== "undefined" ? window : globalThis);

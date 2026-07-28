/**
 * jTweaks Performance Category Settings
 */
(function(global) {
  "use strict";

  const manager = global.jskidTweaksManager;
  if (!manager) return;

  manager.define("lazyLoadImages", {
    category: "Performance",
    label: "Lazy Load Images",
    description: "Defer loading of off-screen character avatars and card banners",
    type: "boolean",
    default: true
  });

  manager.define("reduceAnimations", {
    category: "Performance",
    label: "Reduce Motion & Animations",
    description: "Disable complex CSS particle animations and UI transitions",
    type: "boolean",
    default: false
  });
})(typeof window !== "undefined" ? window : globalThis);

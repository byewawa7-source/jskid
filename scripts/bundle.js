#!/usr/bin/env node
/**
 * jSkid Bundler
 * Builds a single self-contained jskid.user.js from source files.
 *
 * Usage:
 *   node scripts/bundle.js              # Writes jskid.user.js to cwd
 *   VERSION=1.2.3 node scripts/bundle.js
 */

const fs   = require("fs");
const path = require("path");

const VERSION = process.env.VERSION || "1.0.0";
const RAW_BASE = process.env.RAW_BASE || "https://raw.githubusercontent.com/byewawa7-source/jskid/main";

// Bundler runs from repo root in CI
const SCRIPT_DIR = process.cwd();
const OUT_FILE = path.join(SCRIPT_DIR, "jskid.user.js");

const SOURCE_FILES = [
  // Libraries (must be before mods that depend on them)
  "src/libs/jszip.min.js",
  // Core
  "src/core/event-bus.js",
  "src/core/storage.js",
  "src/core/dom-injector.js",
  "src/core/error-handler.js",
  "src/core/janitor-api.js",
  // jSkript
  "src/jskript/lexer.js",
  "src/jskript/parser.js",
  "src/jskript/compiler.js",
  "src/jskript/runtime.js",
  "src/jskript/stdlib.js",
  "src/jskript/addons/api.js",
  // Mods
  "src/mods/permissions.js",
  "src/mods/manager.js",
  "src/mods/jmod-format.js",
  // Store
  "src/store/client.js",
  "src/store/installer.js",
  "src/store/github.js",
  "src/store/ui/browser.js",
  "src/store/ui/detail.js",
  "src/store/ui/upload.js",
  // Tweaks
  "src/tweaks/manager.js",
  "src/tweaks/categories/appearance.js",
  "src/tweaks/categories/chat.js",
  "src/tweaks/categories/performance.js",
  "src/tweaks/categories/privacy.js",
  "src/tweaks/categories/notifications.js",
  // Engine (must be last)
  "src/core/engine.js",
];


// ─── Helpers ───────────────────────────────────────────────────────────────

function readSrc(rel) {
  const full = path.join(SCRIPT_DIR, rel);
  if (!fs.existsSync(full)) {
    console.warn(`  [warn] missing: ${rel}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function header() {
  return `// ==UserScript==
// @name         jSkid
// @namespace    https://janitorai.com
// @version      ${VERSION}
// @description  Modding framework for JanitorAI
// @author       jSkid Team
// @match        https://janitorai.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @connect      raw.githubusercontent.com
// @connect      api.github.com
// @connect      cdn.jsdelivr.net
// @connect      unpkg.com
// @run-at       document-end
// ==/UserScript==
`;
}

function comment() {
  return `/*
  jSkid v${VERSION} | (c) jSkid Team | MIT License
  Built from: ${RAW_BASE}
*/
`;
}

function runner() {
  return `(function() {
  "use strict";
  if (window.__jSkidInjected) return;
  window.__jSkidInjected = true;
  const engine = new JSkidEngine();
  engine.init();
})();`;
}

// ─── Build ─────────────────────────────────────────────────────────────────

console.log(`[jSkid] Bundling ${SOURCE_FILES.length} source files...`);

let bundle = header() + "\n" + comment() + "\n";

for (const rel of SOURCE_FILES) {
  const content = readSrc(rel);
  if (content) {
    bundle += `// ── ${rel} ──────────────────────────────\n`;
    bundle += content;
    if (!content.endsWith("\n")) bundle += "\n";
  }
}

bundle += "\n" + runner() + "\n";

fs.writeFileSync(OUT_FILE, bundle, "utf8");

const size = Buffer.byteLength(bundle, "utf8");
console.log(`[jSkid] Wrote ${OUT_FILE} (${size} bytes)`);
/**
 * jStore/jSkid Centralized Error Handler
 * Provides structured, contextual error logging with debug mode support.
 */
(function(global) {
  "use strict";

  class jStoreError extends Error {
    constructor(code, operation, message, context = {}, suggestion = "") {
      super(message);
      this.name = "jStoreError";
      this.code = code;           // NETWORK, HTTP, AUTH, NOT_FOUND, PARSE
      this.operation = operation; // fetchIndex, getModManifest, etc.
      this.context = context;     // { url, status, duration, method }
      this.suggestion = suggestion;
      this.timestamp = new Date().toISOString();
    }

    toConsoleGroup() {
      const prefix = `[jStore:${this.operation}]`;
      const status = this.context.status ? `HTTP ${this.context.status}` : this.code;
      const url = this.context.url ? `\n  URL: ${this.context.url}` : "";
      const duration = this.context.duration ? `\n  Duration: ${this.context.duration}ms` : "";
      const method = this.context.method ? `\n  Method: ${this.context.method}` : "";
      const suggestion = this.suggestion ? `\n  💡 ${this.suggestion}` : "";

      return `${prefix} ${this.code} — ${this.message}${status !== this.code ? ` (${status})` : ""}${url}${duration}${method}${suggestion}`;
    }
  }

  class ErrorHandler {
    constructor() {
      this.debugMode = false;
      this.errorCounts = new Map();
      this.lastError = null;
    }

    enableDebug() {
      this.debugMode = true;
      console.log("[jStore:ErrorHandler] Debug mode enabled");
    }

    disableDebug() {
      this.debugMode = false;
      console.log("[jStore:ErrorHandler] Debug mode disabled");
    }

    isDebugEnabled() {
      return this.debugMode || (typeof Storage !== "undefined" && localStorage.getItem("jskid_debug") === "true");
    }

    createError(code, operation, message, context = {}, suggestion = "") {
      const err = new jStoreError(code, operation, message, context, suggestion);
      this.lastError = err;
      this.incrementCount(code);
      return err;
    }

    incrementCount(code) {
      const count = (this.errorCounts.get(code) || 0) + 1;
      this.errorCounts.set(code, count);
    }

    logError(err, fallbackMessage = "") {
      const output = err.toConsoleGroup();
      const detailed = this.isDebugEnabled();

      if (detailed) {
        console.groupCollapsed(output);
        console.log("Full error object:", err);
        if (err.context.headers) console.log("Request headers:", err.context.headers);
        if (err.context.responseText) console.log("Response preview:", err.context.responseText.slice(0, 500));
        console.groupEnd();
      } else {
        console.warn(output);
      }

      if (fallbackMessage) {
        console.log(`  → ${fallbackMessage}`);
      }
    }

    // Convenience factory methods
    networkError(operation, url, originalError, suggestion = "Check network connectivity and CSP settings") {
      const err = this.createError(
        "NETWORK",
        operation,
        originalError.message || "Network request failed",
        { url, originalError: originalError.toString() },
        suggestion
      );
      this.logError(err, "Check if GM_xmlhttpRequest is granted");
      return err;
    }

    httpError(operation, status, url, duration = null, suggestion = "") {
      const statusText = this.getStatusText(status);
      const err = this.createError(
        "HTTP",
        operation,
        statusText,
        { status, url, duration },
        suggestion || this.getDefaultSuggestion(status)
      );
      this.logError(err, this.getFallbackAction(status));
      return err;
    }

    authError(operation, url, suggestion = "Verify your GitHub token has 'repo' scope") {
      const err = this.createError(
        "AUTH",
        operation,
        "Authentication failed",
        { url },
        suggestion
      );
      this.logError(err, "Re-enter GitHub token in settings");
      return err;
    }

    notFoundError(operation, resource, url, suggestion = "") {
      const err = this.createError(
        "NOT_FOUND",
        operation,
        `${resource} not found`,
        { url },
        suggestion || "Verify the resource exists at the specified URL"
      );
      this.logError(err, "Using fallback/default resource");
      return err;
    }

    parseError(operation, url, originalError, suggestion = "Response is not valid JSON or text") {
      const err = this.createError(
        "PARSE",
        operation,
        originalError.message || "Failed to parse response",
        { url, originalError: originalError.toString() },
        suggestion
      );
      this.logError(err, "Check if the server returned the expected format");
      return err;
    }

    getStatusText(status) {
      const texts = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout"
      };
      return texts[status] || `HTTP ${status}`;
    }

    getDefaultSuggestion(status) {
      const suggestions = {
        400: "Check request parameters and body format",
        401: "Authentication token may be missing or expired",
        403: "Insufficient permissions or rate limit exceeded",
        404: "Resource does not exist — check URL and branch name",
        500: "Server error — retry after a moment",
        502: "Upstream server error — retry",
        503: "Service temporarily unavailable — retry",
        504: "Request timed out — check network"
      };
      return suggestions[status] || "Check the URL and network conditions";
    }

    getFallbackAction(status) {
      if (status >= 500) return "Retrying may succeed";
      if (status === 404) return "Falling back to cached/default data";
      if (status === 403) return "Check API rate limits and permissions";
      return "Check the error details above";
    }

    getStats() {
      return {
        debugMode: this.debugMode,
        totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
        byCode: Object.fromEntries(this.errorCounts),
        lastError: this.lastError ? {
          code: this.lastError.code,
          operation: this.lastError.operation,
          message: this.lastError.message,
          timestamp: this.lastError.timestamp
        } : null
      };
    }

    reset() {
      this.errorCounts.clear();
      this.lastError = null;
    }
  }

  // Singleton instance
  const errorHandler = new ErrorHandler();

  // Expose globally
  global.jStoreErrorHandler = errorHandler;
  global.jStoreError = jStoreError;

  if (!global.__jskidErrorHandlerInitialized) {
    global.__jskidErrorHandlerInitialized = true;
    console.log("[jStore] Error handler initialized. Set localStorage.setItem('jskid_debug', 'true') for verbose logging.");
  }
})(typeof window !== "undefined" ? window : globalThis);
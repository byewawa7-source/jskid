/**
 * jSkript Lexer / Tokenizer
 */
(function(global) {
  "use strict";

  const TokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    STRING: "STRING",
    NUMBER: "NUMBER",
    VARIABLE: "VARIABLE",
    OPERATOR: "OPERATOR",
    SYMBOL: "SYMBOL",
    INDENT: "INDENT",
    NEWLINE: "NEWLINE",
    COMMENT: "COMMENT",
    EOF: "EOF"
  };

  const KEYWORDS = new Set([
    "set", "to", "add", "subtract", "multiply", "divide", "by", "from",
    "if", "else", "end", "then", "switch", "case", "default",
    "loop", "times", "through", "while", "break", "continue",
    "function", "return", "lambda", "async", "template", "new",
    "reply", "send", "show", "hide", "trigger", "on", "every", "after",
    "import", "as", "version", "functions",
    "true", "false", "null", "and", "or", "not",
    "append", "prepend", "replace", "trim", "split", "join", "in",
    "exists", "type", "of", "clone", "delete", "clear",
    "map", "filter", "sort", "reverse", "shuffle", "includes",
    "stop", "play", "get", "read", "write", "list", "object", "matching",
    "debug", "assert", "log", "inspect", "breakpoint"
  ]);

  class Token {
    constructor(type, value, line, column) {
      this.type = type;
      this.value = value;
      this.line = line;
      this.column = column;
    }
  }

  class JSkriptLexer {
    constructor(source) {
      this.source = source || "";
      this.pos = 0;
      this.line = 1;
      this.column = 1;
      this.length = this.source.length;
    }

    tokenize() {
      const tokens = [];
      let indentLevel = 0;
      let atLineStart = true;

      while (this.pos < this.length) {
        let ch = this.source[this.pos];

        // Handle newline & indentation at start of line
        if (ch === "\n") {
          tokens.push(new Token(TokenType.NEWLINE, "\n", this.line, this.column));
          this.pos++;
          this.line++;
          this.column = 1;
          atLineStart = true;
          continue;
        }

        if (ch === "\r") {
          this.pos++;
          continue;
        }

        if (atLineStart) {
          let spaces = 0;
          while (this.pos < this.length && (this.source[this.pos] === " " || this.source[this.pos] === "\t")) {
            spaces += this.source[this.pos] === "\t" ? 4 : 1;
            this.pos++;
            this.column++;
          }
          if (this.pos < this.length && this.source[this.pos] !== "\n" && this.source[this.pos] !== "\r") {
            const currentIndent = Math.floor(spaces / 4);
            tokens.push(new Token(TokenType.INDENT, currentIndent, this.line, this.column));
          }
          atLineStart = false;
          continue;
        }

        // Inline spaces
        if (ch === " " || ch === "\t") {
          this.pos++;
          this.column++;
          continue;
        }

        // Comments (# or //)
        if (ch === "#" || (ch === "/" && this.source[this.pos + 1] === "/")) {
          let commentText = "";
          while (this.pos < this.length && this.source[this.pos] !== "\n") {
            commentText += this.source[this.pos];
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.COMMENT, commentText, this.line, this.column));
          continue;
        }

        // Variables: {varName} or {obj}'s prop
        if (ch === "{") {
          let startCol = this.column;
          this.pos++;
          this.column++;
          let varName = "";
          while (this.pos < this.length && this.source[this.pos] !== "}") {
            varName += this.source[this.pos];
            this.pos++;
            this.column++;
          }
          if (this.source[this.pos] === "}") {
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.VARIABLE, varName.trim(), this.line, startCol));
          continue;
        }

        // Strings: "text"
        if (ch === '"' || ch === "'") {
          const quote = ch;
          let startCol = this.column;
          this.pos++;
          this.column++;
          let str = "";
          while (this.pos < this.length && this.source[this.pos] !== quote) {
            if (this.source[this.pos] === "\\" && this.pos + 1 < this.length) {
              this.pos++;
              this.column++;
              const escaped = this.source[this.pos];
              str += escaped === "n" ? "\n" : escaped === "t" ? "\t" : escaped;
            } else {
              str += this.source[this.pos];
            }
            this.pos++;
            this.column++;
          }
          if (this.pos < this.length && this.source[this.pos] === quote) {
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.STRING, str, this.line, startCol));
          continue;
        }

        // Numbers: 42, 3.14
        if (this.isDigit(ch) || (ch === "." && this.isDigit(this.source[this.pos + 1]))) {
          let startCol = this.column;
          let numStr = "";
          while (this.pos < this.length && (this.isDigit(this.source[this.pos]) || this.source[this.pos] === ".")) {
            numStr += this.source[this.pos];
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.NUMBER, parseFloat(numStr), this.line, startCol));
          continue;
        }

        // Operators & Multi-char operators
        if (this.isOperatorStart(ch)) {
          let startCol = this.column;
          let op = ch;
          this.pos++;
          this.column++;
          const next = this.source[this.pos];
          if ((ch === "=" || ch === "!" || ch === ">" || ch === "<") && next === "=") {
            op += next;
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.OPERATOR, op, this.line, startCol));
          continue;
        }

        // Symbols ( ( ), :, ,, ., etc. )
        if (["(", ")", ":", ",", ".", "[", "]", "'s"].includes(ch) || (ch === "'" && this.source[this.pos + 1] === "s")) {
          let startCol = this.column;
          let sym = ch;
          if (ch === "'" && this.source[this.pos + 1] === "s") {
            sym = "'s";
            this.pos += 2;
            this.column += 2;
          } else {
            this.pos++;
            this.column++;
          }
          tokens.push(new Token(TokenType.SYMBOL, sym, this.line, startCol));
          continue;
        }

        // Keywords & Identifiers
        if (this.isAlpha(ch) || ch === "_" || ch === "$") {
          let startCol = this.column;
          let ident = "";
          while (this.pos < this.length && (this.isAlphaNum(this.source[this.pos]) || this.source[this.pos] === "_" || this.source[this.pos] === "-")) {
            ident += this.source[this.pos];
            this.pos++;
            this.column++;
          }
          const lower = ident.toLowerCase();
          if (KEYWORDS.has(lower)) {
            tokens.push(new Token(TokenType.KEYWORD, lower, this.line, startCol));
          } else {
            tokens.push(new Token(TokenType.IDENTIFIER, ident, this.line, startCol));
          }
          continue;
        }

        // Fallback character
        tokens.push(new Token(TokenType.SYMBOL, ch, this.line, this.column));
        this.pos++;
        this.column++;
      }

      tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
      return tokens;
    }

    isDigit(c) {
      return c >= "0" && c <= "9";
    }

    isAlpha(c) {
      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
    }

    isAlphaNum(c) {
      return this.isAlpha(c) || this.isDigit(c);
    }

    isOperatorStart(c) {
      return ["+", "-", "*", "/", "=", "!", ">", "<", "%"].includes(c);
    }
  }

  global.JSkriptTokenType = TokenType;
  global.JSkriptToken = Token;
  global.JSkriptLexer = JSkriptLexer;
})(typeof window !== "undefined" ? window : globalThis);

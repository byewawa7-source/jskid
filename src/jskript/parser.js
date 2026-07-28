/**
 * jSkript Parser
 * Builds AST from Token Stream
 */
(function(global) {
  "use strict";

  const { TokenType } = global.JSkriptTokenType ? { TokenType: global.JSkriptTokenType } : { TokenType: {} };

  class JSkriptParser {
    constructor(tokens) {
      this.tokens = (tokens || []).filter(t => t.type !== global.JSkriptTokenType.COMMENT);
      this.pos = 0;
    }

    peek(offset = 0) {
      return this.tokens[this.pos + offset] || this.tokens[this.tokens.length - 1];
    }

    match(...typesOrValues) {
      const current = this.peek();
      for (const tv of typesOrValues) {
        if (current.type === tv || current.value === tv) {
          this.pos++;
          return current;
        }
      }
      return null;
    }

    expect(typeOrValue, errorMsg) {
      const token = this.match(typeOrValue);
      if (!token) {
        const cur = this.peek();
        throw new SyntaxError(`[jSkript Parser Error L${cur.line}:C${cur.column}] Expected ${typeOrValue}, found '${cur.value}' (${cur.type}). ${errorMsg || ""}`);
      }
      return token;
    }

    skipNewlines() {
      while (this.match(global.JSkriptTokenType.NEWLINE, global.JSkriptTokenType.INDENT)) {}
    }

    parse() {
      const statements = [];
      while (this.peek().type !== global.JSkriptTokenType.EOF) {
        this.skipNewlines();
        if (this.peek().type === global.JSkriptTokenType.EOF) break;
        const stmt = this.parseStatement();
        if (stmt) statements.push(stmt);
      }
      return { type: "Program", body: statements };
    }

    parseStatement() {
      this.skipNewlines();
      const token = this.peek();

      if (token.type === global.JSkriptTokenType.KEYWORD) {
        switch (token.value) {
          case "set":
            return this.parseSetStatement();
          case "add":
          case "subtract":
          case "multiply":
          case "divide":
            return this.parseMathMutation();
          case "append":
          case "prepend":
          case "replace":
          case "trim":
          case "split":
          case "join":
            return this.parseStringMutation();
          case "if":
            return this.parseIfStatement();
          case "switch":
            return this.parseSwitchStatement();
          case "loop":
          case "while":
            return this.parseLoopStatement();
          case "function":
          case "async":
            return this.parseFunctionDeclaration();
          case "template":
            return this.parseTemplateDeclaration();
          case "on":
          case "every":
          case "after":
            return this.parseEventBlock();
          case "import":
            return this.parseImportStatement();
          case "reply":
          case "send":
            return this.parseReplyStatement();
          case "return":
            this.pos++;
            return { type: "ReturnStatement", value: this.parseExpression() };
          case "break":
            this.pos++;
            return { type: "BreakStatement" };
          case "continue":
            this.pos++;
            return { type: "ContinueStatement" };
        }
      }

      // Expression statement fallback
      const expr = this.parseExpression();
      if (expr) {
        return { type: "ExpressionStatement", expression: expr };
      }

      this.pos++;
      return null;
    }

    parseSetStatement() {
      this.expect("set");
      const target = this.parseExpression();
      this.expect("to");
      const value = this.parseExpression();
      return { type: "VariableDeclaration", target, value };
    }

    parseMathMutation() {
      const opToken = this.expect(global.JSkriptTokenType.KEYWORD);
      const val = this.parseExpression();
      let target;

      if (opToken.value === "add" || opToken.value === "multiply") {
        this.expect("to", "by");
        target = this.parseExpression();
      } else if (opToken.value === "subtract" || opToken.value === "divide") {
        this.expect("from", "by");
        target = this.parseExpression();
      }
      return { type: "MathMutation", op: opToken.value, amount: val, target };
    }

    parseStringMutation() {
      const op = this.expect(global.JSkriptTokenType.KEYWORD).value;
      const arg1 = this.parseExpression();
      let arg2 = null;
      let target = null;

      if (op === "replace") {
        this.expect("with");
        arg2 = this.parseExpression();
        this.expect("in");
        target = this.parseExpression();
      } else if (op === "split" || op === "join") {
        this.expect("by", "with");
        arg2 = this.parseExpression();
      } else if (op === "append" || op === "prepend") {
        this.expect("to");
        target = this.parseExpression();
      }

      return { type: "StringMutation", op, arg1, arg2, target };
    }

    parseIfStatement() {
      this.expect("if");
      const test = this.parseExpression();
      this.match(":");
      this.skipNewlines();

      const consequent = [];
      while (this.peek().value !== "else" && this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        const stmt = this.parseStatement();
        if (stmt) consequent.push(stmt);
        this.skipNewlines();
      }

      let alternate = null;
      if (this.match("else")) {
        if (this.peek().value === "if") {
          alternate = this.parseIfStatement();
        } else {
          this.match(":");
          this.skipNewlines();
          alternate = [];
          while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) alternate.push(stmt);
            this.skipNewlines();
          }
        }
      }

      if (this.peek().value === "end") {
        this.expect("end");
        this.match("if");
      }

      return { type: "IfStatement", test, consequent, alternate };
    }

    parseSwitchStatement() {
      this.expect("switch");
      const discriminant = this.parseExpression();
      this.match(":");
      this.skipNewlines();

      const cases = [];
      while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        if (this.match("case")) {
          const test = this.parseExpression();
          this.match(":");
          this.skipNewlines();
          const consequent = [];
          while (this.peek().value !== "case" && this.peek().value !== "default" && this.peek().value !== "end") {
            const s = this.parseStatement();
            if (s) consequent.push(s);
            this.skipNewlines();
          }
          cases.push({ test, consequent });
        } else if (this.match("default")) {
          this.match(":");
          this.skipNewlines();
          const consequent = [];
          while (this.peek().value !== "end") {
            const s = this.parseStatement();
            if (s) consequent.push(s);
            this.skipNewlines();
          }
          cases.push({ test: null, consequent });
        } else {
          this.pos++;
        }
      }

      this.expect("end");
      this.match("switch");
      return { type: "SwitchStatement", discriminant, cases };
    }

    parseLoopStatement() {
      const loopTypeToken = this.expect("loop", "while");
      if (loopTypeToken.value === "while") {
        const test = this.parseExpression();
        this.match(":");
        this.skipNewlines();
        const body = [];
        while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
          const s = this.parseStatement();
          if (s) body.push(s);
          this.skipNewlines();
        }
        this.expect("end");
        this.match("while", "loop");
        return { type: "WhileLoop", test, body };
      }

      // loop N times or loop through {items} or loop {i} from A to B
      let count = null;
      let iterator = null;
      let collection = null;
      let from = null;
      let to = null;
      let mode = "fixed";

      if (this.peek().value === "through") {
        this.pos++;
        mode = "through";
        collection = this.parseExpression();
      } else {
        const first = this.parseExpression();
        if (this.match("times")) {
          mode = "fixed";
          count = first;
        } else if (this.match("from")) {
          mode = "range";
          iterator = first;
          from = this.parseExpression();
          this.expect("to");
          to = this.parseExpression();
        }
      }

      this.match(":");
      this.skipNewlines();
      const body = [];
      while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        const s = this.parseStatement();
        if (s) body.push(s);
        this.skipNewlines();
      }
      this.expect("end");
      this.match("loop");

      return { type: "LoopStatement", mode, count, iterator, collection, from, to, body };
    }

    parseFunctionDeclaration() {
      let isAsync = false;
      if (this.match("async")) isAsync = true;
      this.expect("function");

      const nameToken = this.expect(global.JSkriptTokenType.IDENTIFIER);
      this.expect("(");
      const params = [];
      while (this.peek().value !== ")" && this.peek().type !== global.JSkriptTokenType.EOF) {
        const p = this.expect(global.JSkriptTokenType.IDENTIFIER).value;
        params.push(p);
        this.match(",");
      }
      this.expect(")");
      this.match(":");
      this.skipNewlines();

      const body = [];
      while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        const s = this.parseStatement();
        if (s) body.push(s);
        this.skipNewlines();
      }
      this.expect("end");
      this.match("function");

      return { type: "FunctionDeclaration", name: nameToken.value, params, isAsync, body };
    }

    parseTemplateDeclaration() {
      this.expect("template");
      const name = this.expect(global.JSkriptTokenType.IDENTIFIER).value;
      this.match(":");
      this.skipNewlines();

      const fields = [];
      while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        if (this.peek().type === global.JSkriptTokenType.IDENTIFIER) {
          const fieldName = this.expect(global.JSkriptTokenType.IDENTIFIER).value;
          this.match(":");
          const fieldType = this.expect(global.JSkriptTokenType.IDENTIFIER, global.JSkriptTokenType.KEYWORD).value;
          let defaultValue = null;
          if (this.match("=")) {
            defaultValue = this.parseExpression();
          }
          fields.push({ name: fieldName, fieldType, defaultValue });
        } else {
          this.pos++;
        }
        this.skipNewlines();
      }
      this.expect("end");
      this.match("template");

      return { type: "TemplateDeclaration", name, fields };
    }

    parseEventBlock() {
      const keyword = this.expect("on", "every", "after").value;
      let eventName = "";
      let duration = null;

      if (keyword === "every" || keyword === "after") {
        duration = this.parseExpression();
        this.match("seconds", "minutes", "second", "minute");
        eventName = keyword;
      } else {
        // on chat message / on button click "id" / on mod load
        let nameParts = [];
        while (this.peek().value !== ":" && this.peek().type !== global.JSkriptTokenType.NEWLINE && this.peek().type !== global.JSkriptTokenType.EOF) {
          nameParts.push(this.peek().value);
          this.pos++;
        }
        eventName = nameParts.join(" ");
      }
      this.match(":");
      this.skipNewlines();

      const body = [];
      while (this.peek().value !== "end" && this.peek().type !== global.JSkriptTokenType.EOF) {
        const s = this.parseStatement();
        if (s) body.push(s);
        this.skipNewlines();
      }
      if (this.peek().value === "end") {
        this.expect("end");
        this.match("on", "event");
      }

      return { type: "EventBlock", keyword, eventName, duration, body };
    }

    parseImportStatement() {
      this.expect("import");
      const pathToken = this.expect(global.JSkriptTokenType.STRING);
      let alias = null;
      if (this.match("as")) {
        alias = this.expect(global.JSkriptTokenType.STRING, global.JSkriptTokenType.IDENTIFIER).value;
      }
      return { type: "ImportStatement", path: pathToken.value, alias };
    }

    parseReplyStatement() {
      this.expect("reply", "send");
      const message = this.parseExpression();
      return { type: "ReplyStatement", message };
    }

    parseExpression() {
      return this.parseBinaryExpression(0);
    }

    parseBinaryExpression(precedence = 0) {
      let left = this.parsePrimary();

      while (this.pos < this.tokens.length) {
        const opToken = this.peek();
        if (opToken.type === global.JSkriptTokenType.OPERATOR || ["and", "or", "not", "+", "-", "*", "/", "==", "!=", ">", "<", ">=", "<="].includes(opToken.value)) {
          this.pos++;
          const right = this.parseBinaryExpression(1);
          left = { type: "BinaryExpression", op: opToken.value, left, right };
        } else if (opToken.value === "'s") {
          this.pos++;
          const propToken = this.expect(global.JSkriptTokenType.IDENTIFIER, global.JSkriptTokenType.KEYWORD);
          left = { type: "MemberAccess", object: left, property: propToken.value };
        } else {
          break;
        }
      }

      return left;
    }

    parsePrimary() {
      const token = this.peek();

      if (token.type === global.JSkriptTokenType.NUMBER) {
        this.pos++;
        return { type: "Literal", value: token.value, rawType: "number" };
      }
      if (token.type === global.JSkriptTokenType.STRING) {
        this.pos++;
        return { type: "Literal", value: token.value, rawType: "string" };
      }
      if (token.type === global.JSkriptTokenType.KEYWORD && (token.value === "true" || token.value === "false")) {
        this.pos++;
        return { type: "Literal", value: token.value === "true", rawType: "boolean" };
      }
      if (token.type === global.JSkriptTokenType.KEYWORD && token.value === "null") {
        this.pos++;
        return { type: "Literal", value: null, rawType: "null" };
      }
      if (token.type === global.JSkriptTokenType.VARIABLE) {
        this.pos++;
        return { type: "VariableRef", name: token.value };
      }
      if (token.type === global.JSkriptTokenType.IDENTIFIER) {
        this.pos++;
        const name = token.value;
        if (this.match("(")) {
          const args = [];
          while (this.peek().value !== ")" && this.peek().type !== global.JSkriptTokenType.EOF) {
            args.push(this.parseExpression());
            this.match(",");
          }
          this.expect(")");
          return { type: "CallExpression", callee: name, args };
        }
        return { type: "Identifier", name };
      }
      if (token.value === "new") {
        this.pos++;
        const templateName = this.expect(global.JSkriptTokenType.IDENTIFIER).value;
        return { type: "NewExpression", templateName };
      }

      this.pos++;
      return { type: "Literal", value: token.value };
    }
  }

  global.JSkriptParser = JSkriptParser;
})(typeof window !== "undefined" ? window : globalThis);

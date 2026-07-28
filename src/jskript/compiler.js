/**
 * jSkript Compiler
 * Compiles AST to Bytecode instruction array
 */
(function(global) {
  "use strict";

  const Opcode = {
    PUSH: "PUSH",
    POP: "POP",
    SET_VAR: "SET_VAR",
    GET_VAR: "GET_VAR",
    ADD: "ADD",
    SUB: "SUB",
    MUL: "MUL",
    DIV: "DIV",
    EQ: "EQ",
    NEQ: "NEQ",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE",
    NOT: "NOT",
    AND: "AND",
    OR: "OR",
    JUMP: "JUMP",
    JUMP_IF_FALSE: "JUMP_IF_FALSE",
    CALL_FUNC: "CALL_FUNC",
    RETURN: "RETURN",
    MEMBER_GET: "MEMBER_GET",
    MEMBER_SET: "MEMBER_SET",
    NEW_TEMPLATE: "NEW_TEMPLATE",
    REPLY: "REPLY",
    HALT: "HALT"
  };

  class JSkriptCompiler {
    constructor() {
      this.instructions = [];
    }

    compile(ast) {
      this.instructions = [];
      if (!ast || ast.type !== "Program") {
        throw new Error("Invalid AST provided to compiler");
      }

      for (const stmt of ast.body) {
        this.compileNode(stmt);
      }

      this.emit(Opcode.HALT);
      return this.instructions;
    }

    emit(op, value = null, extra = null) {
      const inst = { op };
      if (value !== null) inst.value = value;
      if (extra !== null) Object.assign(inst, extra);
      this.instructions.push(inst);
      return this.instructions.length - 1;
    }

    compileNode(node) {
      if (!node) return;

      switch (node.type) {
        case "VariableDeclaration":
          this.compileNode(node.value);
          if (node.target.type === "VariableRef" || node.target.type === "Identifier") {
            this.emit(Opcode.SET_VAR, node.target.name);
          } else if (node.target.type === "MemberAccess") {
            this.compileNode(node.target.object);
            this.emit(Opcode.MEMBER_SET, node.target.property);
          }
          break;

        case "MathMutation":
          this.compileNode(node.amount);
          if (node.target) {
            this.emit(Opcode.GET_VAR, node.target.name || node.target.value);
            if (node.op === "add") this.emit(Opcode.ADD);
            if (node.op === "subtract") this.emit(Opcode.SUB);
            if (node.op === "multiply") this.emit(Opcode.MUL);
            if (node.op === "divide") this.emit(Opcode.DIV);
            this.emit(Opcode.SET_VAR, node.target.name || node.target.value);
          }
          break;

        case "Literal":
          this.emit(Opcode.PUSH, node.value);
          break;

        case "VariableRef":
        case "Identifier":
          this.emit(Opcode.GET_VAR, node.name);
          break;

        case "MemberAccess":
          this.compileNode(node.object);
          this.emit(Opcode.MEMBER_GET, node.property);
          break;

        case "BinaryExpression":
          this.compileNode(node.left);
          this.compileNode(node.right);
          if (node.op === "+") this.emit(Opcode.ADD);
          else if (node.op === "-") this.emit(Opcode.SUB);
          else if (node.op === "*") this.emit(Opcode.MUL);
          else if (node.op === "/") this.emit(Opcode.DIV);
          else if (node.op === "==" || node.op === "=") this.emit(Opcode.EQ);
          else if (node.op === "!=") this.emit(Opcode.NEQ);
          else if (node.op === ">") this.emit(Opcode.GT);
          else if (node.op === "<") this.emit(Opcode.LT);
          else if (node.op === ">=") this.emit(Opcode.GTE);
          else if (node.op === "<=") this.emit(Opcode.LTE);
          else if (node.op === "and") this.emit(Opcode.AND);
          else if (node.op === "or") this.emit(Opcode.OR);
          break;

        case "IfStatement":
          this.compileNode(node.test);
          const jumpFalsePos = this.emit(Opcode.JUMP_IF_FALSE, 0);

          if (Array.isArray(node.consequent)) {
            for (const s of node.consequent) this.compileNode(s);
          } else {
            this.compileNode(node.consequent);
          }

          const jumpEndPos = this.emit(Opcode.JUMP, 0);
          this.instructions[jumpFalsePos].value = this.instructions.length;

          if (node.alternate) {
            if (Array.isArray(node.alternate)) {
              for (const s of node.alternate) this.compileNode(s);
            } else {
              this.compileNode(node.alternate);
            }
          }
          this.instructions[jumpEndPos].value = this.instructions.length;
          break;

        case "LoopStatement":
          if (node.mode === "fixed") {
            // loop N times
            this.compileNode(node.count);
            this.emit(Opcode.SET_VAR, "__loop_counter__");
            const loopStart = this.instructions.length;
            this.emit(Opcode.GET_VAR, "__loop_counter__");
            this.emit(Opcode.PUSH, 0);
            this.emit(Opcode.GT);
            const jumpEnd = this.emit(Opcode.JUMP_IF_FALSE, 0);

            for (const s of node.body) this.compileNode(s);

            this.emit(Opcode.PUSH, 1);
            this.emit(Opcode.GET_VAR, "__loop_counter__");
            this.emit(Opcode.SUB);
            this.emit(Opcode.SET_VAR, "__loop_counter__");
            this.emit(Opcode.JUMP, loopStart);
            this.instructions[jumpEnd].value = this.instructions.length;
          }
          break;

        case "WhileLoop":
          const whileStart = this.instructions.length;
          this.compileNode(node.test);
          const whileJumpEnd = this.emit(Opcode.JUMP_IF_FALSE, 0);
          for (const s of node.body) this.compileNode(s);
          this.emit(Opcode.JUMP, whileStart);
          this.instructions[whileJumpEnd].value = this.instructions.length;
          break;

        case "CallExpression":
          if (node.args) {
            for (const arg of node.args) this.compileNode(arg);
          }
          this.emit(Opcode.CALL_FUNC, node.callee, { argCount: node.args ? node.args.length : 0 });
          break;

        case "ReplyStatement":
          this.compileNode(node.message);
          this.emit(Opcode.REPLY);
          break;

        case "ReturnStatement":
          if (node.value) this.compileNode(node.value);
          else this.emit(Opcode.PUSH, null);
          this.emit(Opcode.RETURN);
          break;

        case "ExpressionStatement":
          this.compileNode(node.expression);
          break;
      }
    }
  }

  global.JSkriptOpcode = Opcode;
  global.JSkriptCompiler = JSkriptCompiler;
})(typeof window !== "undefined" ? window : globalThis);

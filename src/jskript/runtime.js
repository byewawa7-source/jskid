/**
 * jSkript VM Runtime Interpreter
 */
(function(global) {
  "use strict";

  const Opcode = global.JSkriptOpcode || {};

  class ExecutionContext {
    constructor(parent = null, modId = "system", permissions = null) {
      this.variables = new Map();
      this.parent = parent;
      this.modId = modId;
      this.permissions = permissions;
    }

    get(name) {
      if (this.variables.has(name)) return this.variables.get(name);
      if (this.parent) return this.parent.get(name);
      return undefined;
    }

    set(name, value) {
      this.variables.set(name, value);
    }
  }

  class JSkriptRuntime {
    constructor(stdlib = null) {
      this.stdlib = stdlib || global.jskidStdlib || {};
      this.nativeFunctions = new Map();
      this.registerDefaultNatives();
    }

    registerDefaultNatives() {
      // Basic logging native
      this.nativeFunctions.set("log", (...args) => console.log("[jSkript Log]", ...args));
      this.nativeFunctions.set("print", (...args) => console.log("[jSkript Print]", ...args));
    }

    registerNative(name, fn) {
      this.nativeFunctions.set(name, fn);
    }

    execute(bytecode, contextOptions = {}) {
      const { modId = "mod", permissions = null, maxSteps = 100000, onReply = null } = contextOptions;
      const rootContext = new ExecutionContext(null, modId, permissions);
      const stack = [];
      let ip = 0;
      let stepCount = 0;

      while (ip < bytecode.length) {
        if (++stepCount > maxSteps) {
          throw new Error(`[jSkript VM Error] Mod "${modId}" exceeded maximum allowed execution steps (${maxSteps})`);
        }

        const inst = bytecode[ip];
        if (!inst) break;

        switch (inst.op) {
          case "PUSH": {
            let val = inst.value;
            if (typeof val === "string" && val.includes("%{")) {
              val = val.replace(/%\{([^}]+)\}%/g, (match, varName) => {
                const fetched = rootContext.get(varName.trim());
                return fetched !== undefined ? fetched : match;
              });
            }
            stack.push(val);
            break;
          }

          case "POP":
            stack.pop();
            break;

          case "SET_VAR":
            rootContext.set(inst.value, stack.pop());
            break;

          case "GET_VAR":
            const val = rootContext.get(inst.value);
            stack.push(val !== undefined ? val : null);
            break;

          case "ADD": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
            break;
          }
          case "SUB": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
            break;
          }
          case "MUL": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
            break;
          }
          case "DIV": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a / b);
            break;
          }

          case "EQ": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a == b);
            break;
          }
          case "NEQ": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a != b);
            break;
          }
          case "GT": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a > b);
            break;
          }
          case "LT": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a < b);
            break;
          }
          case "GTE": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a >= b);
            break;
          }
          case "LTE": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a <= b);
            break;
          }
          case "AND": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(Boolean(a && b));
            break;
          }
          case "OR": {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(Boolean(a || b));
            break;
          }

          case "JUMP":
            ip = inst.value;
            continue;

          case "JUMP_IF_FALSE":
            const cond = stack.pop();
            if (!cond) {
              ip = inst.value;
              continue;
            }
            break;

          case "CALL_FUNC": {
            const funcName = inst.value;
            const argCount = inst.argCount || 0;
            const args = [];
            for (let i = 0; i < argCount; i++) {
              args.unshift(stack.pop());
            }

            // Check permission if calling a guarded native function
            if (permissions && typeof permissions.check === "function") {
              if (funcName.startsWith("http")) permissions.check("http:*");
              if (funcName === "reply") permissions.check("write:chat");
            }

            // Execute stdlib or native function
            if (this.nativeFunctions.has(funcName)) {
              const res = this.nativeFunctions.get(funcName)(...args);
              stack.push(res !== undefined ? res : null);
            } else if (this.stdlib && typeof this.stdlib.call === "function") {
              const res = this.stdlib.call(funcName, args);
              stack.push(res !== undefined ? res : null);
            } else {
              console.warn(`[jSkript VM] Function "${funcName}" not defined`);
              stack.push(null);
            }
            break;
          }

          case "REPLY": {
            const msg = stack.pop();
            if (permissions) permissions.check("write:chat");
            if (typeof onReply === "function") {
              onReply(msg);
            } else {
              console.log(`[jSkript Reply]:`, msg);
            }
            break;
          }

          case "MEMBER_GET": {
            const obj = stack.pop();
            const prop = inst.value;
            stack.push(obj && typeof obj === "object" ? obj[prop] : null);
            break;
          }

          case "MEMBER_SET": {
            const obj = stack.pop();
            const val = stack.pop();
            const prop = inst.value;
            if (obj && typeof obj === "object") {
              obj[prop] = val;
            }
            break;
          }

          case "RETURN":
            return stack.pop();

          case "HALT":
            return stack.length > 0 ? stack[stack.length - 1] : null;
        }

        ip++;
      }

      return stack.length > 0 ? stack[stack.length - 1] : null;
    }
  }

  global.JSkriptRuntime = JSkriptRuntime;
})(typeof window !== "undefined" ? window : globalThis);

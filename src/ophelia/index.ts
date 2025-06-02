import * as PossumAst from "../possum/ast";
import * as Ast from "./ast";

type Problem = {
  node: PossumAst.Expr | PossumAst.Malformed;
  message: string;
  context?: string;
};

export class Ophelia {
  possumAst: PossumAst.Program;
  problems: Problem[];

  constructor(possumAst: PossumAst.Program) {
    this.possumAst = possumAst;
    this.problems = [];
  }

  get hasProblems() {
    return this.problems.length > 0;
  }

  run(): Ast.Program {
    const ast = this.buildProgram(this.possumAst);

    if (this.hasProblems) {
      throw new Error(this.formatProblems());
    } else {
      return ast;
    }
  }

  buildProgram(program: PossumAst.Program): Ast.Program {
    return {
      type: "program",
      acts: this.buildActs(program.value),
    };
  }

  buildActs(exprs: (PossumAst.Expr | PossumAst.Malformed)[]): Ast.Act[] {
    const acts: Ast.Act[] = [];

    for (const expr of exprs) {
      const act = this.buildAct(expr);
      if (act) acts.push(act);
    }

    return acts;
  }

  buildAct(expr: PossumAst.Expr | PossumAst.Malformed): Ast.Act | undefined {
    if (expr.type === "malformed") {
      this.addProblem(expr, `Malformed syntax: ${expr.value}`);
      return undefined;
    }

    if (expr.type === "block" && expr.postfixed.type === "var") {
      const actId = expr.postfixed.value;

      // Validate that act names start with capital letter
      if (actId[0] && actId[0] !== actId[0].toUpperCase()) {
        this.addProblem(
          expr,
          `Act labels must start with a capital letter, found: "${actId}"`,
        );
        return undefined;
      }

      return {
        type: "act",
        actId: actId,
        scenes: this.buildScenes(expr.value),
      };
    }

    this.addProblem(expr, "Expected a block with a label (e.g., Main { ... })");
    return undefined;
  }

  buildScenes(exprs: (PossumAst.Expr | PossumAst.Malformed)[]): Ast.Scene[] {
    const scenes: Ast.Scene[] = [];

    for (const expr of exprs) {
      const scene = this.buildScene(expr);
      if (scene) scenes.push(scene);
    }

    return scenes;
  }

  buildScene(
    expr: PossumAst.Expr | PossumAst.Malformed,
  ): Ast.Scene | undefined {
    if (expr.type === "malformed") {
      this.addProblem(expr, `Malformed syntax: ${expr.value}`);
      return undefined;
    }

    if (expr.type === "block" && expr.postfixed.type === "var") {
      const sceneId = expr.postfixed.value;

      // Validate that scene names start with capital letter
      if (sceneId[0] && sceneId[0] !== sceneId[0].toUpperCase()) {
        this.addProblem(
          expr,
          `Scene labels must start with a capital letter, found: "${sceneId}"`,
        );
        return undefined;
      }

      return {
        type: "scene",
        sceneId: sceneId,
        directions: this.buildDirections(expr.value),
      };
    }

    this.addProblem(expr, "Expected a scene block with a label");
    return undefined;
  }

  buildDirections(
    exprs: (PossumAst.Expr | PossumAst.Malformed)[],
  ): Ast.Direction[] {
    const directions: Ast.Direction[] = [];

    for (const expr of exprs) {
      const direction = this.buildDirection(expr);
      if (direction) {
        if (Array.isArray(direction)) {
          directions.push(...direction);
        } else {
          directions.push(direction);
        }
      }
    }

    return directions;
  }

  buildDirection(
    expr: PossumAst.Expr | PossumAst.Malformed,
  ): Ast.Direction | Ast.Direction[] | undefined {
    if (expr.type === "malformed") {
      this.addProblem(expr, `Malformed syntax: ${expr.value}`);
      return undefined;
    }

    // Handle stage(a, b) or stage(a)
    if (
      expr.type === "function_call" &&
      expr.postfixed.type === "var" &&
      expr.postfixed.value === "stage"
    ) {
      return this.buildStageDirection(expr.value);
    }

    // Handle unstage_all
    if (expr.type === "var" && expr.value === "unstage_all") {
      return { type: "unstage_all" };
    }

    // Handle unstage(a) or unstage(a, b)
    if (
      expr.type === "function_call" &&
      expr.postfixed.type === "var" &&
      expr.postfixed.value === "unstage"
    ) {
      return this.buildUnstageDirection(expr.value);
    }

    // Handle dialogue blocks like b { ... }
    if (expr.type === "block" && expr.postfixed.type === "var") {
      const speakerVarId = expr.postfixed.value;

      // Check if this is @you as speaker
      if (speakerVarId.startsWith("@")) {
        if (speakerVarId !== "@you") {
          this.addProblem(
            expr,
            `Invalid @ variable: "${speakerVarId}". Only "@you" is allowed.`,
          );
        } else {
          this.addProblem(
            expr,
            `@you cannot be used as a speaker. The speaker must be one of the staged characters.`,
          );
        }
        return undefined;
      }

      // Check if this is a lowercase speaking block (not a scene/act)
      if (
        speakerVarId[0] &&
        speakerVarId[0] === speakerVarId[0].toLowerCase()
      ) {
        const statements = this.buildStatements(expr.value);

        if (statements.length > 0) {
          return {
            type: "dialogue",
            speakerVarId,
            lines: statements,
          };
        }
      } else {
        // This is an uppercase label in a direction context
        this.addProblem(
          expr,
          `Speaking blocks must use lowercase variable names, found: "${speakerVarId}". Use lowercase for dialogue (e.g., 'a { ... }') or place this at the scene level for a subscene.`,
        );
        return undefined;
      }
    }

    // Handle goto statements
    if (
      expr.type === "function_call" &&
      expr.postfixed.type === "var" &&
      expr.postfixed.value === "goto"
    ) {
      const labelExpr = expr.value[0];
      if (labelExpr && labelExpr.type === "var") {
        // Create a default speaker dialogue
        const defaultSpeaker = "_speaker";
        return {
          type: "dialogue",
          speakerVarId: defaultSpeaker,
          lines: [
            {
              type: "goto",
              labelId: labelExpr.value,
            },
          ],
        };
      }
    }

    this.addProblem(expr, "Expected a stage direction or dialogue block");
    return undefined;
  }

  buildStageDirection(
    args: (PossumAst.Expr | PossumAst.Malformed)[],
  ): Ast.Stage | undefined {
    if (args.length === 0 || args.length > 2) {
      const problemNode = args[0] || { type: "malformed" as const, value: "" };
      this.addProblem(problemNode, "stage() expects 1 or 2 arguments");
      return undefined;
    }

    const firstArg = args[0];
    if (!firstArg) {
      return undefined;
    }

    const varId1 = this.extractVarId(firstArg);
    const varId2 =
      args.length === 2 && args[1] ? this.extractVarId(args[1]) : null;

    if (!varId1) {
      this.addProblem(firstArg, "stage() arguments must be variables");
      return undefined;
    }

    return {
      type: "stage",
      varId1,
      varId2,
    };
  }

  buildUnstageDirection(
    args: (PossumAst.Expr | PossumAst.Malformed)[],
  ): Ast.Unstage | undefined {
    if (args.length === 0 || args.length > 2) {
      const problemNode = args[0] || { type: "malformed" as const, value: "" };
      this.addProblem(problemNode, "unstage() expects 1 or 2 arguments");
      return undefined;
    }

    const firstArg = args[0];
    if (!firstArg) {
      return undefined;
    }

    const varId1 = this.extractVarId(firstArg);
    const varId2 =
      args.length === 2 && args[1] ? this.extractVarId(args[1]) : null;

    if (!varId1) {
      this.addProblem(firstArg, "unstage() arguments must be variables");
      return undefined;
    }

    return {
      type: "unstage",
      varId1,
      varId2,
    };
  }

  buildStatements(
    exprs: (PossumAst.Expr | PossumAst.Malformed)[],
  ): Ast.Statement[] {
    const statements: Ast.Statement[] = [];

    for (const expr of exprs) {
      const statement = this.buildStatement(expr);
      if (statement) statements.push(statement);
    }

    return statements;
  }

  buildStatement(
    expr: PossumAst.Expr | PossumAst.Malformed,
  ): Ast.Statement | undefined {
    if (expr.type === "malformed") {
      this.addProblem(expr, `Malformed syntax: ${expr.value}`);
      return undefined;
    }

    // Handle method calls like a.set(value), a.print_char, etc.
    if (expr.type === "method_access" && expr.left.type === "var") {
      const varValue = expr.left.value;

      // Check if this is @you
      if (varValue.startsWith("@")) {
        if (varValue !== "@you") {
          this.addProblem(
            expr,
            `Invalid @ variable: "${varValue}". Only "@you" is allowed.`,
          );
          return undefined;
        }
      }

      const varId = varValue;
      const method = expr.right;

      if (method.type === "var") {
        // Simple method access like @you.print_char
        switch (method.value) {
          case "print_char":
            return { type: ".print_char" };
          case "print_int":
            return { type: ".print_int" };
          case "read_char":
            return { type: ".read_char" };
          case "read_int":
            return { type: ".read_int" };
          case "push_self":
            return { type: ".push_self" };
          case "push_me":
            return { type: ".push_me" };
          case "pop":
            return { type: ".pop" };
          default:
            this.addProblem(expr, `Unknown method: ${method.value}`);
            return undefined;
        }
      } else if (
        method.type === "function_call" &&
        method.postfixed.type === "var"
      ) {
        // Method call like @you.set(value)
        const methodName = method.postfixed.value;

        if (methodName === "set" && method.value.length === 1) {
          const argExpr = method.value[0];
          if (argExpr) {
            const valueExpr = this.buildExpression(argExpr);
            if (valueExpr) {
              return { type: ".set", value: valueExpr };
            }
          }
        }
      }
    }

    // Handle test expressions (comparisons)
    if (expr.type === "function_call" && expr.postfixed.type === "var") {
      const funcName = expr.postfixed.value;
      if (funcName.startsWith("test_") && expr.value.length === 2) {
        const leftExpr = expr.value[0];
        const rightExpr = expr.value[1];

        if (leftExpr && rightExpr) {
          const left = this.buildExpression(leftExpr);
          const right = this.buildExpression(rightExpr);

          if (left && right) {
            const testType = funcName as Ast.Test["type"];
            return { type: testType, left, right };
          }
        }
      }

      // Handle goto statements
      if (funcName === "goto" && expr.value.length === 1) {
        const labelExpr = expr.value[0];
        if (labelExpr && labelExpr.type === "var") {
          return {
            type: "goto",
            labelId: labelExpr.value,
          };
        }
      }
    }

    // Handle if statements (if_true, if_false)
    if (expr.type === "function_call" && expr.postfixed.type === "var") {
      const funcName = expr.postfixed.value;
      if (
        (funcName === "if_true" || funcName === "if_false") &&
        expr.value.length === 1
      ) {
        const thenExpr = expr.value[0];

        if (thenExpr) {
          const thenStatement = this.buildStatement(thenExpr);
          if (thenStatement) {
            return {
              type: "if",
              is: funcName === "if_true",
              then: thenStatement,
            };
          }
        }
      }
    }

    // Provide more helpful error messages
    let errorMsg = "Expected a valid statement";
    if (expr.type === "function_call" && expr.postfixed.type === "var") {
      errorMsg = `Unknown function: ${expr.postfixed.value}`;
    } else if (expr.type === "method_access") {
      errorMsg = `Invalid method call`;
    }

    this.addProblem(expr, errorMsg);
    return undefined;
  }

  buildExpression(
    expr: PossumAst.Expr | PossumAst.Malformed,
  ): Ast.Expression | undefined {
    if (expr.type === "malformed") {
      this.addProblem(expr, `Malformed syntax: ${expr.value}`);
      return undefined;
    }

    switch (expr.type) {
      case "int":
        return { type: "int", value: expr.value };

      case "char":
        return { type: "char", value: expr.value };

      case "var":
        // Check if the variable starts with @
        if (expr.value.startsWith("@")) {
          // Must be @you
          if (expr.value === "@you") {
            return { type: "you" };
          } else {
            this.addProblem(
              expr,
              `Invalid @ variable: "${expr.value}". Only "@you" is allowed.`,
            );
            return undefined;
          }
        }
        return { type: "var", id: expr.value };

      case "add":
      case "subtract":
      case "multiply":
      case "divide":
      case "modulo": {
        const left = this.buildExpression(expr.left);
        const right = this.buildExpression(expr.right);

        if (left && right) {
          const opMap: Record<string, Ast.ArithmeticOp> = {
            add: "+",
            subtract: "-",
            multiply: "*",
            divide: "/",
            modulo: "%",
          };

          const op = opMap[expr.type];
          if (op) {
            return {
              type: "arithmetic",
              left,
              op,
              right,
            };
          }
        }
        break;
      }

      default:
        this.addProblem(expr, `Cannot convert ${expr.type} to expression`);
    }

    return undefined;
  }

  extractVarId(expr: PossumAst.Expr | PossumAst.Malformed): string | null {
    if (expr.type === "var") {
      // Check if this is @you
      if (expr.value === "@you") {
        this.addProblem(expr, `@you cannot be staged or unstaged.`);
        return null;
      }
      return expr.value;
    }
    return null;
  }

  createImplicitDialogue(statements: Ast.Statement[]): Ast.Dialogue[] {
    // When we have statements that need a speaker but none is specified,
    // we need to report an error
    this.addProblem(
      { type: "malformed" as const, value: "" },
      "Statements must be within a dialogue block (e.g., speaker.{ ... })",
    );
    return [];
  }

  addProblem(node: PossumAst.Expr | PossumAst.Malformed, message: string) {
    // Try to extract context from the node
    let context = "";
    if (node.type === "function_call" && node.postfixed.type === "var") {
      context = `${node.postfixed.value}(...)`;
    } else if (
      node.type === "method_access" &&
      node.left.type === "var" &&
      node.right.type === "var"
    ) {
      context = `${node.left.value}.${node.right.value}`;
    } else if (node.type === "var") {
      context = node.value;
    } else if (node.type === "malformed") {
      context = node.value;
    }

    this.problems.push({ node, message, context });
  }

  formatProblems(): string {
    if (this.problems.length === 0) return "";

    const header = `Found ${this.problems.length} error${
      this.problems.length > 1 ? "s" : ""
    }:\n`;
    const problemList = this.problems
      .map((p, i) => {
        const context = p.context ? ` at "${p.context}"` : "";
        return `  ${i + 1}. ${p.message}${context}`;
      })
      .join("\n");

    return header + problemList;
  }
}

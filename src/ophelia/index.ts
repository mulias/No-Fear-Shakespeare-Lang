import * as PossumAst from "../possum/ast";
import * as Ast from "./ast";

type Problem = {
  node: PossumAst.Node | PossumAst.Malformed;
  message: string;
  context?: string;
};

export function prettyPrint(ast: Ast.Program): string {
  const printer = new PrettyPrinter();
  return printer.printProgram(ast);
}

class PrettyPrinter {
  private indentLevel = 0;
  private readonly indentSize = 2;

  private indent(): string {
    return " ".repeat(this.indentLevel * this.indentSize);
  }

  private withIndent<T>(fn: () => T): T {
    this.indentLevel++;
    const result = fn();
    this.indentLevel--;
    return result;
  }

  printProgram(program: Ast.Program): string {
    return program.items.map((item) => this.printProgramItem(item)).join("\n");
  }

  private printProgramItem(item: Ast.ProgramItem): string {
    switch (item.type) {
      case "act":
        return this.printAct(item);
      case "comment":
        return this.printComment(item);
      default:
        const _exhaustive: never = item;
        throw new Error(`Unknown program item type: ${(item as any).type}`);
    }
  }

  private printAct(act: Ast.Act): string {
    const header = `${act.actId} {`;
    const footer = "}";

    if (act.items.length === 0) {
      return `${header}\n${footer}`;
    }

    const items = this.withIndent(() =>
      act.items.map((item) => this.printActItem(item)).join("\n\n"),
    );

    return `${header}\n${items}\n${footer}`;
  }

  private printActItem(item: Ast.ActItem): string {
    switch (item.type) {
      case "scene":
        return this.printScene(item);
      case "comment":
        return this.printComment(item);
      default:
        const _exhaustive: never = item;
        throw new Error(`Unknown act item type: ${(item as any).type}`);
    }
  }

  private printScene(scene: Ast.Scene): string {
    const header = `${this.indent()}${scene.sceneId} {`;
    const footer = `${this.indent()}}`;

    if (scene.directions.length === 0) {
      return `${header}\n${footer}`;
    }

    const directions = this.withIndent(() =>
      scene.directions.map((dir) => this.printDirection(dir)).join("\n\n"),
    );

    return `${header}\n${directions}\n${footer}`;
  }

  private printDirection(direction: Ast.Direction): string {
    switch (direction.type) {
      case "dialogue":
        return this.printDialogue(direction);
      case "stage":
        return this.printStage(direction);
      case "unstage":
        return this.printUnstage(direction);
      case "unstage_all":
        return `${this.indent()}unstage_all`;
      case "comment":
        return this.printComment(direction);
      default:
        const _exhaustive: never = direction;
        throw new Error(`Unknown direction type: ${(direction as any).type}`);
    }
  }

  private printComment(comment: Ast.Comment): string {
    return `${this.indent()}# ${comment.content}`;
  }

  private printDialogue(dialogue: Ast.Dialogue): string {
    const header = `${this.indent()}${dialogue.speakerVarId} {`;
    const footer = `${this.indent()}}`;

    if (dialogue.lines.length === 0) {
      return `${header}\n${footer}`;
    }

    const lines = this.withIndent(() =>
      dialogue.lines.map((line) => this.printStatementOrComment(line)).join("\n"),
    );

    return `${header}\n${lines}\n${footer}`;
  }

  private printStatementOrComment(item: Ast.StatementOrComment): string {
    if (item.type === "comment") {
      return this.printComment(item);
    } else {
      return this.printStatement(item);
    }
  }

  private printStage(stage: Ast.Stage): string {
    const args = stage.varId2
      ? `${stage.varId1}, ${stage.varId2}`
      : stage.varId1;
    return `${this.indent()}stage(${args})`;
  }

  private printUnstage(unstage: Ast.Unstage): string {
    const args = unstage.varId2
      ? `${unstage.varId1}, ${unstage.varId2}`
      : unstage.varId1;
    return `${this.indent()}unstage(${args})`;
  }

  private printStatement(statement: Ast.Statement): string {
    switch (statement.type) {
      case ".set":
        return `${this.indent()}@you.set(${this.printExpression(
          statement.value,
        )})`;
      case ".print_char":
        return `${this.indent()}@you.print_char`;
      case ".print_int":
        return `${this.indent()}@you.print_int`;
      case ".read_char":
        return `${this.indent()}@you.read_char`;
      case ".read_int":
        return `${this.indent()}@you.read_int`;
      case ".push_self":
        return `${this.indent()}@you.push_self`;
      case ".push_me":
        return `${this.indent()}@you.push`;
      case ".pop":
        return `${this.indent()}@you.pop`;
      case "test_eq":
      case "test_gt":
      case "test_lt":
      case "test_not_eq":
      case "test_not_gt":
      case "test_not_lt":
        return `${this.indent()}${statement.type}(${this.printExpression(
          statement.left,
        )}, ${this.printExpression(statement.right)})`;
      case "if":
        const condition = statement.is ? "if_true" : "if_false";
        return `${this.indent()}${condition}(${this.printStatement(
          statement.then,
        ).trim()})`;
      case "goto":
        return `${this.indent()}goto(${statement.labelId})`;
      default:
        const _exhaustive: never = statement;
        throw new Error(`Unknown statement type: ${(statement as any).type}`);
    }
  }

  private printExpression(expression: Ast.Expression): string {
    switch (expression.type) {
      case "int":
        return expression.value.toString();
      case "char":
        return `'${expression.value}'`;
      case "var":
        return expression.id;
      case "you":
        return "@you";
      case "arithmetic":
        return `${this.printExpression(expression.left)} ${
          expression.op
        } ${this.printExpression(expression.right)}`;
      default:
        const _exhaustive: never = expression;
        throw new Error(`Unknown expression type: ${(expression as any).type}`);
    }
  }
}

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
      items: this.buildProgramItems(program.value),
    };
  }

  buildProgramItems(nodes: (PossumAst.Node | PossumAst.Malformed)[]): Ast.ProgramItem[] {
    const items: Ast.ProgramItem[] = [];

    for (const node of nodes) {
      const item = this.buildProgramItem(node);
      if (item) items.push(item);
    }

    return items;
  }

  buildProgramItem(node: PossumAst.Node | PossumAst.Malformed): Ast.ProgramItem | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments at program level
    if (node.type === "comment") {
      return {
        type: "comment",
        content: node.value,
      };
    }

    // Handle acts
    if (node.type === "block" && node.postfixed.type === "var") {
      const actId = node.postfixed.value;

      // Validate that act names start with capital letter
      if (actId[0] && actId[0] !== actId[0].toUpperCase()) {
        this.addProblem(
          node,
          `Act labels must start with a capital letter, found: "${actId}"`,
        );
        return undefined;
      }

      return {
        type: "act",
        actId: actId,
        items: this.buildActItems(node.value),
      };
    }

    this.addProblem(node, "Expected a block with a label (e.g., Main { ... }) or a comment");
    return undefined;
  }

  buildActItems(nodes: (PossumAst.Node | PossumAst.Malformed)[]): Ast.ActItem[] {
    const items: Ast.ActItem[] = [];

    for (const node of nodes) {
      const item = this.buildActItem(node);
      if (item) items.push(item);
    }

    return items;
  }

  buildActItem(node: PossumAst.Node | PossumAst.Malformed): Ast.ActItem | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments at act level
    if (node.type === "comment") {
      return {
        type: "comment",
        content: node.value,
      };
    }

    // Handle scenes
    if (node.type === "block" && node.postfixed.type === "var") {
      const sceneId = node.postfixed.value;

      // Validate that scene names start with capital letter
      if (sceneId[0] && sceneId[0] !== sceneId[0].toUpperCase()) {
        this.addProblem(
          node,
          `Scene labels must start with a capital letter, found: "${sceneId}"`,
        );
        return undefined;
      }

      return {
        type: "scene",
        sceneId: sceneId,
        directions: this.buildDirections(node.value),
      };
    }

    this.addProblem(node, "Expected a scene block with a label or a comment");
    return undefined;
  }


  buildDirections(
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.Direction[] {
    const directions: Ast.Direction[] = [];

    for (const node of nodes) {
      const direction = this.buildDirection(node);
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
    node: PossumAst.Node | PossumAst.Malformed,
  ): Ast.Direction | Ast.Direction[] | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments
    if (node.type === "comment") {
      return {
        type: "comment",
        content: node.value,
      };
    }

    // Handle stage(a, b) or stage(a)
    if (
      node.type === "function_call" &&
      node.postfixed.type === "var" &&
      node.postfixed.value === "stage"
    ) {
      return this.buildStageDirection(node.value);
    }

    // Handle unstage_all
    if (node.type === "var" && node.value === "unstage_all") {
      return { type: "unstage_all" };
    }

    // Handle unstage(a) or unstage(a, b)
    if (
      node.type === "function_call" &&
      node.postfixed.type === "var" &&
      node.postfixed.value === "unstage"
    ) {
      return this.buildUnstageDirection(node.value);
    }

    // Handle dialogue blocks like b { ... }
    if (node.type === "block" && node.postfixed.type === "var") {
      const speakerVarId = node.postfixed.value;

      // Check if this is @you as speaker
      if (speakerVarId.startsWith("@")) {
        if (speakerVarId !== "@you") {
          this.addProblem(
            node,
            `Invalid @ variable: "${speakerVarId}". Only "@you" is allowed.`,
          );
        } else {
          this.addProblem(
            node,
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
        const statements = this.buildStatements(node.value);

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
          node,
          `Speaking blocks must use lowercase variable names, found: "${speakerVarId}". Use lowercase for dialogue (e.g., 'a { ... }') or place this at the scene level for a subscene.`,
        );
        return undefined;
      }
    }

    // Handle goto statements
    if (
      node.type === "function_call" &&
      node.postfixed.type === "var" &&
      node.postfixed.value === "goto"
    ) {
      const labelExpr = node.value[0];
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

    this.addProblem(node, "Expected a stage direction or dialogue block");
    return undefined;
  }

  buildStageDirection(
    args: (PossumAst.Node | PossumAst.Malformed)[],
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
    args: (PossumAst.Node | PossumAst.Malformed)[],
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
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.StatementOrComment[] {
    const statements: Ast.StatementOrComment[] = [];

    for (const node of nodes) {
      const statement = this.buildStatementOrComment(node);
      if (statement) statements.push(statement);
    }

    return statements;
  }

  buildStatementOrComment(
    node: PossumAst.Node | PossumAst.Malformed,
  ): Ast.StatementOrComment | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments in dialogue
    if (node.type === "comment") {
      return {
        type: "comment",
        content: node.value,
      };
    }

    // Handle regular statements
    return this.buildStatement(node);
  }

  buildStatement(
    node: PossumAst.Node | PossumAst.Malformed,
  ): Ast.Statement | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle method calls like a.set(value), a.print_char, etc.
    if (node.type === "method_access" && node.left.type === "var") {
      const varValue = node.left.value;

      // Check if this is @you
      if (varValue.startsWith("@")) {
        if (varValue !== "@you") {
          this.addProblem(
            node,
            `Invalid @ variable: "${varValue}". Only "@you" is allowed.`,
          );
          return undefined;
        }
      }

      const varId = varValue;
      const method = node.right;

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
            this.addProblem(node, `Unknown method: ${method.value}`);
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
    if (node.type === "function_call" && node.postfixed.type === "var") {
      const funcName = node.postfixed.value;
      if (funcName.startsWith("test_") && node.value.length === 2) {
        const leftExpr = node.value[0];
        const rightExpr = node.value[1];

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
      if (funcName === "goto" && node.value.length === 1) {
        const labelExpr = node.value[0];
        if (labelExpr && labelExpr.type === "var") {
          return {
            type: "goto",
            labelId: labelExpr.value,
          };
        }
      }
    }

    // Handle if statements (if_true, if_false)
    if (node.type === "function_call" && node.postfixed.type === "var") {
      const funcName = node.postfixed.value;
      if (
        (funcName === "if_true" || funcName === "if_false") &&
        node.value.length === 1
      ) {
        const thenExpr = node.value[0];

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
    if (node.type === "function_call" && node.postfixed.type === "var") {
      errorMsg = `Unknown function: ${node.postfixed.value}`;
    } else if (node.type === "method_access") {
      errorMsg = `Invalid method call`;
    }

    this.addProblem(node, errorMsg);
    return undefined;
  }

  buildExpression(
    node: PossumAst.Node | PossumAst.Malformed,
  ): Ast.Expression | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    switch (node.type) {
      case "int":
        return { type: "int", value: node.value };

      case "char":
        return { type: "char", value: node.value };

      case "var":
        // Check if the variable starts with @
        if (node.value.startsWith("@")) {
          // Must be @you
          if (node.value === "@you") {
            return { type: "you" };
          } else {
            this.addProblem(
              node,
              `Invalid @ variable: "${node.value}". Only "@you" is allowed.`,
            );
            return undefined;
          }
        }
        return { type: "var", id: node.value };

      case "add":
      case "subtract":
      case "multiply":
      case "divide":
      case "modulo": {
        const left = this.buildExpression(node.left);
        const right = this.buildExpression(node.right);

        if (left && right) {
          const opMap: Record<string, Ast.ArithmeticOp> = {
            add: "+",
            subtract: "-",
            multiply: "*",
            divide: "/",
            modulo: "%",
          };

          const op = opMap[node.type];
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
        this.addProblem(node, `Cannot convert ${node.type} to expression`);
    }

    return undefined;
  }

  extractVarId(node: PossumAst.Node | PossumAst.Malformed): string | null {
    if (node.type === "var") {
      // Check if this is @you
      if (node.value === "@you") {
        this.addProblem(node, `@you cannot be staged or unstaged.`);
        return null;
      }
      return node.value;
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

  addProblem(node: PossumAst.Node | PossumAst.Malformed, message: string) {
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
    } else if (node.type === "comment") {
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

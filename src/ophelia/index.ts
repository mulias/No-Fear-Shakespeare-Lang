import * as PossumAst from "../possum/ast";
import * as Ast from "./ast";

type Problem = {
  node: PossumAst.Node | PossumAst.Malformed;
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

  private getDocCommentKeyDisplay(key: PossumAst.DocCommentKey): string {
    if (key.type === "doc_comment_property") {
      return key.value;
    } else if (key.type === "doc_comment_var") {
      return `var ${key.value}`;
    } else {
      throw new Error(`Unknown doc comment key type: ${(key as any).type}`);
    }
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
    const { title, varDeclarations, items } = this.extractFrontmatter(
      program.value,
    );

    return {
      type: "program",
      title,
      varDeclarations,
      items: this.buildProgramItems(items),
    };
  }

  extractFrontmatter(nodes: (PossumAst.Node | PossumAst.Malformed)[]): {
    title?: PossumAst.TemplateString;
    varDeclarations: Map<string, PossumAst.TemplateString>;
    items: (PossumAst.Node | PossumAst.Malformed)[];
  } {
    let titleDocComment: PossumAst.DocComment | undefined;
    let titleCount = 0;
    const varDeclarations = new Map<string, PossumAst.TemplateString>();
    const remainingItems: (PossumAst.Node | PossumAst.Malformed)[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Check if this is a doc comment with title key
      if (
        node &&
        node.type === "doc_comment" &&
        node.value[0].type === "doc_comment_property" &&
        node.value[0].value === "title"
      ) {
        titleCount++;

        if (titleCount > 1) {
          this.addProblem(
            node,
            "Multiple title doc comments found. Only one title is allowed.",
          );
        } else if (i > 0) {
          // Check if there are any non-doc-comment nodes before this
          const hasNonDocCommentBefore = nodes
            .slice(0, i)
            .some((n) => n && n.type !== "doc_comment" && n.type !== "comment");

          if (hasNonDocCommentBefore) {
            this.addProblem(
              node,
              "Title doc comment must be at the top level of the program, before any acts.",
            );
          } else {
            titleDocComment = node;
          }
        } else {
          titleDocComment = node;
        }
      } else if (
        node &&
        node.type === "doc_comment" &&
        node.value[0].type === "doc_comment_var"
      ) {
        // Handle var doc comments
        const varName = node.value[0].value;
        const varDescription = node.value[1];

        if (varDeclarations.has(varName)) {
          this.addProblem(
            node,
            `Variable "${varName}" already declared. Only one declaration per variable is allowed.`,
          );
        } else {
          varDeclarations.set(varName, varDescription);
        }
      } else if (node) {
        // Pass through all other nodes (including non-title/var doc comments)
        remainingItems.push(node);
      }
    }

    const title = titleDocComment ? titleDocComment.value[1] : undefined;

    return { title, varDeclarations, items: remainingItems };
  }

  buildProgramItems(
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.ProgramItem[] {
    const items: Ast.ProgramItem[] = [];
    let pendingDescriptionNode: PossumAst.DocComment | undefined;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      // Check if this is a description doc comment
      if (
        node.type === "doc_comment" &&
        node.value[0].type === "doc_comment_property" &&
        node.value[0].value === "description"
      ) {
        if (pendingDescriptionNode) {
          this.addProblem(
            node,
            "Multiple description doc comments found before act. Only one description is allowed.",
          );
        }
        pendingDescriptionNode = node;
        continue;
      }

      // Check if this is a different type of doc comment at program level
      if (node.type === "doc_comment") {
        this.addProblem(
          node,
          `Invalid doc comment key "${this.getDocCommentKeyDisplay(
            node.value[0],
          )}" at program level. Only "title", "var", and "description" are allowed at the top level.`,
        );
        continue;
      }

      const item = this.buildProgramItem(
        node,
        pendingDescriptionNode?.value[1],
      );
      if (item) {
        items.push(item);
        pendingDescriptionNode = undefined;
      }
    }

    // If there's a pending description with no following act
    if (pendingDescriptionNode) {
      this.addProblem(
        pendingDescriptionNode,
        "Description doc comment must be followed by an act",
      );
    }

    return items;
  }

  buildProgramItem(
    node: PossumAst.Node | PossumAst.Malformed,
    description?: PossumAst.TemplateString,
  ): Ast.ProgramItem | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments at program level
    if (node.type === "comment") {
      if (description) {
        this.addProblem(
          node,
          "Description doc comment must be followed by an act, not a regular comment",
        );
      }
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
        description,
        items: this.buildActItems(node.value),
      };
    }

    if (description) {
      this.addProblem(
        node,
        "Description doc comment must be followed by an act",
      );
    }

    this.addProblem(
      node,
      "Expected a block with a label (e.g., Main { ... }) or a comment",
    );
    return undefined;
  }

  buildActItems(
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.ActItem[] {
    const items: Ast.ActItem[] = [];
    let pendingDescriptionNode: PossumAst.DocComment | undefined;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      // Check if this is a description doc comment
      if (
        node.type === "doc_comment" &&
        node.value[0].type === "doc_comment_property" &&
        node.value[0].value === "description"
      ) {
        if (pendingDescriptionNode) {
          this.addProblem(
            node,
            "Multiple description doc comments found before scene. Only one description is allowed.",
          );
        }
        pendingDescriptionNode = node;
        continue;
      }

      // Check if this is a different type of doc comment at act level
      if (node.type === "doc_comment") {
        this.addProblem(
          node,
          `Invalid doc comment key "${this.getDocCommentKeyDisplay(
            node.value[0],
          )}" at act level. Only "description" is allowed here.`,
        );
        continue;
      }

      const item = this.buildActItem(node, pendingDescriptionNode?.value[1]);
      if (item) {
        items.push(item);
        pendingDescriptionNode = undefined;
      }
    }

    // If there's a pending description with no following scene
    if (pendingDescriptionNode) {
      this.addProblem(
        pendingDescriptionNode,
        "Description doc comment must be followed by a scene",
      );
    }

    return items;
  }

  buildActItem(
    node: PossumAst.Node | PossumAst.Malformed,
    description?: PossumAst.TemplateString,
  ): Ast.ActItem | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Handle comments at act level
    if (node.type === "comment") {
      if (description) {
        this.addProblem(
          node,
          "Description doc comment must be followed by a scene, not a regular comment",
        );
      }
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
        description,
        directions: this.buildDirections(node.value),
      };
    }

    if (description) {
      this.addProblem(
        node,
        "Description doc comment must be followed by a scene",
      );
    }

    this.addProblem(node, "Expected a scene block with a label or a comment");
    return undefined;
  }

  buildDirections(
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.Direction[] {
    const directions: Ast.Direction[] = [];

    for (const node of nodes) {
      if (node) {
        const direction = this.buildDirection(node);
        if (direction) {
          directions.push(direction);
        }
      }
    }

    return directions;
  }

  buildDirection(
    node: PossumAst.Node | PossumAst.Malformed,
  ): Ast.Direction | undefined {
    if (node.type === "malformed") {
      this.addProblem(node, `Malformed syntax: ${node.value}`);
      return undefined;
    }

    // Reject doc comments inside scenes
    if (node.type === "doc_comment") {
      this.addProblem(node, "Doc comments are not allowed inside scenes");
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
      if (node.value.length === 0) {
        this.addProblem(node, "stage() expects at least 1 argument");
        return undefined;
      }

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
      if (node.value.length === 0) {
        this.addProblem(node, "unstage() expects at least 1 argument");
        return undefined;
      }

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

    this.addProblem(node, "Expected a stage direction or dialogue block");
    return undefined;
  }

  buildStageDirection(
    args: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.Stage | undefined {
    const varIds: string[] = [];

    for (const arg of args) {
      if (!arg) continue;

      const varId = this.extractVarId(arg);
      if (!varId) {
        this.addProblem(arg, "stage() arguments must be variables");
        return undefined;
      }

      varIds.push(varId);
    }

    return {
      type: "stage",
      varIds,
    };
  }

  buildUnstageDirection(
    args: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.Unstage | undefined {
    const varIds: string[] = [];

    for (const arg of args) {
      if (!arg) continue;

      const varId = this.extractVarId(arg);
      if (!varId) {
        this.addProblem(arg, "unstage() arguments must be variables");
        return undefined;
      }

      varIds.push(varId);
    }

    if (varIds.length === 0) {
      return undefined;
    }

    return {
      type: "unstage",
      varIds,
    };
  }

  buildStatements(
    nodes: (PossumAst.Node | PossumAst.Malformed)[],
  ): Ast.StatementOrComment[] {
    const statements: Ast.StatementOrComment[] = [];

    for (const node of nodes) {
      if (node) {
        const statement = this.buildStatementOrComment(node);
        if (statement) {
          statements.push(statement);
        }
      }
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

      const method = node.right;

      if (method.type === "var") {
        // Simple method access like @you.print_char
        let statement: Ast.Statement | undefined;
        switch (method.value) {
          case "print_char":
            statement = {
              type: ".print_char",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "print_int":
            statement = {
              type: ".print_int",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "read_char":
            statement = {
              type: ".read_char",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "read_int":
            statement = {
              type: ".read_int",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "push_self":
            statement = {
              type: ".push_self",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "push_me":
            statement = {
              type: ".push_me",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          case "pop":
            statement = {
              type: ".pop",
              followedByBlankLine: !!method.followedByBlankLine,
            };
            break;
          default:
            this.addProblem(node, `Unknown method: ${method.value}`);
            return undefined;
        }

        return statement;
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
              return {
                type: ".set",
                value: valueExpr,
                followedByBlankLine: !!method.followedByBlankLine,
              };
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
            return {
              type: testType,
              left,
              right,
              followedByBlankLine: !!node.followedByBlankLine,
            };
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
            followedByBlankLine: !!node.followedByBlankLine,
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
              followedByBlankLine: !!node.followedByBlankLine,
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

      case "negate": {
        const expr = this.buildExpression(node.prefixed);
        if (expr && expr.type === "int") {
          return { ...expr, value: expr.value * -1 };
        } else if (expr) {
          // Convert `-x` to `0 - x` when x is not a concrete number
          return {
            type: "arithmetic",
            left: { type: "int", value: 0 },
            op: "-" as Ast.ArithmeticOp,
            right: expr,
          };
        }
        break;
      }

      case "function_call": {
        // Handle unary operators
        if (node.postfixed.type === "var" && node.value.length === 1) {
          const funcName = node.postfixed.value;
          const unaryOps: Record<string, Ast.UnaryOp> = {
            square: "square",
            cube: "cube",
            square_root: "square_root",
            factorial: "factorial",
          };

          if (funcName in unaryOps) {
            const operandNode = node.value[0];
            if (operandNode) {
              const operand = this.buildExpression(operandNode);
              if (operand) {
                return {
                  type: "unary",
                  op: unaryOps[funcName]!,
                  operand,
                };
              }
            }
          }
        }
        this.addProblem(
          node,
          `Unknown function in expression: ${
            node.postfixed.type === "var" ? node.postfixed.value : "unknown"
          }`,
        );
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

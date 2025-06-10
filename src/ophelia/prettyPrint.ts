import * as Ast from "./ast";
import { AssertNeverError } from "../util";

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

  private printTemplateString(templateString: Ast.TemplateString): string {
    return templateString.value
      .map((segment) => {
        if (segment.type === "template_string_segment") {
          return segment.value;
        } else if (segment.type === "template_var_segment") {
          return `{${segment.value}}`;
        } else {
          throw new Error(
            `Unknown template segment type: ${(segment as any).type}`,
          );
        }
      })
      .join("");
  }

  printProgram(program: Ast.Program): string {
    const parts: string[] = [];

    if (program.title) {
      parts.push(`## title: ${this.printTemplateString(program.title)}`);
    }

    // Add var declarations
    for (const [varName, description] of program.varDeclarations) {
      parts.push(`## var ${varName}: ${this.printTemplateString(description)}`);
    }

    if (program.items.length > 0) {
      // Add empty line before first act if there are var declarations or title
      if (program.title || program.varDeclarations.size > 0) {
        parts.push("");
      }

      // Print each program item
      for (let i = 0; i < program.items.length; i++) {
        const programItem = program.items[i];
        if (programItem) {
          const printedItem = this.printProgramItem(programItem);
          parts.push(printedItem);

          // Add blank line after acts (except the last one)
          if (programItem.type === "act" && i < program.items.length - 1) {
            parts.push("");
          }
        }
      }
    }

    return parts.join("\n");
  }

  private printProgramItem(item: Ast.ProgramItem): string {
    switch (item.type) {
      case "act":
        return this.printAct(item);
      case "comment":
        return this.printComment(item);
      default:
        throw new AssertNeverError(item);
    }
  }

  private printAct(act: Ast.Act): string {
    const parts: string[] = [];

    // Add description doc comment if present
    if (act.description) {
      parts.push(
        `## description: ${this.printTemplateString(act.description)}`,
      );
    }

    const header = `${act.actId} {`;
    const footer = "}";

    if (act.items.length === 0) {
      parts.push(`${header}\n${footer}`);
      return parts.join("\n");
    }

    const items = this.withIndent(() => {
      const itemParts: string[] = [];
      for (let i = 0; i < act.items.length; i++) {
        const item = act.items[i];
        if (item) {
          itemParts.push(this.printActItem(item));

          if (i < act.items.length - 1) {
            itemParts.push("");
          }
        }
      }
      return itemParts.join("\n");
    });

    parts.push(`${header}\n${items}\n${footer}`);
    return parts.join("\n");
  }

  private printActItem(item: Ast.ActItem): string {
    switch (item.type) {
      case "scene":
        return this.printScene(item);
      case "comment":
        return this.printComment(item);
      default:
        throw new AssertNeverError(item);
    }
  }

  private printScene(scene: Ast.Scene): string {
    const parts: string[] = [];

    // Add description doc comment if present
    if (scene.description) {
      parts.push(
        `${this.indent()}## description: ${this.printTemplateString(
          scene.description,
        )}`,
      );
    }

    const header = `${this.indent()}${scene.sceneId} {`;
    const footer = `${this.indent()}}`;

    if (scene.directions.length === 0) {
      parts.push(`${header}\n${footer}`);
      return parts.join("\n");
    }

    const directions = this.withIndent(() => {
      const dirParts: string[] = [];
      for (let i = 0; i < scene.directions.length; i++) {
        const dir = scene.directions[i];
        if (dir) {
          dirParts.push(this.printDirection(dir));

          // Apply spacing rules based on current and next direction types
          if (i < scene.directions.length - 1) {
            const nextDir = scene.directions[i + 1];
            if (nextDir) {
              const currentIsStage = this.isStageDirection(dir);
              const nextIsStage = this.isStageDirection(nextDir);

              // Add a blank line unless both items are stage directions, in
              // which case they should be grouped
              if (!currentIsStage || !nextIsStage) {
                dirParts.push("");
              }
            }
          }
        }
      }
      return dirParts.join("\n");
    });

    parts.push(`${header}\n${directions}\n${footer}`);
    return parts.join("\n");
  }

  private isStageDirection(direction: Ast.Direction): boolean {
    return (
      direction.type === "stage" ||
      direction.type === "unstage" ||
      direction.type === "unstage_all"
    );
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
        throw new AssertNeverError(direction);
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

    const lines = this.withIndent(() => {
      const lineParts: string[] = [];
      for (let i = 0; i < dialogue.lines.length; i++) {
        const line = dialogue.lines[i];
        if (line) {
          lineParts.push(this.printStatementOrComment(line));

          // Add blank line after statement if it has followedByBlankLine flag
          // and it's not the last statement in the dialogue
          if (i < dialogue.lines.length - 1) {
            if (line.type !== "comment" && line.followedByBlankLine) {
              lineParts.push("");
            }
          }
        }
      }
      return lineParts.join("\n");
    });

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
    const args = stage.varIds.join(", ");
    return `${this.indent()}stage(${args})`;
  }

  private printUnstage(unstage: Ast.Unstage): string {
    const args = unstage.varIds.join(", ");
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
        return `${this.indent()}@you.push_me`;
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
        throw new AssertNeverError(statement);
    }
  }

  private printExpression(expression: Ast.Expression): string {
    return this.printExpressionWithPrecedence(expression, 0);
  }

  private printExpressionWithPrecedence(
    expression: Ast.Expression,
    parentPrecedence: number,
  ): string {
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
        const precedence = this.getOperatorPrecedence(expression.op);
        const left = this.printExpressionWithPrecedence(
          expression.left,
          precedence,
        );
        const right = this.printExpressionWithPrecedence(
          expression.right,
          precedence,
        );
        const result = `${left} ${expression.op} ${right}`;

        // Add parentheses if this operator has lower precedence than parent
        if (precedence < parentPrecedence) {
          return `(${result})`;
        }
        return result;
      case "unary":
        return `${expression.op}(${this.printExpressionWithPrecedence(
          expression.operand,
          0,
        )})`;
      default:
        throw new AssertNeverError(expression);
    }
  }

  private getOperatorPrecedence(op: Ast.ArithmeticOp): number {
    // PEMDAS precedence: higher number = higher precedence
    switch (op) {
      case "*":
      case "/":
      case "%":
        return 2; // Multiplication, Division, Modulo
      case "+":
      case "-":
        return 1; // Addition, Subtraction
      default:
        return 0;
    }
  }
}

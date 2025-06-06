import * as OpheliaAst from "../ophelia/ast";
import * as Ast from "../horatio/ast";

type Vars = Set<OpheliaAst.VarId>;

type LabeledParts = Record<OpheliaAst.LabelId, Act | Scene>;

type Act = { type: "act"; actIndex: number };

type Scene = { type: "scene"; actIndex: number; sceneIndex: number };

type Location = { actIndex: number; sceneIndex: number };

export class Analyzer {
  ast: OpheliaAst.Program;
  vars: Vars;
  parts: LabeledParts;

  constructor(ast: OpheliaAst.Program) {
    this.ast = ast;
    this.vars = allVars(ast);
    this.parts = labeledParts(ast);
  }

  hasVar(varId: OpheliaAst.VarId) {
    return this.vars.has(varId);
  }

  partWithLabel(label: OpheliaAst.LabelId): Act | Scene {
    const part = this.parts[label];
    if (part) {
      return part;
    } else {
      throw new Error(`${label} not found`);
    }
  }

  actLabel(actIndex: number): string | undefined {
    const found = Object.entries(this.parts).find(
      ([label, part]) => part.type === "act" && part.actIndex === actIndex,
    );

    return found ? found[0] : undefined;
  }

  sceneLabel(actIndex: number, sceneIndex: number): string | undefined {
    const found = Object.entries(this.parts).find(
      ([label, part]) =>
        part.type === "scene" &&
        part.actIndex === actIndex &&
        part.sceneIndex === sceneIndex,
    );

    return found ? found[0] : undefined;
  }

  // check that
  //   - vars are all staged at some point
  //   - speaker does not address self in invalid way
  //   - goto does not jump to a scene in a different act
  check() {
    // Filter out comments and only analyze acts
    const acts = this.ast.items.filter(
      (item) => item.type === "act",
    ) as OpheliaAst.Act[];
    acts.forEach((act, actIndex) => {
      // Filter out comments and only analyze scenes
      const scenes = act.items.filter(
        (item) => item.type === "scene",
      ) as OpheliaAst.Scene[];
      scenes.forEach((scene, sceneIndex) => {
        scene.directions.forEach((direction) => {
          const loc = { actIndex, sceneIndex };

          switch (direction.type) {
            case "stage":
              break;
            case "dialogue":
              this.checkDialogue(direction, loc);
              break;
            case "unstage":
              this.checkUnstage(direction, loc);
              break;
            case "unstage_all":
              break;
            case "comment":
              // Comments are ignored in analysis
              break;
            default:
              const _: never = direction;
          }
        });
      });
    });
  }

  checkDialogue(
    { speakerVarId, lines }: OpheliaAst.Dialogue,
    loc: Location,
  ): void {
    this.assertValidVarUse(speakerVarId, loc);

    // Filter out comments and only check statements
    const statements = lines.filter(
      (line) => line.type !== "comment",
    ) as OpheliaAst.Statement[];
    statements.forEach((statement) =>
      this.checkStatement(statement, speakerVarId, loc),
    );
  }

  checkStatement(
    statement: OpheliaAst.Statement,
    speakerVarId: OpheliaAst.VarId,
    loc: Location,
  ): void {
    switch (statement.type) {
      case ".pop":
      case ".print_char":
      case ".print_int":
      case ".read_char":
      case ".read_int":
      case ".push_self":
      case ".push_me":
      case ".set":
        break;
      case "goto":
        this.assertValidGoto(statement.labelId, loc);
        break;
      case "if":
        this.checkStatement(statement.then, speakerVarId, loc);
        break;
      case "test_eq":
      case "test_gt":
      case "test_lt":
      case "test_not_eq":
      case "test_not_gt":
      case "test_not_lt":
        this.checkExpression(statement.left, loc);
        this.checkExpression(statement.right, loc);
        break;
      default:
        const _: never = statement;
    }
  }

  checkExpression(expression: OpheliaAst.Expression, loc: Location): void {
    switch (expression.type) {
      case "arithmetic":
        this.checkExpression(expression.left, loc);
        this.checkExpression(expression.right, loc);
        break;
      case "unary":
        this.checkExpression(expression.operand, loc);
        break;
      case "char":
        break;
      case "int":
        break;
      case "var":
        this.assertValidVarUse(expression.id, loc);
        break;
      case "you":
        break;
      default:
        const _: never = expression;
    }
  }

  checkUnstage({ varIds }: OpheliaAst.Unstage, loc: Location): void {
    for (const varId of varIds) {
      this.assertValidUnstage(varId, loc);
    }
  }

  assertValidVarUse(varId: OpheliaAst.VarId, loc: Location): void {
    // @you is always valid in dialogue context
    if (varId === "@you") {
      return;
    }

    if (!this.hasVar(varId)) {
      throw new Error(
        this.errorMessage(loc, `${varId} is used but never staged.`),
      );
    }
  }

  assertDistinctSpeakerAndSubject(
    speakerVarId: OpheliaAst.VarId,
    subjectVarId: OpheliaAst.VarId,
    loc: Location,
  ): void {
    // @you always refers to the other character, so it's always distinct from speaker
    if (subjectVarId === "@you") {
      return;
    }

    if (speakerVarId === subjectVarId) {
      throw new Error(
        this.errorMessage(
          loc,
          `${speakerVarId} acts on itself in an invalid way.`,
        ),
      );
    }
  }

  assertValidUnstage(varId: OpheliaAst.VarId, loc: Location): void {
    // @you cannot be unstaged
    if (varId === "@you") {
      throw new Error(this.errorMessage(loc, `@you cannot be unstaged.`));
    }

    if (!this.hasVar(varId)) {
      throw new Error(
        this.errorMessage(loc, `${varId} is unstaged but never staged.`),
      );
    }
  }

  assertValidGoto(labelId: OpheliaAst.LabelId, loc: Location): void {
    const gotoPart = this.partWithLabel(labelId);
    const sceneLabel = this.sceneLabel(loc.actIndex, loc.sceneIndex);

    if (!gotoPart) {
      throw new Error(
        this.errorMessage(loc, `no act or scene with label ${labelId}.`),
      );
    }

    if (
      gotoPart &&
      gotoPart.type === "scene" &&
      gotoPart.actIndex !== loc.actIndex
    ) {
      throw new Error(
        this.errorMessage(
          loc,
          `unable to goto ${labelId} from ${sceneLabel}, the destination scene must be within the same act.`,
        ),
      );
    }
  }

  errorMessage({ actIndex, sceneIndex }: Location, message: string): string {
    const act = this.actLabel(actIndex);
    const scene = this.sceneLabel(actIndex, sceneIndex);
    return `Error in ${act} ${scene}: ${message}`;
  }
}

function allVars(ast: OpheliaAst.Program): Vars {
  let vars: Vars = new Set();

  // Filter out comments and only process acts
  const acts = ast.items.filter(
    (item) => item.type === "act",
  ) as OpheliaAst.Act[];
  acts.forEach((act) => {
    // Filter out comments and only process scenes
    const scenes = act.items.filter(
      (item) => item.type === "scene",
    ) as OpheliaAst.Scene[];
    scenes.forEach((scene) => {
      scene.directions.forEach((direction) => {
        if (direction.type === "stage") {
          for (const varId of direction.varIds) {
            vars.add(varId);
          }
        }
      });
    });
  });

  return vars;
}

function labeledParts(ast: OpheliaAst.Program): LabeledParts {
  let parts: LabeledParts = {};

  // Filter out comments and only process acts
  const acts = ast.items.filter(
    (item) => item.type === "act",
  ) as OpheliaAst.Act[];
  acts.forEach((act, actIndex) => {
    parts[act.actId] = { type: "act", actIndex };

    // Filter out comments and only process scenes
    const scenes = act.items.filter(
      (item) => item.type === "scene",
    ) as OpheliaAst.Scene[];
    scenes.forEach((scene, sceneIndex) => {
      parts[scene.sceneId] = { type: "scene", actIndex, sceneIndex };
    });
  });

  return parts;
}

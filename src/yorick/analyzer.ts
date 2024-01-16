import * as PossumAst from "../possum/ast";
import * as Ast from "../horatio/ast";

type Vars = Set<PossumAst.VarId>;

type LabeledParts = Record<PossumAst.LabelId, Act | Scene>;

type Act = { type: "act"; actIndex: number };

type Scene = { type: "scene"; actIndex: number; sceneIndex: number };

type Location = { actIndex: number; sceneIndex: number };

export class Analyzer {
  ast: PossumAst.Program;
  vars: Vars;
  parts: LabeledParts;

  constructor(ast: PossumAst.Program) {
    this.ast = ast;
    this.vars = allVars(ast);
    this.parts = labeledParts(ast);
  }

  hasVar(varId: PossumAst.VarId) {
    return this.vars.has(varId);
  }

  partWithLabel(label: PossumAst.LabelId): Act | Scene {
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
    this.ast.acts.forEach((act, actIndex) => {
      act.scenes.forEach((scene, sceneIndex) => {
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
            default:
              const _: never = direction;
          }
        });
      });
    });
  }

  checkDialogue(
    { speakerVarId, lines }: PossumAst.Dialogue,
    loc: Location,
  ): void {
    this.assertValidVarUse(speakerVarId, loc);

    lines.forEach((line) => this.checkStatement(line, speakerVarId, loc));
  }

  checkStatement(
    statement: PossumAst.Statement,
    speakerVarId: PossumAst.VarId,
    loc: Location,
  ): void {
    switch (statement.type) {
      case ".pop":
      case ".print_char":
      case ".print_int":
      case ".push":
      case ".read_char":
      case ".read_int":
        this.assertValidVarUse(statement.varId, loc);
        this.assertDistinctSpeakerAndSubject(
          speakerVarId,
          statement.varId,
          loc,
        );
        break;
      case ".set":
        this.assertValidVarUse(statement.varId, loc);
        this.checkExpression(statement.value, loc);
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

  checkExpression(expression: PossumAst.Expression, loc: Location): void {
    switch (expression.type) {
      case "arithmetic":
        this.checkExpression(expression.left, loc);
        this.checkExpression(expression.right, loc);
        break;
      case "char":
        break;
      case "int":
        break;
      case "var":
        this.assertValidVarUse(expression.id, loc);
        break;
      default:
        const _: never = expression;
    }
  }

  checkUnstage({ varId1, varId2 }: PossumAst.Unstage, loc: Location): void {
    this.assertValidUnstage(varId1, loc);
    if (varId2) this.assertValidUnstage(varId2, loc);
  }

  assertValidVarUse(varId: PossumAst.VarId, loc: Location): void {
    if (!this.hasVar(varId)) {
      throw new Error(
        this.errorMessage(loc, `${varId} is used but never staged.`),
      );
    }
  }

  assertDistinctSpeakerAndSubject(
    speakerVarId: PossumAst.VarId,
    subjectVarId: PossumAst.VarId,
    loc: Location,
  ): void {
    if (speakerVarId === subjectVarId) {
      throw new Error(
        this.errorMessage(
          loc,
          `${speakerVarId} acts on itself in an invalid way.`,
        ),
      );
    }
  }

  assertValidUnstage(varId: PossumAst.VarId, loc: Location): void {
    if (!this.hasVar(varId)) {
      throw new Error(
        this.errorMessage(loc, `${varId} is unstaged but never staged.`),
      );
    }
  }

  assertValidGoto(labelId: PossumAst.LabelId, loc: Location): void {
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

function allVars(ast: PossumAst.Program): Vars {
  let vars: Vars = new Set();

  ast.acts.forEach((act) => {
    act.scenes.forEach((scene) => {
      scene.directions.forEach((direction) => {
        if (direction.type === "stage") {
          vars.add(direction.varId1);
          if (direction.varId2) {
            vars.add(direction.varId2);
          }
        }
      });
    });
  });

  return vars;
}

function labeledParts(ast: PossumAst.Program): LabeledParts {
  let parts: LabeledParts = {};

  ast.acts.forEach((act, actIndex) => {
    parts[act.actId] = { type: "act", actIndex };

    act.scenes.forEach((scene, sceneIndex) => {
      parts[scene.sceneId] = { type: "scene", actIndex, sceneIndex };
    });
  });

  return parts;
}

import * as PossumAst from "../possum/ast";
import * as Ast from "../horatio/ast";
import { Analyzer } from "./analyzer";
import { Generator } from "./generator";

type Characters = Record<PossumAst.VarId, string>;

export class Yorick {
  ast: PossumAst.Program;
  analyzer: Analyzer;
  gen: Generator;
  vars: PossumAst.VarId[];
  characters: Characters;

  constructor(ast: PossumAst.Program) {
    const analyzer = new Analyzer(ast);
    const gen = new Generator(JSON.stringify(ast));
    const vars = Array.from(analyzer.vars);

    this.ast = ast;
    this.analyzer = analyzer;
    this.gen = gen;
    this.vars = vars;
    this.characters = assignCharacters(vars, gen);
  }

  transpile() {
    this.analyzer.check();

    return this.buildProgram(this.ast);
  }

  buildProgram(program: PossumAst.Program): Ast.Program {
    const character = this.characterName(this.vars[0] as PossumAst.VarId);
    const adjective = this.gen.randomAdjective();
    const noun = this.gen.randomNoun();
    const title = `${character} and the ${adjective} ${noun}`;

    return new Ast.Program(
      this.buildComment(title),
      this.buildDeclarations(this.vars),
      this.buildParts(program.acts),
    );
  }

  buildComment(text: string): Ast.Comment {
    return new Ast.Comment(text);
  }

  buildDeclarations(vars: PossumAst.VarId[]): Ast.Declaration[] {
    return vars.map(
      (varId) =>
        new Ast.Declaration(
          this.buildCharacter(varId),
          this.buildComment(`the ${varId} variable`),
        ),
    );
  }

  buildParts(acts: PossumAst.Act[]): Ast.Part[] {
    return acts.map(
      (act) =>
        new Ast.Part(
          this.buildNumeral(act.actId),
          this.buildComment(camelToSentenceCase(act.actId)),
          this.buildSubparts(act.scenes),
        ),
    );
  }

  buildCharacter(varId: PossumAst.VarId): Ast.Character {
    return new Ast.Character(this.characterName(varId));
  }

  buildNumeral(label: PossumAst.LabelId): Ast.Numeral {
    const i = this.partIndex(label);
    return new Ast.Numeral(this.gen.romanNumeral(i + 1));
  }

  buildSubparts(scenes: PossumAst.Scene[]): Ast.Subpart[] {
    return scenes.map(
      (scene) =>
        new Ast.Subpart(
          this.buildNumeral(scene.sceneId),
          this.buildComment(camelToSentenceCase(scene.sceneId)),
          this.buildStage(scene.directions),
        ),
    );
  }

  buildStage(directions: PossumAst.Direction[]): Ast.Stage {
    return new Ast.Stage(directions.map((d) => this.buildDirection(d)));
  }

  buildDirection(direction: PossumAst.Direction): Ast.Dialogue | Ast.Presence {
    switch (direction.type) {
      case "dialogue":
        return this.buildDialogue(direction);
      case "stage":
        return this.buildEnter(direction);
      case "unstage":
        return this.buildExit(direction);
      case "unstage_all":
        return this.buildExitAll();
      default:
        const _: never = direction;
        throw new Error(`unexpected ast node ${direction}`);
    }
  }

  buildDialogue(dialogue: PossumAst.Dialogue): Ast.Dialogue {
    return new Ast.Dialogue([
      new Ast.Line(
        this.buildCharacter(dialogue.speakerVarId),
        dialogue.lines.map((statement) =>
          this.buildSentence(statement, dialogue.speakerVarId),
        ),
      ),
    ]);
  }

  buildSentence(
    statement: PossumAst.Statement,
    speakerVarId: PossumAst.VarId,
  ): Ast.Sentence {
    switch (statement.type) {
      case ".pop":
        return this.buildRecallSentence(statement);
      case ".print_char":
        return this.buildCharOutputSentence(statement);
      case ".print_int":
        return this.buildIntegerOutputSentence(statement);
      case ".push":
        return this.buildRememberSentence(statement, speakerVarId);
      case ".read_char":
        return this.buildCharInputSentence(statement);
      case ".read_int":
        return this.buildIntegerInputSentence(statement);
      case ".set":
        return this.buildAssignmentSentence(statement, speakerVarId);
      case "goto":
        return this.buildGotoSentence(statement);
      case "if":
        return this.buildResponseSentence(statement, speakerVarId);
      case "test_eq":
      case "test_gt":
      case "test_lt":
      case "test_not_eq":
      case "test_not_gt":
      case "test_not_lt":
        return this.buildQuestionSentence(statement, speakerVarId);
      default:
        const _: never = statement;
        throw new Error(`unexpected ast node ${statement}`);
    }
  }

  buildRecallSentence(pop: PossumAst.Pop): Ast.RecallSentence {
    const adjective1 = this.gen.randomAdjective();
    const adjective2 = this.gen.randomAdjective();
    const noun = this.gen.randomNoun();
    return new Ast.RecallSentence(
      this.buildComment(`${adjective1} ${adjective2} ${noun}`),
      this.buildCharacter(pop.varId),
    );
  }

  buildCharOutputSentence(
    printChar: PossumAst.PrintChar,
  ): Ast.CharOutputSentence {
    return new Ast.CharOutputSentence(
      this.gen.random("output_char"),
      this.buildCharacter(printChar.varId),
    );
  }

  buildIntegerOutputSentence(
    printInt: PossumAst.PrintInt,
  ): Ast.IntegerOutputSentence {
    return new Ast.IntegerOutputSentence(
      this.gen.random("output_integer"),
      this.buildCharacter(printInt.varId),
    );
  }

  buildRememberSentence(
    push: PossumAst.Push,
    speakerVarId: PossumAst.VarId,
  ): Ast.RememberSentence {
    const pronoun =
      push.varId === speakerVarId
        ? this.buildFirstPersonPronoun()
        : this.buildSecondPersonPronoun();

    return new Ast.RememberSentence(pronoun, this.buildCharacter(push.varId));
  }

  buildAssignmentSentence(
    set: PossumAst.Set,
    speakerVarId: PossumAst.VarId,
  ): Ast.AssignmentSentence {
    return new Ast.AssignmentSentence(
      this.buildBe(
        set.varId === speakerVarId ? "be_first_person" : "be_second_person",
      ),
      this.buildValue(set.value),
      this.buildCharacter(set.varId),
    );
  }

  buildGotoSentence(goto: PossumAst.Goto): Ast.GotoSentence {
    const part = this.analyzer.partWithLabel(goto.labelId);
    return new Ast.GotoSentence(part.type, this.buildNumeral(goto.labelId));
  }

  buildResponseSentence(
    ifStatement: PossumAst.If,
    speakerVarId: PossumAst.VarId,
  ): Ast.ResponseSentence {
    return new Ast.ResponseSentence(
      this.buildSentence(ifStatement.then, speakerVarId),
      ifStatement.is,
    );
  }

  buildQuestionSentence(
    test: PossumAst.Test,
    speakerVarId: PossumAst.VarId,
  ): Ast.QuestionSentence {
    const value1 =
      test.left.type === "var"
        ? this.buildBeComparative(test.left.id, speakerVarId)
        : this.buildValue(test.left);
    const value2 = this.buildValue(test.right);
    const comparison = this.buildComparison(test);
    return new Ast.QuestionSentence(value1, comparison, value2);
  }

  buildValue(expression: PossumAst.Expression): Ast.Value {
    switch (expression.type) {
      case "arithmetic":
        return this.buildArithmeticOperationValue(expression);
      case "char":
        return this.buildCharConstantValue(expression);
      case "int":
        return this.buildIntConstantValue(expression);
      case "var":
        return this.builCharacterValue(expression);
      default:
        const _: never = expression;
        throw new Error(`unexpected ast node ${expression}`);
    }
  }

  buildEnter(stage: PossumAst.Stage): Ast.Enter {
    const char1 = this.buildCharacter(stage.varId1);
    if (stage.varId2) {
      const char2 = this.buildCharacter(stage.varId2);
      return new Ast.Enter(char1, char2);
    } else {
      return new Ast.Enter(char1);
    }
  }

  buildCharInputSentence(readChar: PossumAst.ReadChar): Ast.CharInputSentence {
    return new Ast.CharInputSentence(
      this.gen.random("input_char"),
      this.buildCharacter(readChar.varId),
    );
  }

  buildIntegerInputSentence(
    readInt: PossumAst.ReadInt,
  ): Ast.IntegerInputSentence {
    return new Ast.IntegerInputSentence(
      this.gen.random("input_integer"),
      this.buildCharacter(readInt.varId),
    );
  }

  buildExit(unstage: PossumAst.Unstage): Ast.Exit | Ast.Exeunt {
    const char1 = this.buildCharacter(unstage.varId1);
    const char2 = unstage.varId2 ? this.buildCharacter(unstage.varId2) : null;
    if (char2) {
      return new Ast.Exeunt(char1, char2);
    } else {
      return new Ast.Exit(char1);
    }
  }

  buildExitAll(): Ast.Exeunt {
    return new Ast.Exeunt();
  }

  buildBeComparative(
    subjectVarId: PossumAst.VarId,
    speakerVarId: PossumAst.VarId,
  ): Ast.BeComparative {
    if (subjectVarId === speakerVarId) {
      return new Ast.BeComparative(
        this.gen.random("be_comparatives_first_person"),
      );
    } else {
      return new Ast.BeComparative(
        this.gen.random("be_comparatives_second_person"),
      );
    }
  }

  buildComparison(test: PossumAst.Test): Ast.Comparison {
    switch (test.type) {
      case "test_eq":
        return new Ast.EqualToComparison(this.buildPositiveAdjective());
      case "test_gt":
        return new Ast.GreaterThanComparison(
          new Ast.PositiveComparative(this.gen.random("positive_comparatives")),
        );
      case "test_lt":
        return new Ast.LesserThanComparison(
          new Ast.NegativeComparative(this.gen.random("negative_comparatives")),
        );
      case "test_not_eq":
        return new Ast.InverseComparison(
          new Ast.EqualToComparison(this.buildNegativeAdjective()),
        );
      case "test_not_gt":
        return new Ast.InverseComparison(
          new Ast.GreaterThanComparison(
            new Ast.PositiveComparative(
              this.gen.random("positive_comparatives"),
            ),
          ),
        );
      case "test_not_lt":
        return new Ast.InverseComparison(
          new Ast.LesserThanComparison(
            new Ast.NegativeComparative(
              this.gen.random("negative_comparatives"),
            ),
          ),
        );
      default:
        const _: never = test.type;
        throw new Error(`unexpected ast node ${test}`);
    }
  }

  buildFirstPersonPronoun(): Ast.FirstPersonPronoun {
    return new Ast.FirstPersonPronoun(this.gen.random("first_person_pronouns"));
  }

  buildSecondPersonPronoun(): Ast.SecondPersonPronoun {
    return new Ast.SecondPersonPronoun(
      this.gen.random("second_person_pronouns"),
    );
  }

  buildBe(category: "be_first_person" | "be_second_person"): Ast.Be {
    return new Ast.Be(this.gen.random(category));
  }

  buildPositiveNoun(): Ast.PositiveNoun {
    return new Ast.PositiveNoun(this.gen.random("positive_nouns"));
  }

  buildNegativeNoun(): Ast.PositiveNoun {
    return new Ast.NegativeNoun(this.gen.random("negative_nouns"));
  }

  buildPositiveAdjective(): Ast.PositiveAdjective {
    return new Ast.PositiveAdjective(this.gen.random("positive_adjectives"));
  }

  buildNegativeAdjective(): Ast.NegativeAdjective {
    return new Ast.NegativeAdjective(this.gen.random("negative_adjectives"));
  }

  buildArithmeticOperationValue(
    arithmetic: PossumAst.Arithmetic,
  ): Ast.ArithmeticOperationValue {
    return new Ast.ArithmeticOperationValue(
      this.buildArithmeticOperator(arithmetic.op),
      this.buildValue(arithmetic.left),
      this.buildValue(arithmetic.right),
    );
  }

  buildArithmeticOperator(op: PossumAst.ArithmeticOp): Ast.ArithmeticOperator {
    switch (op) {
      case "+":
        return new Ast.ArithmeticOperator(this.gen.arithmeticOperator("add"));
      case "-":
        return new Ast.ArithmeticOperator(
          this.gen.arithmeticOperator("subtract"),
        );
      case "*":
        return new Ast.ArithmeticOperator(
          this.gen.arithmeticOperator("multiply"),
        );
      case "/":
        return new Ast.ArithmeticOperator(
          this.gen.arithmeticOperator("divide"),
        );
      case "%":
        return new Ast.ArithmeticOperator(
          this.gen.arithmeticOperator("modulo"),
        );
      default:
        throw new Error(`unexpected operator ${op}`);
    }
  }

  buildIntConstantValue(int: PossumAst.Int): Ast.Value {
    const n = int.value;

    if (n >= 0) {
      return this.buildPositiveNumber(n);
    } else {
      return this.buildNegativeNumber(n);
    }
  }

  buildCharConstantValue(char: PossumAst.Char): Ast.Value {
    const n = char.value.codePointAt(0);

    if (n != null) {
      return this.buildPositiveNumber(n);
    } else {
      throw new Error(`not a valid ascii character ${n}`);
    }
  }

  buildPositiveNumber(n: number): Ast.Value {
    const sizes = binaryDecomposition(n);
    const [firstSize, ...restSizes] = sizes;

    if (firstSize != null) {
      const first = this.buildPositiveConstantValue(firstSize);
      return restSizes.reduce(
        (acc: Ast.Value, size: number) =>
          new Ast.ArithmeticOperationValue(
            this.buildArithmeticOperator("+"),
            acc,
            this.buildPositiveConstantValue(size),
          ),
        first,
      );
    } else {
      return this.buildZeroValue();
    }
  }

  buildNegativeNumber(n: number): Ast.Value {
    const posN = Math.abs(n);
    const sizes = binaryDecomposition(posN);
    const [firstSize, ...restSizes] = sizes;

    if (firstSize != null) {
      const first = this.buildNegativeConstantValue(firstSize);
      return restSizes.reduce(
        (acc: Ast.Value, size: number) =>
          new Ast.ArithmeticOperationValue(
            this.buildArithmeticOperator("+"),
            acc,
            this.buildNegativeConstantValue(size),
          ),
        first,
      );
    } else {
      return this.buildZeroValue();
    }
  }

  buildPositiveConstantValue(size: number): Ast.PositiveConstantValue {
    const noun = this.buildPositiveNoun();
    const adjectives = Array.apply(null, Array(size)).map((_) =>
      this.buildPositiveAdjective(),
    );
    return new Ast.PositiveConstantValue(noun, adjectives);
  }

  buildNegativeConstantValue(size: number): Ast.PositiveConstantValue {
    const noun = this.buildNegativeNoun();
    const adjectives = Array.apply(null, Array(size)).map((_) =>
      this.buildNegativeAdjective(),
    );
    return new Ast.NegativeConstantValue(noun, adjectives);
  }

  buildZeroValue() {
    return new Ast.ZeroValue(this.gen.random("nothing"));
  }

  builCharacterValue(v: PossumAst.Var) {
    return new Ast.CharacterValue(this.buildCharacter(v.id));
  }

  characterName(varId: PossumAst.VarId): string {
    const name = this.characters[varId];

    if (name) {
      return name;
    } else {
      throw new Error(`${varId} not found`);
    }
  }

  partIndex(label: PossumAst.LabelId): number {
    const part = this.analyzer.partWithLabel(label);

    if (part.type === "act") {
      return part.actIndex;
    } else {
      return part.sceneIndex;
    }
  }
}

function assignCharacters(vars: PossumAst.VarId[], gen: Generator): Characters {
  let characters: Characters = {};

  vars.forEach((varId) => {
    characters[varId] = gen.reserveRandom("characters");
  });

  return characters;
}

function camelToSentenceCase(s: string): string {
  const [first, ...rest] = s.split(/(?=[A-Z])/);
  const restLower = rest.map((substr) => substr.toLowerCase());
  return [first, ...restLower].join(" ");
}

function binaryDecomposition(value: number) {
  let bit = 0;
  let result = [];
  while (Math.pow(2, bit) <= value) {
    if (Math.pow(2, bit) & value) result.push(bit);
    bit += 1;
  }
  return result;
}

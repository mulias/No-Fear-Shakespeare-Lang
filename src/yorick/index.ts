import * as OpheliaAst from "../ophelia/ast";
import * as Ast from "../horatio/ast";
import { Analyzer } from "./analyzer";
import { Generator } from "./generator";

type Characters = Record<string, string>;

export class Yorick {
  ast: OpheliaAst.Program;
  analyzer: Analyzer;
  gen: Generator;
  vars: string[];
  characters: Characters;

  constructor(ast: OpheliaAst.Program) {
    const analyzer = new Analyzer(ast);
    const gen = new Generator(JSON.stringify(ast));
    const vars = Array.from(analyzer.vars);

    this.ast = ast;
    this.analyzer = analyzer;
    this.gen = gen;
    this.vars = vars;
    this.characters = assignCharacters(vars, gen);
  }

  run() {
    this.analyzer.check();

    return this.buildProgram(this.ast);
  }

  buildProgram(program: OpheliaAst.Program): Ast.Program {
    let title: string;

    // Use provided title if available, otherwise generate one
    if (program.title) {
      title = this.convertTemplateStringToString(program.title);
    } else if (this.vars.length > 0) {
      const character = this.characterName(this.vars[0] as OpheliaAst.VarId);
      const adjective = this.gen.randomAdjective();
      const noun = this.gen.randomNoun();
      title = `${character} and the ${adjective} ${noun}`;
    } else {
      // No characters, just use adjectives and a noun
      const adjective1 = this.gen.randomAdjective();
      const adjective2 = this.gen.randomAdjective();
      const noun = this.gen.randomNoun();
      title = `The ${adjective1} ${adjective2} ${noun}`;
    }

    return new Ast.Program(
      this.buildComment(title),
      this.buildDeclarations(this.vars),
      this.buildParts(program.items),
    );
  }

  convertTemplateStringToString(templateString: OpheliaAst.TemplateString): string {
    return templateString.value
      .map((segment) => {
        if (segment.type === "template_string_segment") {
          return segment.value;
        } else if (segment.type === "template_var_segment") {
          const characterName = this.characterName(segment.value as OpheliaAst.VarId);
          return characterName;
        } else {
          throw new Error(`Unknown template segment type: ${(segment as any).type}`);
        }
      })
      .join("");
  }

  buildComment(text: string): Ast.Comment {
    return new Ast.Comment(text);
  }

  buildDeclarations(vars: string[]): Ast.Declaration[] {
    return vars.map((varId) => {
      const templateDescription = this.ast.varDeclarations.get(varId);
      const description = templateDescription 
        ? this.convertTemplateStringToString(templateDescription)
        : `the ${varId} variable`;

      return new Ast.Declaration(
        this.buildCharacter(varId),
        this.buildComment(description),
      );
    });
  }

  buildParts(items: OpheliaAst.ProgramItem[]): Ast.Part[] {
    // Filter out comments and only process acts
    const acts = items.filter(
      (item) => item.type === "act",
    ) as OpheliaAst.Act[];
    return acts.map(
      (act) =>
        new Ast.Part(
          this.buildNumeral(act.actId),
          this.buildComment(
            act.description 
              ? this.convertTemplateStringToString(act.description)
              : camelToSentenceCase(act.actId)
          ),
          this.buildSubparts(act.items),
        ),
    );
  }

  buildCharacter(varId: OpheliaAst.VarId): Ast.Character {
    return new Ast.Character(this.characterName(varId));
  }

  buildNumeral(label: OpheliaAst.LabelId): Ast.Numeral {
    const i = this.partIndex(label);
    return new Ast.Numeral(this.gen.romanNumeral(i + 1));
  }

  buildSubparts(items: OpheliaAst.ActItem[]): Ast.Subpart[] {
    // Filter out comments and only process scenes
    const scenes = items.filter(
      (item) => item.type === "scene",
    ) as OpheliaAst.Scene[];
    return scenes.map(
      (scene) =>
        new Ast.Subpart(
          this.buildNumeral(scene.sceneId),
          this.buildComment(
            scene.description 
              ? this.convertTemplateStringToString(scene.description)
              : camelToSentenceCase(scene.sceneId),
          ),
          this.buildStage(scene.directions),
        ),
    );
  }

  buildStage(directions: OpheliaAst.Direction[]): Ast.Stage {
    // Filter out comments - Yorick ignores them
    const nonCommentDirections = directions.filter((d) => d.type !== "comment");
    return new Ast.Stage(
      nonCommentDirections.map((d) => this.buildDirection(d)),
    );
  }

  buildDirection(direction: OpheliaAst.Direction): Ast.Dialogue | Ast.Presence {
    switch (direction.type) {
      case "dialogue":
        return this.buildDialogue(direction);
      case "stage":
        return this.buildEnter(direction);
      case "unstage":
        return this.buildExit(direction);
      case "unstage_all":
        return this.buildExitAll();
      case "comment":
        // Comments are filtered out in buildStage, so this should never be reached
        throw new Error(
          `Comments should be filtered out before reaching buildDirection`,
        );
      default:
        const _: never = direction;
        throw new Error(`unexpected ast node ${direction}`);
    }
  }

  buildDialogue(dialogue: OpheliaAst.Dialogue): Ast.Dialogue {
    // Filter out comments from dialogue lines
    const statements = dialogue.lines.filter(
      (line) => line.type !== "comment",
    ) as OpheliaAst.Statement[];
    return new Ast.Dialogue([
      new Ast.Line(
        this.buildCharacter(dialogue.speakerVarId),
        statements.map((statement) =>
          this.buildSentence(statement, dialogue.speakerVarId),
        ),
      ),
    ]);
  }

  buildSentence(
    statement: OpheliaAst.Statement,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.Sentence {
    switch (statement.type) {
      case ".pop":
        return this.buildRecallSentence(statement);
      case ".print_char":
        return this.buildCharOutputSentence(statement);
      case ".print_int":
        return this.buildIntegerOutputSentence(statement);
      case ".push_self":
        return this.buildRememberSelfSentence(statement);
      case ".push_me":
        return this.buildRememberMeSentence(statement, speakerVarId);
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

  buildRecallSentence(pop: OpheliaAst.Pop): Ast.RecallSentence {
    const adjective1 = this.gen.randomAdjective();
    const adjective2 = this.gen.randomAdjective();
    const noun = this.gen.randomNoun();
    return new Ast.RecallSentence(
      this.buildComment(`${adjective1} ${adjective2} ${noun}`),
      // No subject means it acts on @you
      undefined,
    );
  }

  buildCharOutputSentence(
    printChar: OpheliaAst.PrintChar,
  ): Ast.CharOutputSentence {
    return new Ast.CharOutputSentence(
      this.gen.random("output_char"),
      // No subject means it acts on @you
      undefined,
    );
  }

  buildIntegerOutputSentence(
    printInt: OpheliaAst.PrintInt,
  ): Ast.IntegerOutputSentence {
    return new Ast.IntegerOutputSentence(
      this.gen.random("output_integer"),
      // No subject means it acts on @you
      undefined,
    );
  }

  buildRememberSelfSentence(push: OpheliaAst.PushSelf): Ast.RememberSentence {
    // Use reflexive pronoun for "Remember thyself/yourself"
    const reflexivePronoun = new Ast.SecondPersonPronoun(
      this.gen.random("second_person_reflexive"),
    );
    return new Ast.RememberSentence(
      reflexivePronoun,
      undefined, // No character needed
    );
  }

  buildRememberMeSentence(
    push: OpheliaAst.PushMe,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.RememberSentence {
    return new Ast.RememberSentence(
      this.buildFirstPersonPronoun(), // "me"
      this.buildCharacter(speakerVarId), // The speaker
    );
  }

  buildAssignmentSentence(
    set: OpheliaAst.Set,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.AssignmentSentence {
    return new Ast.AssignmentSentence(
      this.buildBe("be_second_person"), // Always acts on @you
      this.buildValue(set.value),
      undefined, // No explicit character needed, it's always @you
    );
  }

  buildGotoSentence(goto: OpheliaAst.Goto): Ast.GotoSentence {
    const part = this.analyzer.partWithLabel(goto.labelId);
    const numeral = this.buildNumeral(goto.labelId);

    // Access wordlists directly since they're not in the generator's Category type
    const wordlists = (this.gen as any).wordlists;
    const imperatives = wordlists.imperatives || ["Let us", "let us"];
    const proceed = wordlists.proceed || ["proceed", "return"];

    // Pick random words
    const imperative = imperatives[this.gen.randomIndex(imperatives)];
    const returnWord = proceed[this.gen.randomIndex(proceed)];
    const toWord = "to";
    const partWord = part.type === "act" ? "act" : "scene";

    // Construct the full source text
    const sourceText = `${imperative} ${returnWord} ${toWord} ${partWord} ${numeral.sequence}`;

    return new Ast.GotoSentence(sourceText, part.type, numeral);
  }

  buildResponseSentence(
    ifStatement: OpheliaAst.If,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.ResponseSentence {
    return new Ast.ResponseSentence(
      this.buildSentence(ifStatement.then, speakerVarId),
      ifStatement.is,
    );
  }

  buildQuestionSentence(
    test: OpheliaAst.Test,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.QuestionSentence {
    let prefix: string;
    let value1: Ast.BeComparative | Ast.Value;

    if (test.left.type === "var") {
      const beComparative = this.buildBeComparative(test.left.id, speakerVarId);
      prefix = beComparative.sequence;
      value1 = beComparative;
    } else {
      prefix = "Is";
      value1 = this.buildValue(test.left);
    }

    const value2 = this.buildValue(test.right);
    const comparison = this.buildComparison(test);
    return new Ast.QuestionSentence(prefix, value1, comparison, value2);
  }

  buildValue(expression: OpheliaAst.Expression): Ast.Value {
    switch (expression.type) {
      case "arithmetic":
        return this.buildArithmeticOperationValue(expression);
      case "char":
        return this.buildCharConstantValue(expression);
      case "int":
        return this.buildIntConstantValue(expression);
      case "var":
        return this.builCharacterValue(expression);
      case "you":
        return new Ast.PronounValue(
          new Ast.SecondPersonPronoun(this.gen.random("second_person_pronouns"))
        );
      default:
        const _: never = expression;
        throw new Error(`unexpected ast node ${expression}`);
    }
  }

  buildEnter(stage: OpheliaAst.Stage): Ast.Enter {
    const char1 = this.buildCharacter(stage.varId1);
    if (stage.varId2) {
      const char2 = this.buildCharacter(stage.varId2);
      return new Ast.Enter(char1, char2);
    } else {
      return new Ast.Enter(char1);
    }
  }

  buildCharInputSentence(readChar: OpheliaAst.ReadChar): Ast.CharInputSentence {
    return new Ast.CharInputSentence(
      this.gen.random("input_char"),
      undefined, // Always acts on @you
    );
  }

  buildIntegerInputSentence(
    readInt: OpheliaAst.ReadInt,
  ): Ast.IntegerInputSentence {
    return new Ast.IntegerInputSentence(
      this.gen.random("input_integer"),
      undefined, // Always acts on @you
    );
  }

  buildExit(unstage: OpheliaAst.Unstage): Ast.Exit | Ast.Exeunt {
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
    subjectVarId: OpheliaAst.VarId,
    speakerVarId: OpheliaAst.VarId,
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

  buildComparison(test: OpheliaAst.Test): Ast.Comparison {
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
    arithmetic: OpheliaAst.Arithmetic,
  ): Ast.ArithmeticOperationValue {
    return new Ast.ArithmeticOperationValue(
      this.buildArithmeticOperator(arithmetic.op),
      this.buildValue(arithmetic.left),
      this.buildValue(arithmetic.right),
    );
  }

  buildArithmeticOperator(op: OpheliaAst.ArithmeticOp): Ast.ArithmeticOperator {
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

  buildIntConstantValue(int: OpheliaAst.Int): Ast.Value {
    const n = int.value;

    if (n >= 0) {
      return this.buildPositiveNumber(n);
    } else {
      return this.buildNegativeNumber(n);
    }
  }

  buildCharConstantValue(char: OpheliaAst.Char): Ast.Value {
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

  builCharacterValue(v: OpheliaAst.Var) {
    return new Ast.CharacterValue(this.buildCharacter(v.id));
  }

  characterName(varId: OpheliaAst.VarId): string {
    const name = this.characters[varId];

    if (name) {
      return name;
    } else {
      throw new Error(`${varId} not found`);
    }
  }

  partIndex(label: OpheliaAst.LabelId): number {
    const part = this.analyzer.partWithLabel(label);

    if (part.type === "act") {
      return part.actIndex;
    } else {
      return part.sceneIndex;
    }
  }
}

function assignCharacters(
  vars: OpheliaAst.VarId[],
  gen: Generator,
): Characters {
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

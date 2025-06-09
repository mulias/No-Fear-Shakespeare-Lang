import * as OpheliaAst from "../ophelia/ast";
import * as Ast from "../horatio/ast";
import { Analyzer } from "./analyzer";
import { Generator } from "./generator";
import { UsageContext, getArticleForNoun } from "../horatio/wordlists/nouns";
import { sortAdjectivesByCategory } from "../horatio/wordlists/adjectives";

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

  convertTemplateStringToString(
    templateString: OpheliaAst.TemplateString,
  ): string {
    return templateString.value
      .map((segment) => {
        if (segment.type === "template_string_segment") {
          return segment.value;
        } else if (segment.type === "template_var_segment") {
          const characterName = this.characterName(
            segment.value as OpheliaAst.VarId,
          );
          return characterName;
        } else {
          throw new Error(
            `Unknown template segment type: ${(segment as any).type}`,
          );
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
              : camelToSentenceCase(act.actId),
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
    const stageDirections: (Ast.Dialogue | Ast.Presence)[] = [];

    for (const direction of nonCommentDirections) {
      const result = this.buildDirection(direction);
      if (Array.isArray(result)) {
        // Handle multiple Enter directives
        stageDirections.push(...result);
      } else {
        stageDirections.push(result);
      }
    }

    return new Ast.Stage(stageDirections);
  }

  buildDirection(
    direction: OpheliaAst.Direction,
  ): Ast.Dialogue | Ast.Presence | Ast.Enter[] {
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
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.RecallSentence(
      this.buildComment(`${adjective1} ${adjective2} ${noun}`),
      // No subject means it acts on @you
      undefined,
      exclaimed,
      pop.followedByBlankLine,
    );
  }

  buildCharOutputSentence(
    printChar: OpheliaAst.PrintChar,
  ): Ast.CharOutputSentence {
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.CharOutputSentence(
      this.gen.random("output_char"),
      // No subject means it acts on @you
      undefined,
      exclaimed,
      printChar.followedByBlankLine,
    );
  }

  buildIntegerOutputSentence(
    printInt: OpheliaAst.PrintInt,
  ): Ast.IntegerOutputSentence {
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.IntegerOutputSentence(
      this.gen.random("output_integer"),
      // No subject means it acts on @you
      undefined,
      exclaimed,
      printInt.followedByBlankLine,
    );
  }

  buildRememberSelfSentence(push: OpheliaAst.PushSelf): Ast.RememberSentence {
    // Use reflexive pronoun for "Remember thyself/yourself"
    const reflexivePronoun = new Ast.SecondPersonPronoun(
      this.gen.random("second_person_reflexive"),
    );
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.RememberSentence(
      reflexivePronoun,
      undefined, // No character needed
      exclaimed,
      push.followedByBlankLine,
    );
  }

  buildRememberMeSentence(
    push: OpheliaAst.PushMe,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.RememberSentence {
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.RememberSentence(
      this.buildFirstPersonPronoun(), // "me"
      this.buildCharacter(speakerVarId), // The speaker
      exclaimed,
      push.followedByBlankLine,
    );
  }

  buildAssignmentSentence(
    set: OpheliaAst.Set,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.AssignmentSentence {
    const value = set.value;

    // For all other values, build the value first to check its type
    const builtValue = this.buildValue(
      value,
      UsageContext.ASSIGNMENT,
      speakerVarId,
    );

    // Use direct assignment only for simple non-zero integer constants that don't become arithmetic
    if (
      value.type === "int" &&
      value.value !== 0 &&
      !(builtValue instanceof Ast.ArithmeticOperationValue)
    ) {
      const constantValue = this.buildValue(
        value,
        UsageContext.DIRECT_ASSIGNMENT,
        speakerVarId,
      );

      const exclaimed = this.gen.randomPercent() < 0.15;
      return new Ast.AssignmentSentence(
        new Ast.Be("You"), // Just "You" for direct assignments
        constantValue,
        undefined, // no subject
        undefined, // no comparative - direct assignment
        exclaimed,
        set.followedByBlankLine,
      );
    }

    // For zero, pronouns, variables, and expressions: use comparative form
    // "You are as [adjective] as [value]!" or "Thou art as [adjective] as [value]!"
    const be = this.buildBe("be_second_person");
    const adjective = this.buildPositiveAdjective();
    const comparativeValue = this.buildValue(
      value,
      UsageContext.ASSIGNMENT,
      speakerVarId,
    );
    const exclaimed = this.gen.randomPercent() < 0.15;

    return new Ast.AssignmentSentence(
      be,
      comparativeValue,
      undefined, // no subject - always acts on @you
      adjective, // comparative adjective for "as [adj] as" form
      exclaimed,
      set.followedByBlankLine,
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

    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.GotoSentence(
      sourceText,
      part.type,
      numeral,
      exclaimed,
      goto.followedByBlankLine,
    );
  }

  buildResponseSentence(
    ifStatement: OpheliaAst.If,
    speakerVarId: OpheliaAst.VarId,
  ): Ast.ResponseSentence {
    return new Ast.ResponseSentence(
      this.buildSentence(ifStatement.then, speakerVarId),
      ifStatement.is,
      ifStatement.followedByBlankLine,
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
      value1 = this.buildValue(
        test.left,
        UsageContext.COMPARISON,
        speakerVarId,
      );
    }

    const value2 = this.buildValue(
      test.right,
      UsageContext.COMPARISON,
      speakerVarId,
    );
    const comparison = this.buildComparison(test);
    return new Ast.QuestionSentence(
      prefix,
      value1,
      comparison,
      value2,
      test.followedByBlankLine,
    );
  }

  buildValue(
    expression: OpheliaAst.Expression,
    context?: UsageContext,
    speakerVarId?: OpheliaAst.VarId,
  ): Ast.Value {
    switch (expression.type) {
      case "arithmetic":
        // Special case: convert "2 * X" to "twice X"
        if (
          expression.op === "*" &&
          expression.left.type === "int" &&
          expression.left.value === 2
        ) {
          return new Ast.UnaryOperationValue(
            new Ast.UnaryOperator("twice"),
            this.buildValue(expression.right, context, speakerVarId),
          );
        }
        return this.buildArithmeticOperationValue(
          expression,
          context,
          speakerVarId,
        );
      case "unary":
        return this.buildUnaryOperationValue(expression, context, speakerVarId);
      case "char":
        return this.buildCharConstantValue(expression, context);
      case "int":
        return this.buildIntConstantValue(expression, context);
      case "var":
        return this.buildVariableValue(expression, speakerVarId);
      case "you":
        return new Ast.PronounValue(
          new Ast.SecondPersonPronoun(
            this.gen.random("second_person_pronouns"),
          ),
        );
      default:
        const _: never = expression;
        throw new Error(`unexpected ast node ${expression}`);
    }
  }

  buildEnter(stage: OpheliaAst.Stage): Ast.Enter {
    const { varIds } = stage;

    if (varIds.length === 0) {
      throw new Error("Stage must have at least one character");
    }

    // Build all characters
    const characters = varIds.map((varId) => this.buildCharacter(varId));
    return new Ast.Enter(characters);
  }

  buildCharInputSentence(readChar: OpheliaAst.ReadChar): Ast.CharInputSentence {
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.CharInputSentence(
      this.gen.random("input_char"),
      undefined, // Always acts on @you
      exclaimed,
      readChar.followedByBlankLine,
    );
  }

  buildIntegerInputSentence(
    readInt: OpheliaAst.ReadInt,
  ): Ast.IntegerInputSentence {
    const exclaimed = this.gen.randomPercent() < 0.15;
    return new Ast.IntegerInputSentence(
      this.gen.random("input_integer"),
      undefined, // Always acts on @you
      exclaimed,
      readInt.followedByBlankLine,
    );
  }

  buildExit(unstage: OpheliaAst.Unstage): Ast.Exit | Ast.Exeunt {
    const { varIds } = unstage;

    if (varIds.length === 0) {
      throw new Error("Unstage must have at least one character");
    }

    if (varIds.length === 1) {
      const char1 = this.buildCharacter(varIds[0]!);
      return new Ast.Exit(char1);
    } else {
      // 2 or more characters
      const characters = varIds.map((varId) => this.buildCharacter(varId));
      return new Ast.Exeunt(characters);
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
    context?: UsageContext,
    speakerVarId?: OpheliaAst.VarId,
  ): Ast.ArithmeticOperationValue {
    return new Ast.ArithmeticOperationValue(
      this.buildArithmeticOperator(arithmetic.op),
      this.buildValue(
        arithmetic.left,
        UsageContext.ARITHMETIC_OPERAND,
        speakerVarId,
      ),
      this.buildValue(
        arithmetic.right,
        UsageContext.ARITHMETIC_OPERAND,
        speakerVarId,
      ),
    );
  }

  buildUnaryOperationValue(
    unary: OpheliaAst.Unary,
    context?: UsageContext,
    speakerVarId?: OpheliaAst.VarId,
  ): Ast.UnaryOperationValue {
    return new Ast.UnaryOperationValue(
      this.buildUnaryOperator(unary.op),
      this.buildValue(unary.operand, context, speakerVarId),
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

  buildUnaryOperator(op: OpheliaAst.UnaryOp): Ast.UnaryOperator {
    const opMap: Record<OpheliaAst.UnaryOp, string> = {
      square: "square of",
      cube: "cube of",
      square_root: "square root of",
      factorial: "factorial of",
    };

    return new Ast.UnaryOperator(opMap[op]);
  }

  buildIntConstantValue(
    int: OpheliaAst.Int,
    context?: UsageContext,
  ): Ast.Value {
    const n = int.value;

    if (n >= 0) {
      return this.buildPositiveNumber(n, context);
    } else {
      return this.buildNegativeNumber(n, context);
    }
  }

  buildCharConstantValue(
    char: OpheliaAst.Char,
    context?: UsageContext,
  ): Ast.Value {
    const n = char.value.codePointAt(0);

    if (n != null) {
      return this.buildPositiveNumber(n, context);
    } else {
      throw new Error(`not a valid ascii character ${n}`);
    }
  }

  buildPositiveNumber(n: number, context?: UsageContext): Ast.Value {
    const sizes = binaryDecomposition(n);
    const [firstSize, ...restSizes] = sizes;

    if (firstSize != null) {
      const first = this.buildPositiveConstantValue(firstSize, context);
      return restSizes.reduce(
        (acc: Ast.Value, size: number) =>
          new Ast.ArithmeticOperationValue(
            this.buildArithmeticOperator("+"),
            acc,
            this.buildPositiveConstantValue(
              size,
              UsageContext.ARITHMETIC_OPERAND,
            ),
          ),
        first,
      );
    } else {
      return this.buildZeroValue();
    }
  }

  buildNegativeNumber(n: number, context?: UsageContext): Ast.Value {
    const posN = Math.abs(n);
    const sizes = binaryDecomposition(posN);
    const [firstSize, ...restSizes] = sizes;

    if (firstSize != null) {
      const first = this.buildNegativeConstantValue(firstSize, context);
      return restSizes.reduce(
        (acc: Ast.Value, size: number) =>
          new Ast.ArithmeticOperationValue(
            this.buildArithmeticOperator("+"),
            acc,
            this.buildNegativeConstantValue(
              size,
              UsageContext.ARITHMETIC_OPERAND,
            ),
          ),
        first,
      );
    } else {
      return this.buildZeroValue();
    }
  }

  buildPositiveConstantValue(
    size: number,
    context?: UsageContext,
  ): Ast.PositiveConstantValue {
    const noun = this.buildPositiveNoun();
    const adjectives = Array.apply(null, Array(size)).map((_) =>
      this.buildPositiveAdjective(),
    );

    // Sort adjectives by their relational category
    const adjectiveStrings = adjectives.map((adj) => adj.sequence);
    const sortedAdjectiveStrings = sortAdjectivesByCategory(adjectiveStrings);
    const sortedAdjectives = sortedAdjectiveStrings.map(
      (adjStr) => new Ast.PositiveAdjective(adjStr),
    );

    // Use the noun database to determine the correct article
    const firstWord = sortedAdjectives[0]
      ? sortedAdjectives[0].sequence
      : noun.sequence;
    const article = getArticleForNoun(
      noun.sequence,
      context || UsageContext.ASSIGNMENT,
      sortedAdjectives.length > 0,
      firstWord,
    );

    return new Ast.PositiveConstantValue(
      noun,
      sortedAdjectives,
      article,
      context,
    );
  }

  buildNegativeConstantValue(
    size: number,
    context?: UsageContext,
  ): Ast.PositiveConstantValue {
    const noun = this.buildNegativeNoun();
    const adjectives = Array.apply(null, Array(size)).map((_) =>
      this.buildNegativeAdjective(),
    );

    // Sort adjectives by their relational category
    const adjectiveStrings = adjectives.map((adj) => adj.sequence);
    const sortedAdjectiveStrings = sortAdjectivesByCategory(adjectiveStrings);
    const sortedAdjectives = sortedAdjectiveStrings.map(
      (adjStr) => new Ast.NegativeAdjective(adjStr),
    );

    // Use the noun database to determine the correct article
    const firstWord = sortedAdjectives[0]
      ? sortedAdjectives[0].sequence
      : noun.sequence;
    const article = getArticleForNoun(
      noun.sequence,
      context || UsageContext.ASSIGNMENT,
      sortedAdjectives.length > 0,
      firstWord,
    );

    return new Ast.NegativeConstantValue(
      noun,
      sortedAdjectives,
      article,
      context,
    );
  }

  buildZeroValue() {
    return new Ast.ZeroValue(this.gen.random("nothing"));
  }

  builCharacterValue(v: OpheliaAst.Var) {
    return new Ast.CharacterValue(this.buildCharacter(v.id));
  }

  buildVariableValue(
    v: OpheliaAst.Var,
    speakerVarId?: OpheliaAst.VarId,
  ): Ast.Value {
    // Convert variables to appropriate pronouns based on speaker context
    if (v.id === "@you") {
      // @you (addressee) becomes second person reflexive pronoun
      return new Ast.PronounValue(
        new Ast.SecondPersonPronoun(this.gen.random("second_person_reflexive")),
      );
    } else if (speakerVarId && v.id === speakerVarId) {
      // If the variable is the speaker, use first person pronoun
      return new Ast.PronounValue(this.buildFirstPersonPronoun());
    } else {
      // For other variables, use character references
      return new Ast.CharacterValue(this.buildCharacter(v.id));
    }
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

import Token from "./token";
import Tokenizer from "./tokenizer";
import * as AST from "./ast";

/**
 * Parses an SPL program and generates an AST.
 * @memberof Horatio
 * @param {string} input - The SPL program to parse
 */
export default class Parser {
  tokenizer: Tokenizer;
  currentToken: Token | number | null;

  constructor(input: string) {
    this.tokenizer = new Tokenizer(input);
    this.currentToken = null;
  }

  isToken(token: Token | number | null): token is Token {
    return typeof token === "object" && token !== null;
  }

  getCurrentTokenKind(): number {
    if (this.isToken(this.currentToken)) {
      return this.currentToken.kind;
    }
    throw this.unexpectedTokenError();
  }

  /**
   * Accept the current token if it matches an expected kind
   * @param  {number}      expectedKind - The byte value of the expected token
   * @throws {SyntaxError}              - Throws syntax error if current token kind does not match expected token kind.
   */
  accept(expectedKind: number): void {
    if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === expectedKind
    ) {
      this.currentToken = this.tokenizer.nextToken();
    } else {
      throw this.unexpectedTokenError();
    }
  }

  /**
   * Accept the current token regardless of kind
   */
  acceptIt(): void {
    this.currentToken = this.tokenizer.nextToken();
  }

  acceptIf(test: (token: Token) => boolean): void {
    if (this.isToken(this.currentToken) && test(this.currentToken)) {
      this.currentToken = this.tokenizer.nextToken();
    } else {
      throw this.unexpectedTokenError();
    }
  }

  /**
   * Parse the SPL program and return an AST
   * @returns {AST.Program} - The program AST.
   */
  parse() {
    this.currentToken = this.tokenizer.nextToken();
    let program = this.parseProgram();
    if (this.currentToken !== -1) {
      if (this.isToken(this.currentToken)) {
        throw new Error(
          `Syntax Error - unexpected token after program end: "${this.currentToken.sequence}" (kind: ${this.currentToken.kind})`,
        );
      } else {
        throw new Error(
          `Syntax Error - unexpected end of program, remaining token: ${this.currentToken}`,
        );
      }
    }
    return program;
  }

  /* Parsers */
  parseProgram() {
    let comment = this.parseTitle();
    this.acceptIf(Token.isSentenceEndPunctuation);
    let declarations = [this.parseDeclaration()];
    while (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.CHARACTER
    ) {
      declarations.push(this.parseDeclaration());
    }

    let parts = [this.parsePart()];
    while (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.ACT
    ) {
      parts.push(this.parsePart());
    }

    return new AST.Program(comment, declarations, parts);
  }

  parseTitle() {
    let title = "";
    let lastWasPunctuation = false;
    while (
      this.currentToken !== null &&
      this.currentToken !== -1 &&
      !Token.isSentenceEndPunctuation(this.currentToken as Token)
    ) {
      if (this.isToken(this.currentToken)) {
        // Convert punctuation tokens back to their original form
        let sequence = this.currentToken.sequence;
        let isPunctuation = false;
        switch (this.currentToken.kind) {
          case Token.COMMA:
            sequence = ",";
            isPunctuation = true;
            break;
          case Token.COLON:
            sequence = ":";
            isPunctuation = true;
            break;
          case Token.EXCLAMATION_POINT:
            sequence = "!";
            isPunctuation = true;
            break;
          case Token.QUESTION_MARK:
            sequence = "?";
            isPunctuation = true;
            break;
          // PERIOD is sentence end punctuation, so we don't need it here
        }

        // Add space before token if needed (not for punctuation)
        if (title.length > 0 && !isPunctuation && !lastWasPunctuation) {
          title += " ";
        }
        title += sequence;

        // Add space after punctuation
        if (isPunctuation) {
          title += " ";
        }

        lastWasPunctuation = isPunctuation;
      }
      this.acceptIt();
    }
    return new AST.Comment(title.trim());
  }

  parseComment() {
    let comment = "";
    let lastWasPunctuation = false;
    while (
      this.currentToken !== null &&
      this.currentToken !== -1 &&
      !Token.isStatementPunctuation(this.currentToken as Token)
    ) {
      if (this.isToken(this.currentToken)) {
        // Convert punctuation tokens back to their original form
        let sequence = this.currentToken.sequence;
        let isPunctuation = false;
        switch (this.currentToken.kind) {
          case Token.COMMA:
            sequence = ",";
            isPunctuation = true;
            break;
          case Token.COLON:
            sequence = ":";
            isPunctuation = true;
            break;
          case Token.EXCLAMATION_POINT:
            sequence = "!";
            isPunctuation = true;
            break;
          case Token.QUESTION_MARK:
            sequence = "?";
            isPunctuation = true;
            break;
          // PERIOD is statement punctuation, so we don't need it here
        }

        // Add space before token if needed (not for punctuation)
        if (comment.length > 0 && !isPunctuation && !lastWasPunctuation) {
          comment += " ";
        }
        comment += sequence;

        // Add space after punctuation
        if (isPunctuation) {
          comment += " ";
        }

        lastWasPunctuation = isPunctuation;
      }
      this.acceptIt();
    }
    return new AST.Comment(comment.trim());
  }

  parseDeclaration() {
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let character = new AST.Character(this.currentToken.sequence);

    if (this.currentToken.kind === Token.CHARACTER) {
      this.acceptIt();
    } else {
      throw new Error(
        `${this.currentToken.sequence} is not a known Shakespeare character`,
      );
    }

    this.accept(Token.COMMA);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    return new AST.Declaration(character, comment);
  }

  parsePart() {
    this.accept(Token.ACT);
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let numeral = new AST.Numeral(this.currentToken.sequence);
    this.accept(Token.ROMAN_NUMERAL);
    this.accept(Token.COLON);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    let subparts = [this.parseSubPart()];
    while (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.SCENE
    ) {
      subparts.push(this.parseSubPart());
    }
    return new AST.Part(numeral, comment, subparts);
  }

  parseSubPart() {
    this.accept(Token.SCENE);
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let numeral = new AST.Numeral(this.currentToken.sequence);
    this.accept(Token.ROMAN_NUMERAL);
    this.accept(Token.COLON);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    let stage = this.parseStage();
    return new AST.Subpart(numeral, comment, stage);
  }

  parseStage() {
    let directions: (AST.Presence | AST.Dialogue)[] = [];
    while (
      this.isToken(this.currentToken) &&
      (this.currentToken.kind === Token.LEFT_BRACKET ||
        this.currentToken.kind === Token.CHARACTER)
    ) {
      if (
        this.isToken(this.currentToken) &&
        this.currentToken.kind === Token.LEFT_BRACKET
      ) {
        let presence = this.parsePresence();
        if (presence) {
          directions.push(presence);
        }
      }
      if (
        this.isToken(this.currentToken) &&
        this.currentToken.kind === Token.CHARACTER
      ) {
        directions.push(this.parseDialogue());
      }
    }
    return new AST.Stage(directions);
  }

  parsePresence(): AST.Presence | undefined {
    this.accept(Token.LEFT_BRACKET);
    let c1, c2, ret: AST.Presence | undefined;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.ENTER:
        this.acceptIt();
        if (!this.isToken(this.currentToken)) {
          throw this.unexpectedTokenError();
        }

        // Parse character list
        const enterCharacters: AST.Character[] = [];

        // First character
        enterCharacters.push(new AST.Character(this.currentToken.sequence));
        this.accept(Token.CHARACTER);

        // Parse additional characters separated by commas or 'and'
        while (
          this.isToken(this.currentToken) &&
          (this.currentToken.kind === Token.COMMA ||
            this.currentToken.kind === Token.AMPERSAND ||
            this.currentToken.kind === Token.AND)
        ) {
          this.acceptIt(); // consume comma, ampersand or 'and'

          if (
            !this.isToken(this.currentToken) ||
            this.currentToken.kind !== Token.CHARACTER
          ) {
            throw this.unexpectedTokenError();
          }

          enterCharacters.push(new AST.Character(this.currentToken.sequence));
          this.acceptIt();
        }

        ret = new AST.Enter(enterCharacters);
        break;

      case Token.EXIT:
        this.acceptIt();
        if (!this.isToken(this.currentToken)) {
          throw this.unexpectedTokenError();
        }
        let character = new AST.Character(this.currentToken.sequence);
        this.accept(Token.CHARACTER);
        ret = new AST.Exit(character);
        break;

      case Token.EXEUNT:
        this.acceptIt();
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.CHARACTER
        ) {
          // Parse character list
          const characters: AST.Character[] = [];

          // First character
          characters.push(new AST.Character(this.currentToken.sequence));
          this.acceptIt();

          // Parse additional characters separated by commas or 'and'
          while (
            this.isToken(this.currentToken) &&
            (this.currentToken.kind === Token.COMMA ||
              this.currentToken.kind === Token.AMPERSAND ||
              this.currentToken.kind === Token.AND)
          ) {
            this.acceptIt(); // consume comma, ampersand or 'and'

            if (
              !this.isToken(this.currentToken) ||
              this.currentToken.kind !== Token.CHARACTER
            ) {
              throw this.unexpectedTokenError();
            }

            characters.push(new AST.Character(this.currentToken.sequence));
            this.acceptIt();
          }

          // Create Exeunt with appropriate constructor
          if (characters.length === 1) {
            // Single character - treat as error
            throw new Error(
              "Exeunt requires either no characters or at least two characters",
            );
          } else {
            ret = new AST.Exeunt(characters);
          }
        } else {
          ret = new AST.Exeunt();
        }
        break;
    }
    this.accept(Token.RIGHT_BRACKET);
    return ret;
  }

  parseDialogue() {
    let lines = [this.parseLine()];
    while (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.CHARACTER
    ) {
      lines.push(this.parseLine());
    }
    return new AST.Dialogue(lines);
  }

  parseLine() {
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let character = new AST.Character(this.currentToken.sequence);
    this.accept(Token.CHARACTER);
    this.accept(Token.COLON);
    let sentences: AST.Sentence[] = [];

    function isResponseSentence(kind: number) {
      return kind === Token.IF_SO || kind === Token.IF_NOT;
    }

    function isSentence(kind: number) {
      switch (kind) {
        case Token.BE:
        case Token.YOU:
        case Token.BE_COMPARATIVE:
        case Token.Is:
        case Token.IMPERATIVE:
        case Token.INPUT_INTEGER:
        case Token.INPUT_CHAR:
        case Token.OUTPUT_INTEGER:
        case Token.OUTPUT_CHAR:
        case Token.REMEMBER:
        case Token.RECALL:
          return true;
        default:
          return false;
      }
    }

    while (
      this.isToken(this.currentToken) &&
      (isResponseSentence(this.currentToken.kind) ||
        isSentence(this.currentToken.kind))
    ) {
      if (
        this.isToken(this.currentToken) &&
        isResponseSentence(this.currentToken.kind)
      ) {
        sentences.push(this.parseResponseSentence());
      } else {
        let sent = this.parseSentence();
        if (sent) sentences.push(sent);
      }
    }
    return new AST.Line(character, sentences);
  }

  parseResponseSentence() {
    if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.IF_SO
    ) {
      this.accept(Token.IF_SO);
      this.accept(Token.COMMA);
      let sentence = this.parseSentence();
      if (!sentence) throw this.unexpectedTokenError();
      return new AST.ResponseSentence(sentence, true);
    } else {
      this.accept(Token.IF_NOT);
      this.accept(Token.COMMA);
      let sentence = this.parseSentence();
      if (!sentence) throw this.unexpectedTokenError();
      return new AST.ResponseSentence(sentence, false);
    }
  }

  parseSentence(): AST.Sentence | undefined {
    let sentence: AST.Sentence | undefined;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.BE:
      case Token.YOU:
        sentence = this.parseAssignment();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          (sentence as AST.AssignmentSentence).exclaimed = true;
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.BE_COMPARATIVE:
      case Token.Is:
        sentence = this.parseQuestion();
        this.accept(Token.QUESTION_MARK);
        break;

      case Token.IMPERATIVE:
        sentence = this.parseGoto();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          (sentence as AST.GotoSentence).exclaimed = true;
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.INPUT_INTEGER:
      case Token.INPUT_CHAR:
        sentence = this.parseInput();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          if (sentence instanceof AST.IntegerInputSentence) {
            sentence.exclaimed = true;
          } else if (sentence instanceof AST.CharInputSentence) {
            sentence.exclaimed = true;
          }
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.OUTPUT_INTEGER:
      case Token.OUTPUT_CHAR:
        sentence = this.parseOutput();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          if (sentence instanceof AST.IntegerOutputSentence) {
            sentence.exclaimed = true;
          } else if (sentence instanceof AST.CharOutputSentence) {
            sentence.exclaimed = true;
          }
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.REMEMBER:
        sentence = this.parseRemember();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          (sentence as AST.RememberSentence).exclaimed = true;
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.RECALL:
        sentence = this.parseRecall();
        // Check for exclamation point before accepting punctuation
        if (
          this.isToken(this.currentToken) &&
          this.currentToken.kind === Token.EXCLAMATION_POINT
        ) {
          (sentence as AST.RecallSentence).exclaimed = true;
        }
        this.acceptIf(Token.isStatementPunctuation);
        break;

      default:
        throw this.unexpectedTokenError();
    }
    return sentence;
  }

  parseBe(): AST.Be | undefined {
    let be;
    if (
      this.isToken(this.currentToken) &&
      (this.currentToken.kind === Token.BE ||
        this.currentToken.kind === Token.YOU)
    ) {
      be = new AST.Be(this.currentToken.sequence);
      this.acceptIt();
    }
    return be;
  }

  parseAssignment() {
    let be = this.parseBe();
    if (!be) throw this.unexpectedTokenError();
    let comparative: AST.Adjective | undefined;

    // If the assignment starts with "You are", it MUST be followed by "as [adj] as"
    if (be.sequence === "You are" || be.sequence === "Thou art") {
      // "You are" must be followed by "as [adjective] as [value]"
      if (
        !this.isToken(this.currentToken) ||
        this.currentToken.kind !== Token.AS
      ) {
        throw new Error(
          `Syntax Error - Invalid assignment form. "${
            be.sequence
          }" must be followed by "as [adjective] as [value]". Got: ${
            this.isToken(this.currentToken)
              ? this.currentToken.sequence
              : this.currentToken
          }`,
        );
      }
      this.acceptIt();
      comparative = this.parseAdjective();
      this.accept(Token.AS);
    } else if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.AS
    ) {
      // Other forms of "be" can optionally have "as [adj] as"
      this.acceptIt();
      comparative = this.parseAdjective();
      this.accept(Token.AS);
    }

    let value = this.parseValue();
    return new AST.AssignmentSentence(be, value, undefined, comparative);
  }

  parseValue(): AST.Value {
    let value, pronoun;
    let article: string | undefined;
    if (
      this.isToken(this.currentToken) &&
      (this.currentToken.kind === Token.ARTICLE ||
        this.currentToken.kind === Token.FIRST_PERSON_POSSESSIVE ||
        this.currentToken.kind === Token.SECOND_PERSON_POSSESSIVE ||
        this.currentToken.kind === Token.THIRD_PERSON_POSSESSIVE)
    ) {
      if (this.currentToken.kind === Token.ARTICLE) {
        article = this.currentToken.sequence;
      }
      this.acceptIt();
    }
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.UNARY_OPERATOR:
        value = this.parseUnaryOperation();
        break;

      case Token.ARITHMETIC_OPERATOR:
        value = this.parseArithmeticOperation();
        break;

      case Token.POSITIVE_ADJECTIVE:
      case Token.NEUTRAL_ADJECTIVE:
      case Token.NEGATIVE_ADJECTIVE:
      case Token.POSITIVE_NOUN:
      case Token.NEUTRAL_NOUN:
      case Token.NEGATIVE_NOUN:
        value = this.parseConstant(article);
        break;

      case Token.NOTHING:
        value = new AST.ZeroValue(this.currentToken.sequence);
        this.acceptIt();
        break;

      case Token.FIRST_PERSON_PRONOUN:
        pronoun = new AST.FirstPersonPronoun(this.currentToken.sequence);
        value = new AST.PronounValue(pronoun);
        this.acceptIt();
        break;

      case Token.SECOND_PERSON_PRONOUN:
      case Token.YOU:
        pronoun = new AST.SecondPersonPronoun(this.currentToken.sequence);
        value = new AST.PronounValue(pronoun);
        this.acceptIt();
        break;

      case Token.CHARACTER:
        const character = new AST.Character(this.currentToken.sequence);
        value = new AST.CharacterValue(character);
        this.acceptIt();
        break;

      default:
        throw new Error(
          "Syntax Error - Unknown Token: " + this.currentToken.sequence,
        );
    }
    return value;
  }

  parseUnaryOperation(): AST.UnaryOperationValue {
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let operator = new AST.UnaryOperator(this.currentToken.sequence);
    this.accept(Token.UNARY_OPERATOR);
    let value = this.parseValue();
    return new AST.UnaryOperationValue(operator, value);
  }

  parseArithmeticOperation(): AST.ArithmeticOperationValue {
    if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.ARTICLE
    ) {
      this.acceptIt();
    }
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let operator = new AST.ArithmeticOperator(this.currentToken.sequence);
    this.accept(Token.ARITHMETIC_OPERATOR);
    let value_1 = this.parseValue();
    this.accept(Token.AND);
    let value_2 = this.parseValue();
    return new AST.ArithmeticOperationValue(operator, value_1, value_2);
  }

  parseConstant(article?: string) {
    let adjectives = [];
    let adjective;
    while (
      this.isToken(this.currentToken) &&
      this.currentToken.kind !== Token.POSITIVE_NOUN &&
      this.currentToken.kind !== Token.NEUTRAL_NOUN &&
      this.currentToken.kind !== Token.NEGATIVE_NOUN
    ) {
      if (!this.isToken(this.currentToken)) {
        throw this.unexpectedTokenError();
      }
      switch (this.currentToken.kind) {
        case Token.POSITIVE_ADJECTIVE:
          adjective = new AST.PositiveAdjective(this.currentToken.sequence);
          adjectives.push(adjective);
          this.acceptIt();
          break;
        case Token.NEUTRAL_ADJECTIVE:
          adjective = new AST.NeutralAdjective(this.currentToken.sequence);
          adjectives.push(adjective);
          this.acceptIt();
          break;
        case Token.NEGATIVE_ADJECTIVE:
          adjective = new AST.NeutralAdjective(this.currentToken.sequence);
          adjectives.push(adjective);
          this.acceptIt();
          break;
        default:
          throw this.unexpectedTokenError();
      }
    }
    let noun;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.POSITIVE_NOUN:
        noun = new AST.PositiveNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.PositiveConstantValue(noun, adjectives, article);
      case Token.NEUTRAL_NOUN:
        noun = new AST.NeutralNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.PositiveConstantValue(noun, adjectives, article);
      case Token.NEGATIVE_NOUN:
        noun = new AST.NegativeNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.NegativeConstantValue(noun, adjectives, article);
      default:
        throw this.unexpectedTokenError();
    }
  }

  parseQuestion() {
    let { prefix, value1 } = this.parseQuestionFirstValue();
    let comparison = this.parseComparative();
    let value2 = this.parseValue();
    return new AST.QuestionSentence(prefix, value1, comparison, value2);
  }

  parseQuestionFirstValue() {
    if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.BE_COMPARATIVE
    ) {
      const prefix = this.currentToken.sequence;
      const be_comparative = new AST.BeComparative(this.currentToken.sequence);
      this.acceptIt();
      return { prefix, value1: be_comparative };
    } else {
      if (!this.isToken(this.currentToken)) {
        throw this.unexpectedTokenError();
      }
      const prefix = this.currentToken.sequence; // Should be "Is"
      this.accept(Token.Is);
      const value1 = this.parseValue();
      return { prefix, value1 };
    }
  }

  parseComparative(): AST.Comparison {
    let comparison, comparative, adjective;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.POSITIVE_COMPARATIVE:
        comparative = new AST.PositiveComparative(this.currentToken.sequence);
        comparison = new AST.GreaterThanComparison(comparative);
        this.acceptIt();
        this.accept(Token.THAN);
        break;
      case Token.NEGATIVE_COMPARATIVE:
        comparative = new AST.NegativeComparative(this.currentToken.sequence);
        comparison = new AST.LesserThanComparison(comparative);
        this.acceptIt();
        this.accept(Token.THAN);
        break;

      case Token.AS:
        this.acceptIt();
        adjective = this.parseAdjective();
        if (!adjective) throw this.unexpectedTokenError();
        comparison = new AST.EqualToComparison(adjective);
        this.accept(Token.AS);
        break;

      case Token.NOT:
        this.acceptIt();
        comparative = this.parseComparative();
        comparison = new AST.InverseComparison(comparative);
        break;
      default:
        throw this.unexpectedTokenError();
    }
    return comparison!!!;
  }

  parseGoto() {
    // Capture the full source text for the goto statement
    let sourceText = "";

    // Capture "Let us" or similar imperative
    if (this.isToken(this.currentToken)) {
      sourceText += this.currentToken.sequence;
    }
    this.accept(Token.IMPERATIVE);

    // Capture "return" or "proceed"
    if (this.isToken(this.currentToken)) {
      sourceText += " " + this.currentToken.sequence;
    }
    this.accept(Token.RETURN);

    // Capture "to"
    if (this.isToken(this.currentToken)) {
      sourceText += " " + this.currentToken.sequence;
    }
    this.accept(Token.TO);

    if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.SCENE
    ) {
      // Capture "Scene" or "scene"
      sourceText += " " + this.currentToken.sequence;
      this.acceptIt();
      if (!this.isToken(this.currentToken)) {
        throw this.unexpectedTokenError();
      }
      // Capture the roman numeral
      sourceText += " " + this.currentToken.sequence;
      let numeral = new AST.Numeral(this.currentToken.sequence);
      this.accept(Token.ROMAN_NUMERAL);
      return new AST.GotoSentence(sourceText, "scene", numeral);
    } else if (
      this.isToken(this.currentToken) &&
      this.currentToken.kind === Token.ACT
    ) {
      // Capture "Act" or "act"
      sourceText += " " + this.currentToken.sequence;
      this.acceptIt();
      if (!this.isToken(this.currentToken)) {
        throw this.unexpectedTokenError();
      }
      // Capture the roman numeral
      sourceText += " " + this.currentToken.sequence;
      let numeral = new AST.Numeral(this.currentToken.sequence);
      this.accept(Token.ROMAN_NUMERAL);
      return new AST.GotoSentence(sourceText, "act", numeral);
    } else {
      throw this.unexpectedTokenError();
    }
  }

  parseInput() {
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let sequence = this.currentToken.sequence;
    let ret;
    switch (this.currentToken.kind) {
      case Token.INPUT_INTEGER:
        ret = new AST.IntegerInputSentence(sequence);
        break;
      case Token.INPUT_CHAR:
        ret = new AST.CharInputSentence(sequence);
        break;
    }
    this.acceptIt();
    return ret;
  }

  parseOutput() {
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    let sequence = this.currentToken.sequence;
    let ret;
    switch (this.currentToken.kind) {
      case Token.OUTPUT_INTEGER:
        ret = new AST.IntegerOutputSentence(sequence);
        break;
      case Token.OUTPUT_CHAR:
        ret = new AST.CharOutputSentence(sequence);
        break;
    }
    this.acceptIt();
    return ret;
  }

  parseRemember() {
    this.accept(Token.REMEMBER);
    let pronoun;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.FIRST_PERSON_PRONOUN:
        pronoun = new AST.FirstPersonPronoun(this.currentToken.sequence);
        this.acceptIt();
        break;
      case Token.SECOND_PERSON_PRONOUN:
      case Token.YOU:
        pronoun = new AST.SecondPersonPronoun(this.currentToken.sequence);
        this.acceptIt();
        break;
      default:
        throw this.unexpectedTokenError();
    }
    return new AST.RememberSentence(pronoun!!!);
  }

  parseRecall() {
    this.accept(Token.RECALL);
    this.acceptIf(
      (t) =>
        t.kind === Token.COMMA || t.kind === Token.SECOND_PERSON_POSSESSIVE,
    );
    let comment = "";
    while (
      this.currentToken !== null &&
      this.currentToken !== -1 &&
      !Token.isStatementPunctuation(this.currentToken as Token)
    ) {
      if (this.isToken(this.currentToken)) {
        comment += this.currentToken.sequence + " ";
      }
      this.acceptIt();
    }
    return new AST.RecallSentence(new AST.Comment(comment.trim()));
  }

  parseAdjective() {
    let adjective;
    if (!this.isToken(this.currentToken)) {
      throw this.unexpectedTokenError();
    }
    switch (this.currentToken.kind) {
      case Token.POSITIVE_ADJECTIVE:
        adjective = new AST.PositiveAdjective(this.currentToken.sequence);
        this.acceptIt();
        break;
      case Token.NEUTRAL_ADJECTIVE:
        adjective = new AST.NeutralAdjective(this.currentToken.sequence);
        this.acceptIt();
        break;
      case Token.NEGATIVE_ADJECTIVE:
        adjective = new AST.NegativeAdjective(this.currentToken.sequence);
        this.acceptIt();
        break;
      default:
        throw this.unexpectedTokenError();
    }
    return adjective;
  }

  unexpectedTokenError() {
    return new Error(
      `Syntax Error - Unexpected token: ${JSON.stringify(this.currentToken)}`,
    );
  }
}

import Token from "./token";
import Tokenizer from "./tokenizer";
import * as AST from "./ast";

/**
 * Parses an SPL program and generates an AST.
 * @memberof Horatio
 * @param {string} input - The SPL program to parse
 */
export default class Parser {
  constructor(input) {
    this.tokenizer = new Tokenizer(input);
    this.currentToken = null;
  }

  /**
   * Accept the current token if it matches an expected kind
   * @param  {number}      expectedKind - The byte value of the expected token
   * @throws {SyntaxError}              - Throws syntax error if current token kind does not match expected token kind.
   */
  accept(expectedKind) {
    if (this.currentToken.kind === expectedKind) {
      this.currentToken = this.tokenizer.nextToken();
    } else {
      throw this.unexpectedTokenError();
    }
  }

  /**
   * Accept the current token regardless of kind
   */
  acceptIt() {
    this.currentToken = this.tokenizer.nextToken();
  }

  acceptIf(test) {
    if (test(this.currentToken)) {
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
      throw new Error("Syntax Error - unexpected end of program");
    }
    return program;
  }

  /* Parsers */
  parseProgram() {
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    let declarations = [this.parseDeclaration()];
    while (this.currentToken.kind === Token.CHARACTER) {
      declarations.push(this.parseDeclaration());
    }
    let parts = [this.parsePart()];
    while (this.currentToken.kind === Token.ACT) {
      parts.push(this.parsePart());
    }
    return new AST.Program(comment, declarations, parts);
  }

  parseComment() {
    let comment = "";
    while (!Token.isStatementPunctuation(this.currentToken)) {
      comment += this.currentToken.sequence + " ";
      this.acceptIt();
    }
    return new AST.Comment(comment.trim());
  }

  parseDeclaration() {
    let character = new AST.Character(this.currentToken.sequence);
    this.accept(Token.CHARACTER);
    this.accept(Token.COMMA);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    return new AST.Declaration(character, comment);
  }

  parsePart() {
    this.accept(Token.ACT);
    let numeral = new AST.Numeral(this.currentToken.sequence);
    this.accept(Token.ROMAN_NUMERAL);
    this.accept(Token.COLON);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    let subparts = [this.parseSubPart()];
    while (this.currentToken.kind === Token.SCENE) {
      subparts.push(this.parseSubPart());
    }
    return new AST.Part(numeral, comment, subparts);
  }

  parseSubPart() {
    this.accept(Token.SCENE);
    let numeral = new AST.Numeral(this.currentToken.sequence);
    this.accept(Token.ROMAN_NUMERAL);
    this.accept(Token.COLON);
    let comment = this.parseComment();
    this.acceptIf(Token.isStatementPunctuation);
    let stage = this.parseStage();
    return new AST.Subpart(numeral, comment, stage);
  }

  parseStage() {
    let directions = [];
    while (
      this.currentToken.kind === Token.LEFT_BRACKET ||
      this.currentToken.kind === Token.CHARACTER
    ) {
      if (this.currentToken.kind === Token.LEFT_BRACKET) {
        directions.push(this.parsePresence());
      }
      if (this.currentToken.kind === Token.CHARACTER) {
        directions.push(this.parseDialogue());
      }
    }
    return new AST.Stage(directions);
  }

  parsePresence() {
    this.accept(Token.LEFT_BRACKET);
    let c1, c2, ret;
    switch (this.currentToken.kind) {
      case Token.ENTER:
        this.acceptIt();
        c1 = new AST.Character(this.currentToken.sequence);
        c2 = null;
        this.accept(Token.CHARACTER);
        if (
          this.currentToken.kind === Token.AMPERSAND ||
          this.currentToken.kind === Token.AND
        ) {
          this.acceptIt();
          c2 = new AST.Character(this.currentToken.sequence);
          this.accept(Token.CHARACTER);
        }
        ret = new AST.Enter(c1, c2);
        break;

      case Token.EXIT:
        this.acceptIt();
        let character = new AST.Character(this.currentToken.sequence);
        this.accept(Token.CHARACTER);
        ret = new AST.Exit(character);
        break;

      case Token.EXEUNT:
        this.acceptIt();
        if (this.currentToken.kind === Token.CHARACTER) {
          c1 = new AST.Character(this.currentToken.sequence);
          this.acceptIt();
          this.accept(Token.AMPERSAND);
          c2 = new AST.Character(this.currentToken.sequence);
          this.accept(Token.CHARACTER);
          ret = new AST.Exeunt(c1, c2);
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
    while (this.currentToken.kind === Token.CHARACTER) {
      lines.push(this.parseLine());
    }
    return new AST.Dialogue(lines);
  }

  parseLine() {
    let character = new AST.Character(this.currentToken.sequence);
    this.accept(Token.CHARACTER);
    this.accept(Token.COLON);
    let sentences = [];

    function isResponseSentence(kind) {
      return kind === Token.IF_SO || kind === Token.IF_NOT;
    }

    function isSentence(kind) {
      switch (kind) {
        case Token.BE:
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
      isResponseSentence(this.currentToken.kind) ||
      isSentence(this.currentToken.kind)
    ) {
      if (isResponseSentence(this.currentToken.kind)) {
        sentences.push(this.parseResponseSentence());
      } else {
        sentences.push(this.parseSentence());
      }
    }
    return new AST.Line(character, sentences);
  }

  parseResponseSentence() {
    if (this.currentToken.kind === Token.IF_SO) {
      this.accept(Token.IF_SO);
      this.accept(Token.COMMA);
      let sentence = this.parseSentence();
      return new AST.ResponseSentence(sentence, true);
    } else {
      this.accept(Token.IF_NOT);
      this.accept(Token.COMMA);
      let sentence = this.parseSentence();
      return new AST.ResponseSentence(sentence, false);
    }
  }

  parseSentence() {
    let sentence;
    switch (this.currentToken.kind) {
      case Token.BE:
        sentence = this.parseAssignment();
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.BE_COMPARATIVE:
      case Token.Is:
        sentence = this.parseQuestion();
        this.accept(Token.QUESTION_MARK);
        break;

      case Token.IMPERATIVE:
        sentence = this.parseGoto();
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.INPUT_INTEGER:
      case Token.INPUT_CHAR:
        sentence = this.parseInput();
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.OUTPUT_INTEGER:
      case Token.OUTPUT_CHAR:
        sentence = this.parseOutput();
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.REMEMBER:
        sentence = this.parseRemember();
        this.acceptIf(Token.isStatementPunctuation);
        break;

      case Token.RECALL:
        sentence = this.parseRecall();
        this.acceptIf(Token.isStatementPunctuation);
        break;
    }
    return sentence;
  }

  parseBe() {
    let be;
    if (this.currentToken.kind === Token.BE) {
      be = new AST.Be(this.currentToken.sequence);
      this.acceptIt();
    }
    return be;
  }

  parseAssignment() {
    let be = this.parseBe();
    if (this.currentToken.kind === Token.AS) {
      this.acceptIt();
      this.parseAdjective();
      this.accept(Token.AS);
    }
    let value = this.parseValue();
    return new AST.AssignmentSentence(be, value);
  }

  parseValue() {
    let value, pronoun;
    if (
      this.currentToken.kind === Token.ARTICLE ||
      this.currentToken.kind === Token.FIRST_PERSON_POSSESSIVE ||
      this.currentToken.kind === Token.SECOND_PERSON_POSSESSIVE ||
      this.currentToken.kind === Token.THIRD_PERSON_POSSESSIVE
    ) {
      this.acceptIt();
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
        value = this.parseConstant();
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
        pronoun = new AST.SecondPersonPronoun(this.currentToken.sequence);
        value = new AST.PronounValue(pronoun);
        this.acceptIt();
        break;

      case Token.CHARACTER:
        value = new AST.CharacterValue(
          new AST.Character(this.currentToken.sequence),
        );
        this.acceptIt();
        break;

      default:
        throw new Error(
          "Syntax Error - Unknown Token: " + this.currentToken.sequence,
        );
    }
    return value;
  }

  parseUnaryOperation() {
    let operator = new AST.UnaryOperator(this.currentToken.sequence);
    this.accept(Token.UNARY_OPERATOR);
    let value = this.parseValue();
    return new AST.UnaryOperationValue(operator, value);
  }

  parseArithmeticOperation() {
    if (this.currentToken.kind === Token.ARTICLE) {
      this.acceptIt();
    }
    let operator = new AST.ArithmeticOperator(this.currentToken.sequence);
    this.accept(Token.ARITHMETIC_OPERATOR);
    let value_1 = this.parseValue();
    this.accept(Token.AND);
    let value_2 = this.parseValue();
    return new AST.ArithmeticOperationValue(operator, value_1, value_2);
  }

  parseConstant() {
    let adjectives = [];
    let adjective;
    while (
      this.currentToken.kind !== Token.POSITIVE_NOUN &&
      this.currentToken.kind !== Token.NEUTRAL_NOUN &&
      this.currentToken.kind !== Token.NEGATIVE_NOUN
    ) {
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
    switch (this.currentToken.kind) {
      case Token.POSITIVE_NOUN:
        noun = new AST.PositiveNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.PositiveConstantValue(noun, adjectives);
      case Token.NEUTRAL_NOUN:
        noun = new AST.NeutralNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.PositiveConstantValue(noun, adjectives);
      case Token.NEGATIVE_NOUN:
        noun = new AST.NegativeNoun(this.currentToken.sequence);
        this.acceptIt();
        return new AST.NegativeConstantValue(noun, adjectives);
      default:
        throw this.unexpectedTokenError();
    }
  }

  parseQuestion() {
    let value1 = this.parseQuestionFirstValue();
    let comparison = this.parseComparative();
    let value2 = this.parseValue();
    return new AST.QuestionSentence(value1, comparison, value2);
  }

  parseQuestionFirstValue() {
    if (this.currentToken.kind === Token.BE_COMPARATIVE) {
      const be_comparative = new AST.BeComparative(this.currentToken.sequence);
      this.acceptIt();
      return be_comparative;
    } else {
      this.accept(Token.Is);
      return this.parseValue();
    }
  }

  parseComparative() {
    let comparison, comparative, adjective;
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
        comparison = new AST.EqualToComparison(adjective);
        this.accept(Token.AS);
        break;

      case Token.NOT:
        this.acceptIt();
        comparative = this.parseComparative();
        comparison = new AST.InverseComparison(comparative);
        break;
    }
    return comparison;
  }

  parseGoto() {
    this.accept(Token.IMPERATIVE);
    this.accept(Token.RETURN);
    this.accept(Token.TO);
    if (this.currentToken.kind === Token.SCENE) {
      this.acceptIt();
      let numeral = new AST.Numeral(this.currentToken.sequence);
      this.accept(Token.ROMAN_NUMERAL);
      return new AST.GotoSentence("scene", numeral);
    } else if (this.currentToken.kind === Token.ACT) {
      this.acceptIt();
      let numeral = new AST.Numeral(this.currentToken.sequence);
      this.accept(Token.ROMAN_NUMERAL);
      return new AST.GotoSentence("act", numeral);
    } else {
      throw this.unexpectedTokenError();
    }
  }

  parseInput() {
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
    switch (this.currentToken.kind) {
      case Token.FIRST_PERSON_PRONOUN:
        pronoun = new AST.FirstPersonPronoun(this.currentToken.sequence);
        this.acceptIt();
        break;
      case Token.SECOND_PERSON_PRONOUN:
        pronoun = new AST.SecondPersonPronoun(this.currentToken.sequence);
        this.acceptIt();
        break;
    }
    return new AST.RememberSentence(pronoun);
  }

  parseRecall() {
    this.accept(Token.RECALL);
    this.acceptIf(
      (t) =>
        t.kind === Token.COMMA || t.kind === Token.SECOND_PERSON_POSSESSIVE,
    );
    let comment = "";
    while (!Token.isStatementPunctuation(this.currentToken)) {
      comment += this.currentToken.sequence + " ";
      this.acceptIt();
    }
    return new AST.RecallSentence(new AST.Comment(comment.trim()));
  }

  parseAdjective() {
    let adjective;
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
        this.unexpectedTokenError();
    }
    return adjective;
  }

  unexpectedTokenError() {
    return new Error(
      `Syntax Error - Unexpected token: ${JSON.stringify(this.currentToken)}`,
    );
  }
}

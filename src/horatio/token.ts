/**
 * SPL Tokens
 * @memberof Horatio
 * @param {number} kind     - The scanned token byte
 * @param {string} sequence - The matched phrase
 */
export default class Token {
  kind: number;
  sequence: string;

  constructor(kind: number, sequence: string) {
    this.kind = kind;
    this.sequence = sequence;
  }

  static get CHARACTER() {
    return 10;
  }
  static get ARTICLE() {
    return 11;
  }
  static get BE() {
    return 12;
  }
  static get ACT() {
    return 13;
  }
  static get SCENE() {
    return 14;
  }
  static get ENTER() {
    return 15;
  }
  static get EXIT() {
    return 16;
  }
  static get EXEUNT() {
    return 17;
  }
  static get YOU() {
    return 18;
  }

  static get INPUT_INTEGER() {
    return 21;
  }
  static get INPUT_CHAR() {
    return 22;
  }
  static get OUTPUT_INTEGER() {
    return 24;
  }
  static get OUTPUT_CHAR() {
    return 25;
  }

  static get IMPERATIVE() {
    return 30;
  }
  static get TO() {
    return 31;
  }
  static get RETURN() {
    return 32;
  }

  static get POSITIVE_COMPARATIVE() {
    return 40;
  }
  static get NEGATIVE_COMPARATIVE() {
    return 41;
  }
  static get AS() {
    return 42;
  }
  static get NOT() {
    return 43;
  }
  static get THAN() {
    return 44;
  }
  static get IF_SO() {
    return 45;
  }
  static get BE_COMPARATIVE() {
    return 46;
  }
  static get Is() {
    return 47;
  }
  static get IF_NOT() {
    return 48;
  }

  static get UNARY_OPERATOR() {
    return 50;
  }
  static get ARITHMETIC_OPERATOR() {
    return 51;
  }

  static get REMEMBER() {
    return 60;
  }
  static get RECALL() {
    return 61;
  }

  static get FIRST_PERSON_PRONOUN() {
    return 70;
  }
  static get SECOND_PERSON_PRONOUN() {
    return 71;
  }
  static get POSITIVE_ADJECTIVE() {
    return 72;
  }
  static get NEUTRAL_ADJECTIVE() {
    return 73;
  }
  static get NEGATIVE_ADJECTIVE() {
    return 74;
  }
  static get POSITIVE_NOUN() {
    return 75;
  }
  static get NEUTRAL_NOUN() {
    return 76;
  }
  static get NEGATIVE_NOUN() {
    return 77;
  }
  static get ROMAN_NUMERAL() {
    return 78;
  }
  static get NOTHING() {
    return 79;
  }

  static get FIRST_PERSON_POSSESSIVE() {
    return 80;
  }
  static get SECOND_PERSON_POSSESSIVE() {
    return 81;
  }
  static get THIRD_PERSON_POSSESSIVE() {
    return 82;
  }

  static get COLON() {
    return 90;
  }
  static get COMMA() {
    return 91;
  }
  static get PERIOD() {
    return 92;
  }
  static get EXCLAMATION_POINT() {
    return 93;
  }
  static get QUESTION_MARK() {
    return 94;
  }
  static get AMPERSAND() {
    return 95;
  }
  static get AND() {
    return 96;
  }
  static get LEFT_BRACKET() {
    return 97;
  }
  static get RIGHT_BRACKET() {
    return 98;
  }

  static get COMMENT() {
    return 110;
  }

  static isStatementPunctuation(token: Token): boolean {
    return (
      token.kind === Token.PERIOD || token.kind === Token.EXCLAMATION_POINT
    );
  }

  static isSentenceEndPunctuation(token: Token): boolean {
    return (
      token.kind === Token.PERIOD ||
      token.kind === Token.EXCLAMATION_POINT ||
      token.kind === Token.QUESTION_MARK
    );
  }
}

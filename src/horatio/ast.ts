/**
 * Horatio AST
 * @namespace
 */

export type Presence = Enter | Exit | Exeunt;

export type Sentence =
  | AssignmentSentence
  | QuestionSentence
  | ResponseSentence
  | GotoSentence
  | IntegerInputSentence
  | CharInputSentence
  | IntegerOutputSentence
  | CharOutputSentence
  | RememberSentence
  | RecallSentence;

export type Comparison =
  | GreaterThanComparison
  | LesserThanComparison
  | EqualToComparison
  | InverseComparison;

export type Value =
  | PositiveConstantValue
  | NegativeConstantValue
  | UnaryOperationValue
  | ArithmeticOperationValue
  | PronounValue;

export type Comparative = PositiveComparative | NegativeComparative | BeComparative;

export type Pronoun = FirstPersonPronoun | SecondPersonPronoun;

export type Noun = PositiveNoun | NeutralNoun | NegativeNoun;

export type Adjective = PositiveAdjective | NeutralAdjective | NegativeAdjective;

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Comment}             comment
 * @param {Array.<Horatio.AST.Declaration>} declarations
 * @param {Array.<Horatio.AST.Part>}        parts
 */
export class Program {
  comment: Comment;
  declarations: Declaration[];
  parts: Part[];

  constructor(comment: Comment, declarations: Declaration[], parts: Part[]) {
    this.comment = comment;
    this.declarations = declarations;
    this.parts = parts;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitProgram(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Character} character
 * @param {Horatio.AST.Comment}   comment
 */
export class Declaration {
  character: Character;
  comment: Comment;

  constructor(character: Character, comment: Comment) {
    this.character = character;
    this.comment = comment;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitDeclaration(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Numeral}         numeral
 * @param {Horatio.AST.Comment}         comment
 * @param {Array.<Horatio.AST.Subpart>} subparts
 */
export class Part {
  numeral: Numeral;
  comment: Comment;
  subparts: Subpart[];

  constructor(numeral: Numeral, comment: Comment, subparts: Subpart[]) {
    this.numeral = numeral;
    this.comment = comment;
    this.subparts = subparts;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPart(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Numeral} numeral
 * @param {Horatio.AST.Comment} comment
 * @param {Horatio.AST.Stage}   stage
 */
export class Subpart {
  numeral: Numeral;
  comment: Comment;
  stage: Stage;

  constructor(numeral: Numeral, comment: Comment, stage: Stage) {
    this.numeral = numeral;
    this.comment = comment;
    this.stage = stage;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitSubpart(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Dialogue}                                  dialogue
 * @param {Horatio.AST.Enter|Horatio.AST.Exit|Horatio.AST.exeunt} start_presence
 * @param {Horatio.AST.Enter|Horatio.AST.Exit|Horatio.AST.exeunt} end_presence
 */
export class Stage {
  dialogue: Dialogue;
  start_presence: Presence;
  end_presence: Presence;

  constructor(
    dialogue: Dialogue,
    start_presence: Presence,
    end_presence: Presence,
  ) {
    this.dialogue = dialogue;
    this.start_presence = start_presence;
    this.end_presence = end_presence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitStage(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Character} character_1
 * @param {Horatio.AST.Character} character_2
 */
export class Enter {
  character_1: Character;
  character_2: Character | null;

  constructor(character_1: Character, character_2: Character | null) {
    this.character_1 = character_1;
    this.character_2 = character_2;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitEnter(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Character} character
 */
export class Exit {
  character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitExit(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Character} character_1
 * @param {Horatio.AST.Character} character_2
 */
export class Exeunt {
  character_1: Character;
  character_2: Character | null;

  constructor(character_1: Character, character_2: Character | null) {
    this.character_1 = character_1;
    this.character_2 = character_2;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitExeunt(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Array.<Horatio.AST.Line>} lines
 */
export class Dialogue {
  lines: Line[];

  constructor(lines: Line[]) {
    this.lines = lines;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitDialogue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Character}         character
 * @param {Array.<Horatio.AST.Sentences>} sentences
 */
export class Line {
  character: Character;
  sentences: Sentence[];

  constructor(character: Character, sentences: Sentence[]) {
    this.character = character;
    this.sentences = sentences;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitLine(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 * @param {Horatio.AST.Numeral} numeral
 */
export class Goto {
  numeral: Numeral;

  constructor(numeral: Numeral) {
    this.numeral = numeral;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGoto(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class AssignmentSentence {
  be: Be;
  value: Value;

  constructor(be: Be, value: Value) {
    this.be = be;
    this.value = value;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitAssignmentSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class QuestionSentence {
  be: Be;
  comparison: Comparison;
  value: Value;

  constructor(be: Be, comparison: Comparison, value: Value) {
    this.be = be;
    this.comparison = comparison;
    this.value = value;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitQuestionSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class ResponseSentence {
  goto: Goto;

  constructor(goto: Goto) {
    this.goto = goto;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitResponseSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class GotoSentence {
  goto: Goto;

  constructor(goto: Goto) {
    this.goto = goto;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGotoSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class IntegerInputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitIntegerInputSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class CharInputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharInputSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class IntegerOutputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitIntegerOutputSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class CharOutputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharOutputSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class RememberSentence {
  pronoun: Pronoun;

  constructor(pronoun: Pronoun) {
    this.pronoun = pronoun;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitRememberSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class RecallSentence {
  comment: Comment;

  constructor(comment: Comment) {
    this.comment = comment;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitRecallSentence(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class PositiveConstantValue {
  noun: Noun;
  adjectives: Adjective[];

  constructor(noun: Noun, adjectives: Adjective[]) {
    this.noun = noun;
    this.adjectives = adjectives;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveConstantValue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NegativeConstantValue {
  noun: Noun;
  adjectives: Adjective[];

  constructor(noun: Noun, adjectives: Adjective[]) {
    this.noun = noun;
    this.adjectives = adjectives;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeConstantValue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class UnaryOperationValue {
  operator: UnaryOperator;
  value: Value;

  constructor(operator: UnaryOperator, value: Value) {
    this.operator = operator;
    this.value = value;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitUnaryOperationValue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class ArithmeticOperationValue {
  operator: ArithmeticOperator;
  value_1: Value;
  value_2: Value;

  constructor(operator: ArithmeticOperator, value_1: Value, value_2: Value) {
    this.operator = operator;
    this.value_1 = value_1;
    this.value_2 = value_2;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitArithmeticOperationValue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class PronounValue {
  pronoun: Pronoun;

  constructor(pronoun: Pronoun) {
    this.pronoun = pronoun;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPronounValue(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class GreaterThanComparison {
  comparative: Comparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGreaterThanComparison(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class LesserThanComparison {
  comparative: Comparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitLesserThanComparison(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class EqualToComparison {
  adjective: Adjective;

  constructor(adjective: Adjective) {
    this.adjective = adjective;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitEqualToComparison(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class InverseComparison {
  comparison: Comparison;

  constructor(comparison: Comparison) {
    this.comparison = comparison;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitInverseComparison(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class Comment {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitComment(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class Numeral {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNumeral(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class Character {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharacter(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class FirstPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitFirstPersonPronoun(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class SecondPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitSecondPersonPronoun(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class PositiveNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveNoun(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NeutralNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNeutralNoun(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NegativeNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeNoun(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class PositiveAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveAdjective(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NeutralAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNeutralAdjective(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NegativeAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeAdjective(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class UnaryOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitUnaryOperator(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class ArithmeticOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitArithmeticOperator(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class PositiveComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveComparative(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class NegativeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeComparative(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class Be {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitBe(this, arg);
  }
}

/**
 * @memberof Horatio.AST
 */
export class BeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitBeComparative(this, arg);
  }
}

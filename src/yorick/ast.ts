export type ActNumber = number;

export type LabelId = string;

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

export type Comparative =
  | PositiveComparative
  | NegativeComparative
  | BeComparative;

export type Pronoun = FirstPersonPronoun | SecondPersonPronoun;

export type Noun = PositiveNoun | NeutralNoun | NegativeNoun;

export type Adjective =
  | PositiveAdjective
  | NeutralAdjective
  | NegativeAdjective;

export interface Placeholder<T> {
  placeholder: T;
}

export class Program {
  comment: Comment;
  declarations: Declaration[] | Placeholder<null>;
  parts: Part[];

  constructor(
    comment: Comment,
    declarations: Declaration[] | Placeholder<null>,
    parts: Part[],
  ) {
    this.comment = comment;
    this.declarations = declarations;
    this.parts = parts;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitProgram(this, arg);
  }
}

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

export class Part {
  labelId: LabelId;
  numeral: Numeral | Placeholder<number>;
  comment: Comment;
  subparts: Subpart[];

  constructor(
    labelId: LabelId,
    numeral: Numeral | Placeholder<number>,
    comment: Comment,
    subparts: Subpart[],
  ) {
    this.labelId = labelId;
    this.numeral = numeral;
    this.comment = comment;
    this.subparts = subparts;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPart(this, arg);
  }
}

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

export class Exit {
  character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitExit(this, arg);
  }
}

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

export class Dialogue {
  lines: Line[];

  constructor(lines: Line[]) {
    this.lines = lines;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitDialogue(this, arg);
  }
}

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

export class Goto {
  numeral: Numeral;

  constructor(numeral: Numeral) {
    this.numeral = numeral;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGoto(this, arg);
  }
}

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

export class ResponseSentence {
  goto: Goto;

  constructor(goto: Goto) {
    this.goto = goto;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitResponseSentence(this, arg);
  }
}

export class GotoSentence {
  goto: Goto;

  constructor(goto: Goto) {
    this.goto = goto;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGotoSentence(this, arg);
  }
}

export class IntegerInputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitIntegerInputSentence(this, arg);
  }
}

export class CharInputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharInputSentence(this, arg);
  }
}

export class IntegerOutputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitIntegerOutputSentence(this, arg);
  }
}

export class CharOutputSentence {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharOutputSentence(this, arg);
  }
}

export class RememberSentence {
  pronoun: Pronoun;

  constructor(pronoun: Pronoun) {
    this.pronoun = pronoun;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitRememberSentence(this, arg);
  }
}

export class RecallSentence {
  comment: Comment;

  constructor(comment: Comment) {
    this.comment = comment;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitRecallSentence(this, arg);
  }
}

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

export class PronounValue {
  pronoun: Pronoun;

  constructor(pronoun: Pronoun) {
    this.pronoun = pronoun;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPronounValue(this, arg);
  }
}

export class GreaterThanComparison {
  comparative: Comparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitGreaterThanComparison(this, arg);
  }
}

export class LesserThanComparison {
  comparative: Comparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitLesserThanComparison(this, arg);
  }
}

export class EqualToComparison {
  adjective: Adjective;

  constructor(adjective: Adjective) {
    this.adjective = adjective;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitEqualToComparison(this, arg);
  }
}

export class InverseComparison {
  comparison: Comparison;

  constructor(comparison: Comparison) {
    this.comparison = comparison;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitInverseComparison(this, arg);
  }
}

export class Comment {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitComment(this, arg);
  }
}

export class Numeral {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNumeral(this, arg);
  }
}

export class Character {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitCharacter(this, arg);
  }
}

export class FirstPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitFirstPersonPronoun(this, arg);
  }
}

export class SecondPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitSecondPersonPronoun(this, arg);
  }
}

export class PositiveNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveNoun(this, arg);
  }
}

export class NeutralNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNeutralNoun(this, arg);
  }
}

export class NegativeNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeNoun(this, arg);
  }
}

export class PositiveAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveAdjective(this, arg);
  }
}

export class NeutralAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNeutralAdjective(this, arg);
  }
}

export class NegativeAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeAdjective(this, arg);
  }
}

export class UnaryOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitUnaryOperator(this, arg);
  }
}

export class ArithmeticOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitArithmeticOperator(this, arg);
  }
}

export class PositiveComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitPositiveComparative(this, arg);
  }
}

export class NegativeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitNegativeComparative(this, arg);
  }
}

export class Be {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitBe(this, arg);
  }
}

export class BeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg: any): any {
    return visitor.visitBeComparative(this, arg);
  }
}

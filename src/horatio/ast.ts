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
  | ZeroValue
  | UnaryOperationValue
  | ArithmeticOperationValue
  | PronounValue
  | CharacterValue;

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

export class Program {
  comment: Comment;
  declarations: Declaration[];
  parts: Part[];

  constructor(comment: Comment, declarations: Declaration[], parts: Part[]) {
    this.comment = comment;
    this.declarations = declarations;
    this.parts = parts;
  }

  visit(visitor: any, arg?: any): any {
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

  visit(visitor: any, arg?: any): any {
    return visitor.visitDeclaration(this, arg);
  }
}

export class Part {
  numeral: Numeral;
  comment: Comment;
  subparts: Subpart[];

  constructor(numeral: Numeral, comment: Comment, subparts: Subpart[]) {
    this.numeral = numeral;
    this.comment = comment;
    this.subparts = subparts;
  }

  visit(visitor: any, arg?: any): any {
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

  visit(visitor: any, arg?: any): any {
    return visitor.visitSubpart(this, arg);
  }
}

export class Stage {
  directions: Array<Dialogue | Presence>;

  constructor(directions: Array<Dialogue | Presence>) {
    this.directions = directions;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitStage(this, arg);
  }
}

export class Enter {
  character_1: Character;
  character_2: Character | null;

  constructor(character_1: Character, character_2?: Character) {
    this.character_1 = character_1;
    this.character_2 = character_2 || null;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitEnter(this, arg);
  }
}

export class Exit {
  character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitExit(this, arg);
  }
}

export class Exeunt {
  character_1: Character | null;
  character_2: Character | null;

  constructor(character_1?: Character, character_2?: Character) {
    this.character_1 = character_1 || null;
    this.character_2 = character_2 || null;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitExeunt(this, arg);
  }
}

export class Dialogue {
  lines: Line[];

  constructor(lines: Line[]) {
    this.lines = lines;
  }

  visit(visitor: any, arg?: any): any {
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

  visit(visitor: any, arg?: any): any {
    return visitor.visitLine(this, arg);
  }
}

export class AssignmentSentence {
  be: Be;
  value: Value;
  subject?: Character;
  comparative?: Adjective;
  exclaimed?: boolean;

  constructor(
    be: Be,
    value: Value,
    subject?: Character,
    comparative?: Adjective,
    exclaimed?: boolean,
  ) {
    this.be = be;
    this.value = value;
    this.subject = subject;
    this.comparative = comparative;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitAssignmentSentence(this, arg);
  }
}

export class QuestionSentence {
  prefix: string; // "Is", "Am I", "Art thou", "Are you", etc.
  value1: BeComparative | Value;
  comparison: Comparison;
  value2: Value;

  constructor(
    prefix: string,
    value1: BeComparative | Value,
    comparison: Comparison,
    value2: Value,
  ) {
    this.prefix = prefix;
    this.value1 = value1;
    this.comparison = comparison;
    this.value2 = value2;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitQuestionSentence(this, arg);
  }
}

export class ResponseSentence {
  sentence: Sentence;
  runIf: boolean;

  constructor(sentence: Sentence, runIf: boolean) {
    this.sentence = sentence;
    this.runIf = runIf;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitResponseSentence(this, arg);
  }
}

export class GotoSentence {
  sequence: string; // Store the original source text like "Let us return to Scene" or "let us proceed to scene"
  part: "act" | "scene";
  numeral: Numeral;
  exclaimed?: boolean;

  constructor(
    sequence: string,
    part: "act" | "scene",
    numeral: Numeral,
    exclaimed?: boolean,
  ) {
    this.sequence = sequence;
    this.part = part;
    this.numeral = numeral;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitGotoSentence(this, arg);
  }
}

export class IntegerInputSentence {
  sequence: string;
  subject?: Character;
  exclaimed?: boolean;

  constructor(sequence: string, subject?: Character, exclaimed?: boolean) {
    this.sequence = sequence;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitIntegerInputSentence(this, arg);
  }
}

export class CharInputSentence {
  sequence: string;
  subject?: Character;
  exclaimed?: boolean;

  constructor(sequence: string, subject?: Character, exclaimed?: boolean) {
    this.sequence = sequence;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitCharInputSentence(this, arg);
  }
}

export class IntegerOutputSentence {
  sequence: string;
  subject?: Character;
  exclaimed?: boolean;

  constructor(sequence: string, subject?: Character, exclaimed?: boolean) {
    this.sequence = sequence;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitIntegerOutputSentence(this, arg);
  }
}

export class CharOutputSentence {
  sequence: string;
  subject?: Character;
  exclaimed?: boolean;

  constructor(sequence: string, subject?: Character, exclaimed?: boolean) {
    this.sequence = sequence;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitCharOutputSentence(this, arg);
  }
}

export class RememberSentence {
  pronoun: Pronoun;
  subject?: Character;
  exclaimed?: boolean;

  constructor(pronoun: Pronoun, subject?: Character, exclaimed?: boolean) {
    this.pronoun = pronoun;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitRememberSentence(this, arg);
  }
}

export class RecallSentence {
  comment: Comment;
  subject?: Character;
  exclaimed?: boolean;

  constructor(comment: Comment, subject?: Character, exclaimed?: boolean) {
    this.comment = comment;
    this.subject = subject;
    this.exclaimed = exclaimed;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitRecallSentence(this, arg);
  }
}

export class PositiveConstantValue {
  noun: Noun;
  adjectives: Adjective[];
  article?: string;
  context?: string;

  constructor(
    noun: Noun,
    adjectives: Adjective[],
    article?: string,
    context?: string,
  ) {
    this.noun = noun;
    this.adjectives = adjectives;
    this.article = article;
    this.context = context;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitPositiveConstantValue(this, arg);
  }
}

export class NegativeConstantValue {
  noun: Noun;
  adjectives: Adjective[];
  article?: string;
  context?: string;

  constructor(
    noun: Noun,
    adjectives: Adjective[],
    article?: string,
    context?: string,
  ) {
    this.noun = noun;
    this.adjectives = adjectives;
    this.article = article;
    this.context = context;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNegativeConstantValue(this, arg);
  }
}

export class ZeroValue {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitZeroValue(this, arg);
  }
}

export class UnaryOperationValue {
  operator: UnaryOperator;
  value: Value;

  constructor(operator: UnaryOperator, value: Value) {
    this.operator = operator;
    this.value = value;
  }

  visit(visitor: any, arg?: any): any {
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

  visit(visitor: any, arg?: any): any {
    return visitor.visitArithmeticOperationValue(this, arg);
  }
}

export class PronounValue {
  pronoun: Pronoun;

  constructor(pronoun: Pronoun) {
    this.pronoun = pronoun;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitPronounValue(this, arg);
  }
}

export class CharacterValue {
  character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitCharacterValue(this, arg);
  }
}

export class GreaterThanComparison {
  comparative: PositiveComparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitGreaterThanComparison(this, arg);
  }
}

export class LesserThanComparison {
  comparative: NegativeComparative;

  constructor(comparative: Comparative) {
    this.comparative = comparative;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitLesserThanComparison(this, arg);
  }
}

export class EqualToComparison {
  adjective: Adjective;

  constructor(adjective: Adjective) {
    this.adjective = adjective;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitEqualToComparison(this, arg);
  }
}

export class InverseComparison {
  comparison: Comparison;

  constructor(comparison: Comparison) {
    this.comparison = comparison;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitInverseComparison(this, arg);
  }
}

export class Comment {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitComment(this, arg);
  }
}

export class Numeral {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNumeral(this, arg);
  }
}

export class Character {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitCharacter(this, arg);
  }
}

export class FirstPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitFirstPersonPronoun(this, arg);
  }
}

export class SecondPersonPronoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitSecondPersonPronoun(this, arg);
  }
}

export class PositiveNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitPositiveNoun(this, arg);
  }
}

export class NeutralNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNeutralNoun(this, arg);
  }
}

export class NegativeNoun {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNegativeNoun(this, arg);
  }
}

export class PositiveAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitPositiveAdjective(this, arg);
  }
}

export class NeutralAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNeutralAdjective(this, arg);
  }
}

export class NegativeAdjective {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNegativeAdjective(this, arg);
  }
}

export class UnaryOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitUnaryOperator(this, arg);
  }
}

export class ArithmeticOperator {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitArithmeticOperator(this, arg);
  }
}

export class PositiveComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitPositiveComparative(this, arg);
  }
}

export class NegativeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitNegativeComparative(this, arg);
  }
}

export class Be {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitBe(this, arg);
  }
}

export class BeComparative {
  sequence: string;

  constructor(sequence: string) {
    this.sequence = sequence;
  }

  visit(visitor: any, arg?: any): any {
    return visitor.visitBeComparative(this, arg);
  }
}

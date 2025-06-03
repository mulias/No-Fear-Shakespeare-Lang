import * as Ast from "./ast";

export type Program = {
  title: string;
  declarations: string[];
  parts: Part[];
};

export type Part = {
  heading: string;
  subparts: Subpart[];
};

export type Subpart = {
  heading: string;
  body: Array<string | Line>;
};

export type Line = {
  name: string;
  text: string;
};

export default class Formatter {
  visitProgram(program: Ast.Program): Program {
    const title = program.comment.visit(this) + ".";

    const declarations = program.declarations.map((declaration) =>
      declaration.visit(this),
    );

    const parts = program.parts.map((part) => part.visit(this));

    return { title, declarations, parts };
  }

  visitComment(comment: Ast.Comment): string {
    return comment.sequence;
  }

  visitDeclaration(declaration: Ast.Declaration): string {
    const character = declaration.character.visit(this);
    const description = declaration.comment.visit(this);

    return `${character}, ${description}.`;
  }

  visitCharacter(character: Ast.Character): string {
    return character.sequence;
  }

  visitPart(part: Ast.Part): Part {
    const numeral = part.numeral.visit(this);
    const title = part.comment.visit(this);
    const subparts = part.subparts.map((subpart) => subpart.visit(this));

    return { heading: `Act ${numeral}: ${title}.`, subparts };
  }

  visitNumeral(numeral: Ast.Numeral): string {
    return numeral.sequence;
  }

  visitSubpart(subpart: Ast.Subpart): Subpart {
    const numeral = subpart.numeral.visit(this);
    const title = subpart.comment.visit(this);
    const body = subpart.stage.visit(this);

    return { heading: `Scene ${numeral}: ${title}.`, body };
  }

  visitStage(stage: Ast.Stage): Array<string | Line> {
    const directions = stage.directions.map((direction) =>
      direction.visit(this),
    );

    return directions.flat();
  }

  visitEnter(presence: Ast.Enter) {
    const name1 = presence.character_1.visit(this);

    if (presence.character_2) {
      const name2 = presence.character_2.visit(this);

      return `[Enter ${name1} and ${name2}]`;
    } else {
      return `[Enter ${name1}]`;
    }
  }

  visitExit(presence: Ast.Exit) {
    const name = presence.character.visit(this);

    return `[Exit ${name}]`;
  }

  visitExeunt(presence: Ast.Exeunt) {
    if (presence.character_1 && presence.character_2) {
      const name1 = presence.character_1.visit(this);
      const name2 = presence.character_2.visit(this);

      return `[Exeunt ${name1} and ${name2}]`;
    } else {
      return "[Exeunt]";
    }
  }

  visitDialogue(dialogue: Ast.Dialogue) {
    const lines = dialogue.lines.map((line) => line.visit(this));

    return lines;
  }

  visitLine(line: Ast.Line): Line {
    const name = line.character.visit(this) + ":";
    const text = line.sentences
      .map((sentence) => {
        const sentenceText = sentence.visit(this);
        // Questions get question marks, commands get exclamation marks, everything else gets periods
        let punctuation = ".";
        if (sentence.constructor.name === "QuestionSentence") {
          punctuation = "?";
        } else if (
          sentence.constructor.name === "IntegerOutputSentence" ||
          sentence.constructor.name === "CharOutputSentence" ||
          sentence.constructor.name === "IntegerInputSentence" ||
          sentence.constructor.name === "CharInputSentence" ||
          sentence.constructor.name === "RememberSentence" ||
          sentence.constructor.name === "RecallSentence"
        ) {
          punctuation = "!";
        }
        return sentenceText + punctuation;
      })
      .join(" ");

    return { name, text };
  }

  visitAssignmentSentence(assignment: Ast.AssignmentSentence) {
    const be = assignment.be.visit(this);
    const value = assignment.value.visit(this);

    if (assignment.comparative) {
      const adjective = assignment.comparative.visit(this);
      // Check if value is an arithmetic operation - it needs "the" before it
      if (assignment.value.constructor.name === "ArithmeticOperationValue") {
        return `${be} as ${adjective} as the ${value}`;
      }
      return `${be} as ${adjective} as ${value}`;
    }

    // Check if value is an arithmetic operation - it needs "the" before it
    if (assignment.value.constructor.name === "ArithmeticOperationValue") {
      return `${be} the ${value}`;
    }

    return `${be} ${value}`;
  }

  visitQuestionSentence(question: Ast.QuestionSentence) {
    const prefix = question.prefix;
    const comparison = question.comparison.visit(this);
    const v2 = question.value2.visit(this);

    // For BE_COMPARATIVE (like "Am I"), prefix already includes the subject
    if (question.value1.constructor.name === "BeComparative") {
      return `${prefix} ${comparison} ${v2}`;
    } else {
      // For "Is" questions, we need to include the value1 after the prefix
      const v1 = question.value1.visit(this);
      return `${prefix} ${v1} ${comparison} ${v2}`;
    }
  }

  visitResponseSentence(response: Ast.ResponseSentence) {
    const runIf = response.runIf ? "If so" : "If not";
    const sentence = response.sentence.visit(this);

    return `${runIf}, ${sentence}`;
  }

  visitGotoSentence(goto: Ast.GotoSentence) {
    // Use the original source text if available
    if (goto.sequence) {
      return goto.sequence;
    }

    // Fallback to constructing the text (for backward compatibility)
    const part = goto.part;
    const numeral = goto.numeral.visit(this);
    return `let us return to ${part} ${numeral}`;
  }

  visitIntegerInputSentence(integer: Ast.IntegerInputSentence) {
    return integer.sequence;
  }

  visitCharInputSentence(char: Ast.CharInputSentence) {
    return char.sequence;
  }

  visitIntegerOutputSentence(integer: Ast.IntegerOutputSentence) {
    return integer.sequence;
  }

  visitCharOutputSentence(char: Ast.CharOutputSentence) {
    return char.sequence;
  }

  visitRememberSentence(remember: Ast.RememberSentence) {
    const pronoun = remember.pronoun.visit(this);

    return `Remember ${pronoun}`;
  }

  visitRecallSentence(recall: Ast.RecallSentence) {
    const description = recall.comment.visit(this);

    return `Recall your ${description}`;
  }

  visitPositiveConstantValue(v: Ast.PositiveConstantValue) {
    const adjectives = v.adjectives.map((adjective) => adjective.visit(this));
    const noun = v.noun.visit(this);
    const parts = v.article
      ? [v.article, ...adjectives, noun]
      : [...adjectives, noun];

    return parts.join(" ");
  }

  visitNegativeConstantValue(v: Ast.NegativeConstantValue) {
    const adjectives = v.adjectives.map((adjective) => adjective.visit(this));
    const noun = v.noun.visit(this);
    const parts = v.article
      ? [v.article, ...adjectives, noun]
      : [...adjectives, noun];

    return parts.join(" ");
  }

  visitZeroValue(zero: Ast.ZeroValue) {
    return zero.sequence;
  }

  visitUnaryOperationValue(unary: Ast.UnaryOperationValue) {
    let op = unary.operator.visit(this);
    let value = unary.value.visit(this);

    return `${op} ${value}`;
  }

  visitArithmeticOperationValue(arithmetic: Ast.ArithmeticOperationValue) {
    let op = arithmetic.operator.visit(this);
    let v1 = arithmetic.value_1.visit(this);
    let v2 = arithmetic.value_2.visit(this);

    // Add "the" before nested arithmetic operations
    if (arithmetic.value_1.constructor.name === "ArithmeticOperationValue") {
      v1 = `the ${v1}`;
    }
    if (arithmetic.value_2.constructor.name === "ArithmeticOperationValue") {
      v2 = `the ${v2}`;
    }

    return `${op} ${v1} and ${v2}`;
  }

  visitPronounValue(value: Ast.PronounValue) {
    return value.pronoun.visit(this);
  }

  visitCharacterValue(value: Ast.CharacterValue) {
    return value.character.visit(this);
  }

  visitGreaterThanComparison(comparison: Ast.GreaterThanComparison) {
    const comparative = comparison.comparative.visit(this);
    return `${comparative} than`;
  }

  visitLesserThanComparison(comparison: Ast.LesserThanComparison) {
    const comparative = comparison.comparative.visit(this);
    return `${comparative} than`;
  }

  visitEqualToComparison(comparison: Ast.EqualToComparison) {
    const adjective = comparison.adjective.visit(this);
    return `as ${adjective} as`;
  }

  visitInverseComparison(comparison: Ast.InverseComparison) {
    const innerComparison = comparison.comparison.visit(this);

    return `not ${innerComparison}`;
  }

  visitFirstPersonPronoun(fpp: Ast.FirstPersonPronoun) {
    return fpp.sequence;
  }

  visitSecondPersonPronoun(spp: Ast.SecondPersonPronoun) {
    return spp.sequence;
  }

  visitPositiveNoun(noun: Ast.PositiveNoun) {
    return noun.sequence;
  }

  visitNeutralNoun(noun: Ast.NeutralNoun) {
    return noun.sequence;
  }

  visitNegativeNoun(noun: Ast.NegativeNoun) {
    return noun.sequence;
  }

  visitPositiveAdjective(adjective: Ast.PositiveAdjective) {
    return adjective.sequence;
  }

  visitNeutralAdjective(adjective: Ast.NeutralAdjective) {
    return adjective.sequence;
  }

  visitNegativeAdjective(adjective: Ast.NegativeAdjective) {
    return adjective.sequence;
  }

  visitUnaryOperator(operator: Ast.UnaryOperator) {
    return operator.sequence;
  }

  visitArithmeticOperator(operator: Ast.ArithmeticOperator) {
    return operator.sequence;
  }

  visitPositiveComparative(comparative: Ast.PositiveComparative) {
    return comparative.sequence;
  }

  visitNegativeComparative(comparative: Ast.NegativeComparative) {
    return comparative.sequence;
  }

  visitBe(be: Ast.Be) {
    return be.sequence;
  }

  visitBeComparative(be: Ast.BeComparative) {
    return be.sequence;
  }
}

import * as AST from "./ast";

/**
 * Horatio Semantics Visitor
 */
export default class Semantics {
  characters?: { [key: string]: any };
  parts?: { [key: string]: any };

  declared(character: string): boolean {
    // This is overridden in subclasses
    return false;
  }

  sceneExists(act: string, scene: string): boolean {
    return this.parts && this.parts[act] && this.parts[act].includes(scene);
  }

  toggleStage(character: string): void {
    if (this.characters && this.characters[character] !== undefined) {
      this.characters[character] = !this.characters[character];
    }
  }

  exeuntStage(): void {
    if (this.characters) {
      for (let character in this.characters) {
        this.characters[character] = false;
      }
    }
  }

  actExists(act: string): boolean {
    return this.parts !== undefined && this.parts[act] !== undefined;
  }

  /**
   * Program
   */
  visitProgram(program: AST.Program): null {
    let self = this;

    // comment
    program.comment.visit(this, null);

    // declarations
    if (program.declarations.length > 0) {
      program.declarations.forEach(function (declaration) {
        declaration.visit(self, null);
      });
    } else {
      throw new Error("Semantic Error - No characters declared.");
    }

    // parts
    if (program.parts.length > 0) {
      this.collectActsAndScenes(program.parts);

      program.parts.forEach(function (part) {
        part.visit(self, null);
      });
    } else {
      throw new Error("Semantic Error - No parts in program.");
    }

    return null;
  }

  collectActsAndScenes(parts: AST.Part[]): void {
    let self = this;
    parts.forEach(function (part) {
      let actNumber = part.numeral.sequence;
      if (self.parts!!![actNumber]) {
        throw new Error("Semantic Error - Act already defined.");
      }
      self.parts!!![actNumber] = [];

      part.subparts.forEach(function (subpart) {
        let sceneNumber = subpart.numeral.sequence;
        if (self.sceneExists(actNumber, sceneNumber)) {
          throw new Error("Semantic Error - Scene already defined.");
        }
        self.parts!!![actNumber].push(sceneNumber);
      });
    });
  }

  /**
   * Comment
   */
  visitComment(comment: AST.Comment, arg: any): null {
    if (comment.sequence) {
      return null;
    } else {
      throw new Error("Semantic Error - Comment malformed.");
    }
  }

  /**
   * Declaration
   */
  visitDeclaration(declaration: AST.Declaration, arg: any): null {
    let c = declaration.character.visit(this, arg);

    if (this.characters!!![c.sequence]) {
      throw new Error("Semantic Error - Character already defined.");
    } else {
      this.characters!!![c.sequence] = false;
    }

    declaration.comment.visit(this, arg);
    return null;
  }

  /**
   * Character
   */
  visitCharacter(character: AST.Character, arg: any): AST.Character {
    let self = this;

    if (!character.sequence) {
      throw new Error("Semantic Error - Character undefined.");
    }

    if (!(character instanceof AST.Character)) {
      throw new Error("Semantic Error - Not of type Character.");
    }

    // Declared flag
    if (arg && arg.declared === true && !this.declared(character.sequence)) {
      throw new Error(`Semantic Error - ${character.sequence} is not declared`);
    }

    return character;
  }

  /**
   * Part
   */
  visitPart(part: AST.Part, arg: any): null {
    let self = this;

    let n = part.numeral.visit(this, arg);
    part.comment.visit(this, arg);

    if (part.subparts.length === 0) {
      throw new Error("Semantic Error - No subparts defined.");
    } else {
      part.subparts.forEach(function (subpart) {
        subpart.visit(self, { act: n });
      });
    }

    return null;
  }

  /**
   * Numeral
   */
  visitNumeral(numeral: AST.Numeral, arg: any) {
    if (numeral.sequence) {
      return numeral.sequence;
    } else {
      throw new Error("Semantic Error - Numeral malformed.");
    }
  }

  /**
   * Subparts
   */
  visitSubpart(subpart: AST.Subpart, arg: any) {
    let n = subpart.numeral.visit(this, arg);

    subpart.comment.visit(this, arg);
    subpart.stage.visit(this, { act: arg.act, scene: n });

    return null;
  }

  /**
   * Stage
   */
  visitStage(stage: AST.Stage, arg: any) {
    stage.directions.forEach((direction) => {
      direction.visit(this, arg);
    });
    return null;
  }

  /**
   * Enter
   */
  visitEnter(presence: AST.Enter, arg: any) {
    if (!presence.character_1 && !presence.character_2) {
      throw new Error("Semantic Error - No characters entering.");
    }

    let c1 = presence.character_1.visit(this, {
      declared: true,
      on_stage: false,
    });
    this.toggleStage(c1.sequence);

    if (presence.character_2) {
      let c2 = presence.character_2.visit(this, {
        declared: true,
        on_stage: false,
      });

      if (c1.sequence === c2.sequence) {
        throw new Error(
          "Semantic Error - Same character entering twice in same statement.",
        );
      }

      this.toggleStage(c2.sequence);
    }

    return null;
  }

  /**
   * Exit
   */
  visitExit(presence: AST.Exit, arg: any) {
    if (!presence.character) {
      throw new Error("Semantic Error - No character exiting.");
    }

    let c = presence.character.visit(this, { declared: true, on_stage: true });
    this.toggleStage(c.sequence);

    return null;
  }

  /**
   * Exeunt
   */
  visitExeunt(presence: AST.Exeunt, arg: any) {
    // - No characters on stage
    // x Only 1 character exeunting
    // x characters are the same

    if (presence.character_1 ? !presence.character_2 : presence.character_2) {
      throw new Error(
        "Semantic Error - Either 2 or no characters can be defined, not one.",
      );
    }

    if (presence.character_1 && presence.character_2) {
      let c1 = presence.character_1.visit(this, {
        declared: true,
        on_stage: true,
      });
      let c2 = presence.character_2.visit(this, {
        declared: true,
        on_stage: true,
      });

      if (c1.sequence === c2.sequence) {
        throw new Error("Semantic Error - Characters are the same.");
      }

      this.toggleStage(c1.sequence);
      this.toggleStage(c2.sequence);
    } else {
      this.exeuntStage();
    }

    return null;
  }

  /**
   * Dialogue
   */
  visitDialogue(dialogue: AST.Dialogue, arg: any) {
    let self = this;
    dialogue.lines.forEach(function (line) {
      line.visit(self, arg);
    });
    return null;
  }

  /**
   * Line
   */
  visitLine(line: AST.Line, arg: any) {
    let self = this;

    let c = line.character.visit(this, { declared: true, on_stage: true });

    if (line.sentences.length === 0) {
      throw new Error("Semantic Error - Line cannot have no sentences.");
    } else {
      arg.character = c.sequence;
      line.sentences.forEach(function (sentence) {
        sentence.visit(self, arg);
      });
    }

    return null;
  }

  /**
   * Assignment Sentence
   */
  visitAssignmentSentence(assignment: AST.AssignmentSentence, arg: any) {
    assignment.be.visit(this, arg);

    assignment.value.visit(this, arg);

    return null;
  }

  /**
   * Question Sentence
   */
  visitQuestionSentence(question: AST.QuestionSentence, arg: any) {
    question.value1.visit(this, arg);
    question.comparison.visit(this, arg);
    question.value2.visit(this, arg);

    return null;
  }

  /**
   * Response Sentence
   */
  visitResponseSentence(response: AST.ResponseSentence, arg: any) {
    response.sentence.visit(this, arg);

    return null;
  }

  /**
   * Goto Sentence
   */
  visitGotoSentence(goto: AST.GotoSentence, arg: any) {
    let partIndex = goto.numeral.visit(this, arg);

    if (goto.part === "act" && !this.actExists(partIndex)) {
      throw new Error("Semantic Error - Act specified by Goto does not exist.");
    }

    if (goto.part === "scene" && !this.sceneExists(arg.act, partIndex)) {
      throw new Error(
        `Semantic Error - Scene ${partIndex} does not exist in Act ${arg.act}.`,
      );
    }

    return null;
  }

  /**
   * Integer Input Sentence
   */
  visitIntegerInputSentence(integer_input: AST.IntegerInputSentence, arg: any) {
    return null;
  }

  /**
   * Char Input Sentence
   */
  visitCharInputSentence(char_input: AST.CharInputSentence, arg: any) {
    return null;
  }

  /**
   * Integer Output Sentence
   */
  visitIntegerOutputSentence(
    integer_output: AST.IntegerOutputSentence,
    arg: any,
  ) {
    return null;
  }

  /**
   * Char Output Sentence
   */
  visitCharOutputSentence(char_output: AST.CharOutputSentence, arg: any) {
    return null;
  }

  /**
   * Remember Sentence
   */
  visitRememberSentence(
    remember: AST.RememberSentence,
    arg: { character: string },
  ) {
    let p = remember.pronoun.visit(this);

    return null;
  }

  /**
   * Recall Sentence
   */
  visitRecallSentence(recall: AST.RecallSentence, arg: { character: string }) {
    recall.comment.visit(this, arg);
  }

  /**
   * Positive Constant Value
   */
  visitPositiveConstantValue(
    pc_val: AST.PositiveConstantValue,
    arg: { character: string },
  ) {
    let self = this;

    let n;
    if (
      !(pc_val.noun instanceof AST.PositiveNoun) &&
      !(pc_val.noun instanceof AST.NeutralNoun)
    ) {
      throw new Error(
        "Semantic Error - Positive Constants must use a positive or neutral noun",
      );
    } else {
      n = pc_val.noun.visit(self, arg);
    }
    pc_val.noun.visit(this);
    pc_val.adjectives.forEach(function (adjective: AST.Adjective) {
      adjective.visit(self);
    });

    //return Math.pow(2, pc_val.adjectives.length);
    return 0; // placeholder
  }

  /**
   * Negative Constant Value
   */
  visitNegativeConstantValue(
    nc_val: AST.NegativeConstantValue,
    arg: { character: string },
  ) {
    let self = this;

    let n;
    if (
      !(nc_val.noun instanceof AST.NegativeNoun) &&
      !(nc_val.noun instanceof AST.NeutralNoun)
    ) {
      throw new Error(
        "Semantic Error - Negative Constants must use a negative or neutral noun",
      );
    } else {
      n = nc_val.noun.visit(self, arg);
    }
    nc_val.noun.visit(this);
    nc_val.adjectives.forEach(function (adjective: AST.Adjective) {
      if (
        !(adjective instanceof AST.NegativeAdjective) &&
        !(adjective instanceof AST.NeutralAdjective)
      ) {
        throw new Error(
          "Semantic Error - Negative Constants must use negative of neutral adjectives.",
        );
      } else {
        adjective.visit(self);
      }
    });

    //return (-1 * Math.pow(2, nc_val.adjectives.length));
    return 0; // placeholder
  }

  visitZeroValue(zero: AST.ZeroValue, arg: { character: string }) {
    if (zero.sequence) {
      return null;
    } else {
      throw new Error("Semantic Error - Zero value malformed.");
    }
  }

  /**
   * Unary Operation Value
   */
  visitUnaryOperationValue(
    unary: AST.UnaryOperationValue,
    arg: { character: string },
  ) {
    let o = unary.operator.visit(this);
    let v = unary.value.visit(this, arg);

    return 0; // placeholder
  }

  /**
   * Arithmetic Operation Value
   */
  visitArithmeticOperationValue(
    arithmetic: AST.ArithmeticOperationValue,
    arg: { character: string },
  ) {
    let o = arithmetic.operator.visit(this);
    let v1 = arithmetic.value_1.visit(this, arg);
    let v2 = arithmetic.value_2.visit(this, arg);

    return 0; //placeholder
  }

  /**
   * Pronoun Value
   */
  visitPronounValue(pronoun: AST.PronounValue, arg: { character: string }) {
    let p = pronoun.pronoun.visit(this);

    return p;
  }

  visitCharacterValue(
    characterValue: AST.CharacterValue,
    arg: { character: string },
  ) {
    return null;
  }

  /**
   * Greater Than Comparison
   */
  visitGreaterThanComparison(
    comparison: AST.GreaterThanComparison,
    arg: { character: string },
  ) {
    let c = comparison.comparative.visit(this);

    return c;
  }

  /**
   * Lesser Than Comparison
   */
  visitLesserThanComparison(
    comparison: AST.LesserThanComparison,
    arg: { character: string },
  ) {
    let c = comparison.comparative.visit(this);

    return null;
  }

  /**
   * Equal To Comparison
   */
  visitEqualToComparison(
    comparison: AST.EqualToComparison,
    arg: { character: string },
  ) {
    comparison.adjective.visit(this);

    return null;
  }

  /**
   * Inverse Comparison
   */
  visitInverseComparison(
    comparison: AST.InverseComparison,
    arg: { character: string },
  ) {
    let c = comparison.comparison.visit(this, arg);

    return c;
  }

  /**
   * First Person Pronoun
   */
  visitFirstPersonPronoun(fpp: AST.FirstPersonPronoun) {
    return null;
  }

  /**
   * Second Person Pronoun
   */
  visitSecondPersonPronoun(spp: AST.SecondPersonPronoun) {
    return null;
  }

  /**
   * Positive Noun
   */
  visitPositiveNoun(noun: AST.PositiveNoun) {
    return null;
  }

  /**
   * Neutral Noun
   */
  visitNeutralNoun(noun: AST.NeutralNoun) {
    return null;
  }

  /**
   * Negative Noun
   */
  visitNegativeNoun(noun: AST.NegativeNoun) {
    return null;
  }

  /**
   * Positive Adjective
   */
  visitPositiveAdjective(adjective: AST.PositiveAdjective) {
    return null;
  }

  /**
   * Neutral Adjective
   */
  visitNeutralAdjective(adjective: AST.NeutralAdjective) {
    return null;
  }

  /**
   * Negative Adjective
   */
  visitNegativeAdjective(adjective: AST.NegativeAdjective) {
    return null;
  }

  /**
   * Unary Operator
   */
  visitUnaryOperator(operator: AST.UnaryOperator) {
    return null;
  }

  /**
   * Arithmetic Operator
   */
  visitArithmeticOperator(operator: AST.ArithmeticOperator) {
    return null;
  }

  /**
   * Positive Comparative
   */
  visitPositiveComparative(comparative: AST.PositiveComparative) {
    return null;
  }

  /**
   * Negative Comparative
   */
  visitNegativeComparative(comparative: AST.NegativeComparative) {
    return null;
  }

  /**
   * Be
   */
  visitBe(be: AST.Be) {
    return null;
  }

  /**
   * Be Comparative
   */
  visitBeComparative(be: AST.BeComparative) {
    return null;
  }
}

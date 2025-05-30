import * as Ast from "./ast";
import Program from "./program";

/**
 * Horatio Generation Visitor
 */
export default class Generator {
  program!: Program;

  numeralIndex(numeral: string): number {
    throw new Error("numeralIndex must be implemented by subclass");
  }
  /**
   * Program
   */
  visitProgram(program: Ast.Program): null {
    let self = this;

    // declarations
    program.declarations.forEach(function (declaration) {
      declaration.visit(self, null);
    });

    // parts
    program.parts.forEach(function (part) {
      part.visit(self, null);
    });

    return null;
  }

  /**
   * Declaration
   */
  visitDeclaration(declaration: Ast.Declaration): null {
    let c = declaration.character.sequence;
    this.program.declareCharacter(c);
    return null;
  }

  /**
   * Numeral
   */
  visitNumeral(numeral: Ast.Numeral): number {
    let n = this.numeralIndex(numeral.sequence);
    return n;
  }

  /**
   * Part
   */
  visitPart(part: Ast.Part): null {
    let self = this;

    let n = part.numeral.visit(this);
    let act = this.program.newAct();
    part.subparts.forEach(function (subpart) {
      subpart.visit(self, { act: act });
    });

    return null;
  }

  /**
   * Subparts
   */
  visitSubpart(subpart: Ast.Subpart, arg: { act: number }): null {
    let n = subpart.numeral.visit(this, arg);
    let scene = this.program.newScene(arg.act);
    subpart.stage.visit(this, { act: arg.act, scene: scene });

    return null;
  }

  /**
   * Stage
   */
  visitStage(stage: Ast.Stage, arg: { act: number; scene: number }): null {
    stage.directions.forEach((direction) => {
      direction.visit(this, arg);
    });

    return null;
  }

  /**
   * Enter
   */
  visitEnter(presence: Ast.Enter, arg: { act: number; scene: number }): null {
    const createCommand = (cname: string): Function => {
      const c = cname;
      return function (this: Program) {
        if (this.io.debug) {
          this.io.printDebug(`Enter ${c}`);
        }
        this.enterStage(c);
      };
    };

    const c1 = presence.character_1.sequence;

    this.program.addCommand(arg.act, arg.scene, createCommand(c1));

    if (presence.character_2) {
      const c2 = presence.character_2.sequence;

      this.program.addCommand(arg.act, arg.scene, createCommand(c2));
    }

    return null;
  }

  /**
   * Exit
   */
  visitExit(presence: Ast.Exit, arg: { act: number; scene: number }): null {
    const createCommand = (cname: string): Function => {
      const c = cname;
      return function (this: Program) {
        if (this.io.debug) {
          this.io.printDebug(`Exit ${c}`);
        }
        this.exitStage(c);
      };
    };

    const c = presence.character.sequence;

    this.program.addCommand(arg.act, arg.scene, createCommand(c));

    return null;
  }

  /**
   * Exeunt
   */
  visitExeunt(presence: Ast.Exeunt, arg: { act: number; scene: number }): null {
    const createCommand = (): Function => {
      return function (this: Program) {
        if (this.io.debug) {
          this.io.printDebug(
            `Exeunt ${this.stage.map((c) => c.name()).join(", ")}`,
          );
        }
        this.exeuntStage();
      };
    };

    this.program.addCommand(arg.act, arg.scene, createCommand());

    return null;
  }

  /**
   * Dialogue
   */
  visitDialogue(
    dialogue: Ast.Dialogue,
    arg: { act: number; scene: number; character?: string },
  ): null {
    let self = this;
    dialogue.lines.forEach(function (line) {
      line.visit(self, arg);
    });
    return null;
  }

  /**
   * Line
   */
  visitLine(
    line: Ast.Line,
    arg: { act: number; scene: number; character?: string },
  ): null {
    let self = this;

    let c = line.character.sequence;
    arg.character = c;

    line.sentences.forEach(function (sentence) {
      const command = sentence.visit(self, arg);
      self.program.addCommand(arg.act, arg.scene, command);
    });

    return null;
  }

  /**
   * Assignment Sentence
   */
  visitAssignmentSentence(
    assignment: Ast.AssignmentSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (target: Function, value: Function): Function => {
      const t = target;
      const v = value;

      return function (this: Program) {
        const target = t.call(this);
        const val = v.call(this);

        if (this.io.debug) {
          this.io.printDebug(`${target} = ${val}`);
        }

        this.characters[target]!!!.setValue(val);
      };
    };

    let target = assignment.be.visit(this, arg);
    let value = assignment.value.visit(this, arg);

    return createCommand(target, value);
  }

  /**
   * Question Sentence
   */
  visitQuestionSentence(
    question: Ast.QuestionSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (
      value1: Function,
      comparative: Function,
      value2: Function,
    ): Function => {
      return function (this: Program) {
        const val1 = value1.call(this);
        const val2 = value2.call(this);
        const result = comparative.call(this, val1, val2);

        if (this.io.debug) {
          this.io.printDebug(`Question is ${result}`);
        }

        this.setGlobalBool(result);
      };
    };

    let value1 = question.value1.visit(this, arg);
    let comparative = question.comparison.visit(this, arg);
    let value2 = question.value2.visit(this, arg);

    return createCommand(value1, comparative, value2);
  }

  /**
   * Response Sentence
   */
  visitResponseSentence(
    response: Ast.ResponseSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (sentence: Function): Function => {
      return function (this: Program) {
        const truth = this.getGlobalBool();
        if (truth === response.runIf) {
          if (this.io.debug) {
            this.io.printDebug(
              `Last question was ${truth}, response required ${response.runIf}, running response`,
            );
          }

          sentence.call(this);
        } else {
          if (this.io.debug) {
            this.io.printDebug(
              `Last question was ${truth}, response required ${response.runIf}, skip`,
            );
          }
        }
      };
    };

    let sentence = response.sentence.visit(this, arg);

    return createCommand(sentence);
  }

  /**
   * Goto Sentence
   */
  visitGotoSentence(
    goto: Ast.GotoSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (
      part: "act" | "scene",
      sceneIndex: number,
    ): Function => {
      return function (this: Program) {
        if (part === "act") {
          if (this.io.debug) {
            this.io.printDebug(`Goto Act ${sceneIndex + 1}`);
          }
          this.gotoAct(sceneIndex);
        } else {
          if (this.io.debug) {
            this.io.printDebug(`Goto Scene ${sceneIndex + 1}`);
          }
          this.gotoScene(sceneIndex);
        }
      };
    };

    let sceneIndex = goto.numeral.visit(this, arg);

    return createCommand(goto.part, sceneIndex);
  }

  /**
   * Integer Input Sentence
   */
  visitIntegerInputSentence(
    integer_input: Ast.IntegerInputSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      const speaker = arg.character;

      return function (this: Program) {
        let subject = this.interlocutor(speaker!!!);

        let input: number | undefined;

        while (input === undefined) {
          this.io.read((value) => {
            const parsed = parseInt(value);
            if (isNaN(parsed)) {
              this.io.print(
                "Error: Invalid numeric input. Please enter a valid integer.",
              );
            } else {
              input = parsed;
            }
          });
        }

        subject.setValue(input);

        if (this.io.debug) {
          this.io.printDebug(`${subject.name()} = ${subject.value()}`);
        }
      };
    };

    return createCommand();
  }

  /**
   * Char Input Sentence
   */
  visitCharInputSentence(
    char_input: Ast.CharInputSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      const speaker = arg.character;

      return function (this: Program) {
        let subject = this.interlocutor(speaker!!!);

        let input: string | undefined;

        while (input === undefined) {
          this.io.read((value) => {
            const codePoints = Array.from(value);
            if (codePoints.length !== 1) {
              this.io.print(
                "Error: Invalid character input. Please enter exactly one character.",
              );
            } else {
              input = codePoints[0];
            }
          });
        }

        subject.setValue(input.codePointAt(0)!);

        if (this.io.debug) {
          this.io.printDebug(`${subject.name()} = ${subject.value()}`);
        }
      };
    };

    return createCommand();
  }

  /**
   * Integer Output Sentence
   */
  visitIntegerOutputSentence(
    integer_output: Ast.IntegerOutputSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      const speaker = arg.character;

      return function (this: Program) {
        const listener = this.interlocutor(speaker!!!);
        let val = listener.value();

        if (this.io.debug) {
          this.io.printDebug(`PrintInt ${listener.name()} ${val}`);
        }
        this.io.print(String(val));
      };
    };

    return createCommand();
  }

  /**
   * Char Output Sentence
   */
  visitCharOutputSentence(
    char_output: Ast.CharOutputSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      const speaker = arg.character;

      return function (this: Program) {
        let subject = this.interlocutor(speaker!!!);
        let val = subject.value();

        if (this.io.debug) {
          this.io.printDebug(
            `PrintChar ${subject.name()} ${val}: ${String.fromCodePoint(val)}`,
          );
        }
        this.io.print(String.fromCodePoint(val));
      };
    };

    return createCommand();
  }

  /**
   * Remember Sentence
   */
  visitRememberSentence(
    remember: Ast.RememberSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (pronoun: Function): Function => {
      const speaking = arg.character;
      const p = pronoun;

      return function (this: Program) {
        const pn = p.call(this);
        const sourceCharacter = this.characters[pn]!!!;
        const targetCharacter = this.interlocutor(speaking!!!);
        let value = sourceCharacter.value();
        targetCharacter.remember(value);

        if (this.io.debug) {
          this.io.printDebug(
            `${targetCharacter.name()} remembers ${sourceCharacter.name()}'s value: ${value}, ${targetCharacter.name()}'s stack: [${
              (targetCharacter as any)._memory
            }]`,
          );
        }
      };
    };

    let p = remember.pronoun.visit(this, arg);

    return createCommand(p);
  }

  /**
   * Recall Sentence
   */
  visitRecallSentence(
    recall: Ast.RecallSentence,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      const speaking = arg.character;

      return function (this: Program) {
        const character = this.interlocutor(speaking!!!);

        if (this.io.debug) {
          this.io.printDebug(
            `Recall from ${character.name()}, stack before: [${
              (character as any)._memory
            }]`,
          );
        }

        character.recall();

        if (this.io.debug) {
          this.io.printDebug(
            `${character.name()} = ${character.value()} after recall, stack now: [${
              (character as any)._memory
            }]`,
          );
        }
      };
    };

    return createCommand();
  }

  /**
   * Positive Constant Value
   */
  visitPositiveConstantValue(
    pc_val: Ast.PositiveConstantValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (num_adjectives: number): Function => {
      let exp = num_adjectives;

      return function () {
        return Math.pow(2, exp);
      };
    };

    let adjectives = pc_val.adjectives;

    return createCommand(adjectives.length);
  }

  /**
   * Negative Constant Value
   */
  visitNegativeConstantValue(
    nc_val: Ast.NegativeConstantValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (num_adjectives: number): Function => {
      let exp = num_adjectives;

      return function () {
        return -1 * Math.pow(2, exp);
      };
    };

    let adjectives = nc_val.adjectives;

    return createCommand(adjectives.length);
  }

  visitZeroValue(
    zero: Ast.ZeroValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      return function () {
        return 0;
      };
    };

    return createCommand();
  }

  /**
   * Unary Operation Value
   */
  visitUnaryOperationValue(
    unary: Ast.UnaryOperationValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (operator: Function, value: Function): Function => {
      let o = operator;
      let v = value;

      return function (this: Program) {
        let val = v.call(this);
        return o.call(this, val);
      };
    };

    let o = unary.operator.visit(this, arg);
    let v = unary.value.visit(this, arg);

    return createCommand(o, v);
  }

  /**
   * Arithmetic Operation Value
   */
  visitArithmeticOperationValue(
    arithmetic: Ast.ArithmeticOperationValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (
      operator: Function,
      value1: Function,
      value2: Function,
    ): Function => {
      let o = operator;
      let v1 = value1;
      let v2 = value2;

      return function (this: Program) {
        let val1 = v1.call(this);
        let val2 = v2.call(this);
        return o.call(this, val1, val2);
      };
    };

    let o = arithmetic.operator.visit(this, arg);
    let v1 = arithmetic.value_1.visit(this, arg);
    let v2 = arithmetic.value_2.visit(this, arg);

    return createCommand(o, v1, v2);
  }

  /**
   * Pronoun Value
   */
  visitPronounValue(
    pronoun: Ast.PronounValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (p: Function): Function => {
      let pronoun = p;

      return function (this: Program) {
        let p = pronoun.call(this);
        return this.characters[p]!!!.value();
      };
    };
    let p = pronoun.pronoun.visit(this, arg);

    return createCommand(p);
  }

  /**
   * Greater Than Comparison
   */
  visitGreaterThanComparison(
    comparison: Ast.GreaterThanComparison,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      return function (this: Program, a: number, b: number) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} > ${b}`);
        }
        return a > b;
      };
    };

    return createCommand();
  }

  /**
   * Lesser Than Comparison
   */
  visitLesserThanComparison(
    comparison: Ast.LesserThanComparison,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      return function (this: Program, a: number, b: number) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} < ${b}`);
        }
        return a < b;
      };
    };

    return createCommand();
  }

  /**
   * Equal To Comparison
   */
  visitEqualToComparison(
    comparison: Ast.EqualToComparison,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      return function (this: Program, a: number, b: number) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} == ${b}`);
        }
        return a === b;
      };
    };

    return createCommand();
  }

  /**
   * Inverse Comparison
   */
  visitInverseComparison(
    comparison: Ast.InverseComparison,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (comparison: Function): Function => {
      let c = comparison;

      return function (this: Program, a: number, b: number) {
        return !c.call(this, a, b);
      };
    };

    let c = comparison.comparison.visit(this, arg);

    return createCommand(c);
  }

  /**
   * First Person Pronoun
   */
  visitFirstPersonPronoun(
    fpp: Ast.FirstPersonPronoun,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      let speaking = arg.character;

      return function () {
        return speaking;
      };
    };

    return createCommand();
  }

  /**
   * Second Person Pronoun
   */
  visitSecondPersonPronoun(
    spp: Ast.SecondPersonPronoun,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (): Function => {
      let speaking = arg.character;

      return function (this: Program) {
        return this.interlocutor(speaking!!!).name();
      };
    };

    return createCommand();
  }

  /**
   * Unary Operator
   */
  visitUnaryOperator(
    operator: Ast.UnaryOperator,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (operator: string): Function => {
      let o = operator;

      switch (o) {
        case "square of":
          return function (v: number) {
            return Math.pow(v, 2);
          };
        case "cube of":
          return function (v: number) {
            return Math.pow(v, 3);
          };
        case "square root of":
          return function (v: number) {
            let sign = v < 0 ? -1 : 1;
            return sign * Math.floor(Math.sqrt(Math.abs(v)));
          };
        case "factorial of":
          return function (v: number) {
            let sign = v < 0 ? -1 : 1;
            let num = Math.abs(v);
            let fv = 1;
            for (let i = 2; i <= num; i++) {
              fv = fv * i;
            }
            return sign * fv;
          };
        case "twice":
          return function (v: number) {
            return 2 * v;
          };
        default:
          throw new Error(`Unknown unary operator: ${o}`);
      }
    };

    let o = operator.sequence;

    return createCommand(o);
  }

  /**
   * Arithmetic Operator
   */
  visitArithmeticOperator(
    operator: Ast.ArithmeticOperator,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (operator: string): Function => {
      let o = operator;

      switch (o) {
        case "sum of":
          return function (a: number, b: number) {
            return a + b;
          };
        case "difference between":
          return function (a: number, b: number) {
            return a - b;
          };
        case "product of":
          return function (a: number, b: number) {
            return a * b;
          };
        case "quotient between":
          return function (a: number, b: number) {
            if (b === 0) {
              throw new Error("Runtime Error - Division by zero.");
            }
            return Math.round(a / b);
          };
        case "remainder of the quotient between":
          return function (a: number, b: number) {
            if (b === 0) {
              throw new Error("Runtime Error - Division by zero.");
            }
            return a % b;
          };
        default:
          throw new Error(`Unknown arithmetic operator: ${o}`);
      }
    };

    let o = operator.sequence;

    return createCommand(o);
  }

  /**
   * Be
   */
  visitBe(be: Ast.Be, arg: { act: number; scene: number; character?: string }) {
    const createCommand = (be: string): Function => {
      let b = be;
      let speaking = arg.character;

      switch (b) {
        case "Thou art":
        case "You are":
        case "You":
          return function (this: Program) {
            return this.interlocutor(speaking!!!).name();
          };
        case "I am":
          return function () {
            return speaking;
          };
        default:
          throw new Error(`Unknown be form: ${b}`);
      }
    };

    let b = be.sequence;

    return createCommand(b);
  }

  /**
   * Be Comparative
   */
  visitBeComparative(
    be: Ast.BeComparative,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (be: string): Function => {
      let speaking = arg.character;

      switch (be) {
        case "Art thou":
        case "Are you":
          return function (this: Program) {
            return this.interlocutor(speaking!!!).value();
          };
        case "Am I":
          return function (this: Program) {
            return this.characters[speaking!!!]!!!.value();
          };
        default:
          throw new Error(`Unknown be comparative form: ${be}`);
      }
    };

    let b = be.sequence;

    return createCommand(b);
  }

  visitCharacterValue(
    characterValue: Ast.CharacterValue,
    arg: { act: number; scene: number; character?: string },
  ) {
    const createCommand = (character: Ast.Character): Function => {
      return function (this: Program) {
        return this.characters[character.sequence]!!!.value();
      };
    };

    return createCommand(characterValue.character);
  }
}

/**
 * Horatio Generation Visitor
 */
export default class Generator {
  /**
   * Program
   */
  visitProgram(program, arg) {
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
  visitDeclaration(declaration, arg) {
    let c = declaration.character.sequence;
    this.program.declareCharacter(c);
    return null;
  }

  /**
   * Numeral
   */
  visitNumeral(numeral, arg) {
    let n = this.numeralIndex(numeral.sequence);
    return n;
  }

  /**
   * Part
   */
  visitPart(part, arg) {
    let self = this;

    let n = part.numeral.visit(this, arg);
    let act = this.program.newAct();
    part.subparts.forEach(function (subpart) {
      subpart.visit(self, { act: act });
    });

    return null;
  }

  /**
   * Subparts
   */
  visitSubpart(subpart, arg) {
    let n = subpart.numeral.visit(this, arg);
    let scene = this.program.newScene(arg.act);
    subpart.stage.visit(this, { act: arg.act, scene: scene });

    return null;
  }

  /**
   * Stage
   */
  visitStage(stage, arg) {
    stage.directions.forEach((direction) => {
      direction.visit(this, arg);
    });

    return null;
  }

  /**
   * Enter
   */
  visitEnter(presence, arg) {
    let Command = function (cname) {
      let c = cname;
      return function () {
        if (this.io.debug) {
          this.io.printDebug(`Enter ${c}`);
        }
        this.enterStage(c);
      };
    };

    let c1 = presence.character_1.sequence;

    this.program.addCommand(arg.act, arg.scene, new Command(c1));

    if (presence.character_2) {
      let c2 = presence.character_2.sequence;

      this.program.addCommand(arg.act, arg.scene, new Command(c2));
    }

    return null;
  }

  /**
   * Exit
   */
  visitExit(presence, arg) {
    let Command = function (cname) {
      let c = cname;
      return function () {
        if (this.io.debug) {
          this.io.printDebug(`Exit ${c}`);
        }
        this.exitStage(c);
      };
    };

    let c = presence.character.sequence;

    this.program.addCommand(arg.act, arg.scene, new Command(c));

    return null;
  }

  /**
   * Exeunt
   */
  visitExeunt(presence, arg) {
    let Command = function () {
      return function () {
        if (this.io.debug) {
          this.io.printDebug(
            `Exeunt ${this.stage.map((c) => c.name()).join(", ")}`,
          );
        }
        this.exeuntStage();
      };
    };

    this.program.addCommand(arg.act, arg.scene, new Command());

    return null;
  }

  /**
   * Dialogue
   */
  visitDialogue(dialogue, arg) {
    let self = this;
    dialogue.lines.forEach(function (line) {
      line.visit(self, arg);
    });
    return null;
  }

  /**
   * Line
   */
  visitLine(line, arg) {
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
  visitAssignmentSentence(assignment, arg) {
    let Command = function (target, value) {
      let t = target;
      let v = value;

      return function () {
        let target = t.call(this);
        let val = v.call(this);

        if (this.io.debug) {
          this.io.printDebug(`${target} = ${val}`);
        }

        this.characters[target].setValue(val);
      };
    };

    let target = assignment.be.visit(this, arg);
    let value = assignment.value.visit(this, arg);

    return new Command(target, value);
  }

  /**
   * Question Sentence
   */
  visitQuestionSentence(question, arg) {
    let Command = function (value1, comparative, value2) {
      return function () {
        let val1 = value1.call(this);
        let val2 = value2.call(this);
        let result = comparative.call(this, val1, val2);

        if (this.io.debug) {
          this.io.printDebug(`Question is ${result}`);
        }

        this.setGlobalBool(result);
      };
    };

    let value1 = question.value1.visit(this, arg);
    let comparative = question.comparison.visit(this, arg);
    let value2 = question.value2.visit(this, arg);

    return new Command(value1, comparative, value2);
  }

  /**
   * Response Sentence
   */
  visitResponseSentence(response, arg) {
    let Command = function (sentence) {
      return function () {
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

    return new Command(sentence);
  }

  /**
   * Goto Sentence
   */
  visitGotoSentence(goto, arg) {
    let Command = function (part, sceneIndex) {
      return function () {
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

    return new Command(goto.part, sceneIndex);
  }

  /**
   * Integer Input Sentence
   */
  visitIntegerInputSentence(integer_input, arg) {
    let Command = function () {
      let speaker = arg.character;

      return function () {
        let subject = this.interlocutor(speaker);

        this.io.read((input) =>
          subject.setValue(input === "" ? -1 : parseInt(input)),
        );

        if (this.io.debug) {
          this.io.printDebug(`${subject.name()} = ${subject.value()}`);
        }
      };
    };

    return new Command();
  }

  /**
   * Char Input Sentence
   */
  visitCharInputSentence(char_input, arg) {
    let Command = function () {
      let speaker = arg.character;

      return function () {
        let subject = this.interlocutor(speaker);

        this.io.read((input) =>
          subject.setValue(input === "" ? -1 : input.charCodeAt(0)),
        );

        if (this.io.debug) {
          this.io.printDebug(`${subject.name()} = ${subject.value()}`);
        }
      };
    };

    return new Command();
  }

  /**
   * Integer Output Sentence
   */
  visitIntegerOutputSentence(integer_output, arg) {
    let Command = function () {
      let speaker = arg.character;

      return function () {
        let val = this.interlocutor(speaker).value();

        if (this.io.debug) {
          this.io.printDebug(`PrintInt ${speaker} ${val}`);
        } else {
          this.io.print(val);
        }
      };
    };

    return new Command();
  }

  /**
   * Char Output Sentence
   */
  visitCharOutputSentence(char_output, arg) {
    let Command = function () {
      let speaker = arg.character;

      return function () {
        let subject = this.interlocutor(speaker);
        let val = subject.value();

        if (this.io.debug) {
          this.io.printDebug(
            `PrintChar ${subject.name()} ${val}: ${String.fromCharCode(val)}`,
          );
        } else {
          this.io.print(String.fromCharCode(val));
        }
      };
    };

    return new Command();
  }

  /**
   * Remember Sentence
   */
  visitRememberSentence(remember, arg) {
    let Command = function (pronoun) {
      let speaking = arg.character;
      let p = pronoun;

      return function () {
        let pn = p.call(this);
        let character = this.characters[pn];
        let value = character.value();
        character.remember(value);

        if (this.io.debug) {
          this.io.printDebug(`Remember ${value}, [${character._memory}]`);
        }
      };
    };

    let p = remember.pronoun.visit(this, arg);

    return new Command(p);
  }

  /**
   * Recall Sentence
   */
  visitRecallSentence(recall, arg) {
    let Command = function () {
      let speaking = arg.character;

      return function () {
        this.interlocutor(speaking).recall();
      };
    };

    return new Command();
  }

  /**
   * Positive Constant Value
   */
  visitPositiveConstantValue(pc_val, arg) {
    let Command = function (num_adjectives) {
      let exp = num_adjectives;

      return function () {
        return Math.pow(2, exp);
      };
    };

    let adjectives = pc_val.adjectives;

    return new Command(adjectives.length);
  }

  /**
   * Negative Constant Value
   */
  visitNegativeConstantValue(nc_val, arg) {
    let Command = function (num_adjectives) {
      let exp = num_adjectives;

      return function () {
        return -1 * Math.pow(2, exp);
      };
    };

    let adjectives = nc_val.adjectives;

    return new Command(adjectives.length);
  }

  visitZeroValue(zero, arg) {
    let Command = function () {
      return function () {
        return 0;
      };
    };

    return new Command();
  }

  /**
   * Unary Operation Value
   */
  visitUnaryOperationValue(unary, arg) {
    let Command = function (operator, value) {
      let o = operator;
      let v = value;

      return function () {
        let val = v.call(this);
        return o.call(this, val);
      };
    };

    let o = unary.operator.visit(this, arg);
    let v = unary.value.visit(this, arg);

    return new Command(o, v);
  }

  /**
   * Arithmetic Operation Value
   */
  visitArithmeticOperationValue(arithmetic, arg) {
    let Command = function (operator, value1, value2) {
      let o = operator;
      let v1 = value1;
      let v2 = value2;

      return function () {
        let val1 = v1.call(this);
        let val2 = v2.call(this);
        return o.call(this, val1, val2);
      };
    };

    let o = arithmetic.operator.visit(this, arg);
    let v1 = arithmetic.value_1.visit(this, arg);
    let v2 = arithmetic.value_2.visit(this, arg);

    return new Command(o, v1, v2);
  }

  /**
   * Pronoun Value
   */
  visitPronounValue(pronoun, arg) {
    let Command = function (p) {
      let pronoun = p;

      return function () {
        let p = pronoun.call(this);
        return this.characters[p].value();
      };
    };
    let p = pronoun.pronoun.visit(this, arg);

    return new Command(p);
  }

  /**
   * Greater Than Comparison
   */
  visitGreaterThanComparison(comparison, arg) {
    let Command = function () {
      return function (a, b) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} > ${b}`);
        }
        return a > b;
      };
    };

    return new Command();
  }

  /**
   * Lesser Than Comparison
   */
  visitLesserThanComparison(comparison, arg) {
    let Command = function () {
      return function (a, b) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} < ${b}`);
        }
        return a < b;
      };
    };

    return new Command();
  }

  /**
   * Equal To Comparison
   */
  visitEqualToComparison(comparison, arg) {
    let Command = function () {
      return function (a, b) {
        if (this.io.debug) {
          this.io.printDebug(`Compare ${a} == ${b}`);
        }
        return a === b;
      };
    };

    return new Command();
  }

  /**
   * Inverse Comparison
   */
  visitInverseComparison(comparison, arg) {
    let Command = function (comparison) {
      let c = comparison;

      return function (a, b) {
        return !c(a, b);
      };
    };

    let c = comparison.comparison.visit(this, arg);

    return new Command(c);
  }

  /**
   * First Person Pronoun
   */
  visitFirstPersonPronoun(fpp, arg) {
    let Command = function () {
      let speaking = arg.character;

      return function () {
        return speaking;
      };
    };

    return new Command();
  }

  /**
   * Second Person Pronoun
   */
  visitSecondPersonPronoun(spp, arg) {
    let Command = function () {
      let speaking = arg.character;

      return function () {
        return this.interlocutor(speaking).name();
      };
    };

    return new Command();
  }

  /**
   * Unary Operator
   */
  visitUnaryOperator(operator, arg) {
    let Command = function (operator) {
      let o = operator;

      switch (o) {
        case "square of":
          return function (v) {
            return Math.pow(v, 2);
          };
        case "cube of":
          return function (v) {
            return Math.pow(v, 3);
          };
        case "square root of":
          return function (v) {
            let sign = v < 0 ? -1 : 1;
            return sign * Math.floor(Math.sqrt(Math.abs(v)));
          };
        case "factorial of":
          return function (v) {
            let sign = v < 0 ? -1 : 1;
            let num = Math.abs(v);
            let fv = 1;
            for (let i = 2; i <= num; i++) {
              fv = fv * i;
            }
            return sign * fv;
          };
        case "twice":
          return function (v) {
            return 2 * v;
          };
      }
    };

    let o = operator.sequence;

    return new Command(o);
  }

  /**
   * Arithmetic Operator
   */
  visitArithmeticOperator(operator, arg) {
    let Command = function (operator) {
      let o = operator;

      switch (o) {
        case "sum of":
          return function (a, b) {
            return a + b;
          };
        case "difference between":
          return function (a, b) {
            return a - b;
          };
        case "product of":
          return function (a, b) {
            return a * b;
          };
        case "quotient between":
          return function (a, b) {
            return Math.round(a / b);
          };
        case "remainder of the quotient between":
          return function (a, b) {
            return a % b;
          };
      }
    };

    let o = operator.sequence;

    return new Command(o);
  }

  /**
   * Be
   */
  visitBe(be, arg) {
    let Command = function (be) {
      let b = be;
      let speaking = arg.character;

      switch (b) {
        case "Thou art":
        case "You are":
        case "You":
          return function () {
            return this.interlocutor(speaking).name();
          };
        case "I am":
          return function () {
            return speaking;
          };
      }
    };

    let b = be.sequence;

    return new Command(b);
  }

  /**
   * Be Comparative
   */
  visitBeComparative(be, arg) {
    let Command = function (be) {
      let speaking = arg.character;

      switch (be) {
        case "Art thou":
        case "Are you":
          return function () {
            return this.interlocutor(speaking).value();
          };
        case "Am I":
          return function () {
            return this.characters[speaking].value();
          };
      }
    };

    let b = be.sequence;

    return new Command(b);
  }

  visitCharacterValue(characterValue, arg) {
    let Command = function (character) {
      return function () {
        return this.characters[character.sequence].value();
      };
    };

    return new Command(characterValue.character);
  }
}

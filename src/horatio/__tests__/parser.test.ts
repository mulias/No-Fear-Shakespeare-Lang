import Parser from "../parser";
import * as Ast from "../ast";

describe("Horatio Parser", () => {
  describe("YOU token handling", () => {
    it("should parse 'You' assignments without 'are'", () => {
      const spl = `
        Test for You token assignments.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You pretty little warm thing!
          You are a pretty little warm thing!
          Thou art a pretty little warm thing!
          You nothing!
          You are nothing!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(5);

      // Test "You pretty little warm thing!"
      expect(sentences[0]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment1 = sentences[0] as Ast.AssignmentSentence;
      expect(assignment1.be.sequence).toBe("You");
      expect(assignment1.value).toBeInstanceOf(Ast.PositiveConstantValue);

      // Test "You are a pretty little warm thing!"
      expect(sentences[1]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment2 = sentences[1] as Ast.AssignmentSentence;
      expect(assignment2.be.sequence).toBe("You are");
      expect(assignment2.value).toBeInstanceOf(Ast.PositiveConstantValue);

      // Test "Thou art a pretty little warm thing!"
      expect(sentences[2]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment3 = sentences[2] as Ast.AssignmentSentence;
      expect(assignment3.be.sequence).toBe("Thou art");
      expect(assignment3.value).toBeInstanceOf(Ast.PositiveConstantValue);

      // Test "You nothing!"
      expect(sentences[3]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment4 = sentences[3] as Ast.AssignmentSentence;
      expect(assignment4.be.sequence).toBe("You");
      expect(assignment4.value).toBeInstanceOf(Ast.ZeroValue);

      // Test "You are nothing!"
      expect(sentences[4]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment5 = sentences[4] as Ast.AssignmentSentence;
      expect(assignment5.be.sequence).toBe("You are");
      expect(assignment5.value).toBeInstanceOf(Ast.ZeroValue);
    });

    it("should parse 'You' in pronoun contexts", () => {
      const spl = `
        Test for You as pronoun.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are the sum of you and a cat.
          Remember you.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(2);

      // Test "You are the sum of you and a cat."
      expect(sentences[0]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment = sentences[0] as Ast.AssignmentSentence;
      expect(assignment.be.sequence).toBe("You are");
      expect(assignment.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      const arithmeticValue = assignment.value as Ast.ArithmeticOperationValue;
      expect(arithmeticValue.value_1).toBeInstanceOf(Ast.PronounValue);
      const pronounValue = arithmeticValue.value_1 as Ast.PronounValue;
      expect(pronounValue.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);
      expect(pronounValue.pronoun.sequence).toBe("you");

      // Test "Remember you."
      expect(sentences[1]).toBeInstanceOf(Ast.RememberSentence);
      const rememberSentence = sentences[1] as Ast.RememberSentence;
      expect(rememberSentence.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);
      expect(rememberSentence.pronoun.sequence).toBe("you");
    });

    it("should parse 'You' in all SECOND_PERSON_PRONOUN contexts", () => {
      const spl = `
        Comprehensive You token test.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are the square of you.
          You are the sum of you and you.
          I am the difference between you and me.
          Remember you.
          You are the product of a cat and you.
          You are as lovely as the sum of you and a rose.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(6);

      // Test "You are the square of you."
      const sent0 = sentences[0] as Ast.AssignmentSentence;
      expect(sent0).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sent0.value).toBeInstanceOf(Ast.UnaryOperationValue);
      const unaryOp = sent0.value as Ast.UnaryOperationValue;
      expect(unaryOp.value).toBeInstanceOf(Ast.PronounValue);
      const unaryPronoun = unaryOp.value as Ast.PronounValue;
      expect(unaryPronoun.pronoun.sequence).toBe("you");

      // Test "You are the sum of you and you."
      const sent1 = sentences[1] as Ast.AssignmentSentence;
      expect(sent1).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sent1.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      const arithOp = sent1.value as Ast.ArithmeticOperationValue;
      expect(arithOp.value_1).toBeInstanceOf(Ast.PronounValue);
      expect(arithOp.value_2).toBeInstanceOf(Ast.PronounValue);
      const pronoun1 = arithOp.value_1 as Ast.PronounValue;
      const pronoun2 = arithOp.value_2 as Ast.PronounValue;
      expect(pronoun1.pronoun.sequence).toBe("you");
      expect(pronoun2.pronoun.sequence).toBe("you");

      // Test "I am the difference between you and me."
      const sent2 = sentences[2] as Ast.AssignmentSentence;
      expect(sent2).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sent2.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      const diffOp = sent2.value as Ast.ArithmeticOperationValue;
      expect(diffOp.value_1).toBeInstanceOf(Ast.PronounValue);
      const diffPronoun = diffOp.value_1 as Ast.PronounValue;
      expect(diffPronoun.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);
      expect(diffPronoun.pronoun.sequence).toBe("you");

      // Test "Remember you."
      expect(sentences[3]).toBeInstanceOf(Ast.RememberSentence);
      const rememberSent = sentences[3] as Ast.RememberSentence;
      expect(rememberSent.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);
      expect(rememberSent.pronoun.sequence).toBe("you");

      // Test "You are the product of a cat and you."
      const sent4 = sentences[4] as Ast.AssignmentSentence;
      expect(sent4).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sent4.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      const prodOp = sent4.value as Ast.ArithmeticOperationValue;
      expect(prodOp.value_2).toBeInstanceOf(Ast.PronounValue);
      const prodPronoun = prodOp.value_2 as Ast.PronounValue;
      expect(prodPronoun.pronoun.sequence).toBe("you");

      // Test "You are as lovely as the sum of you and a rose."
      const sent5 = sentences[5] as Ast.AssignmentSentence;
      expect(sent5).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sent5.comparative).toBeDefined();
      expect(sent5.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
    });

    it("should handle mixed case 'You' variations", () => {
      const spl = `
        Test for case variations.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You a cat!
          you a cat!
          YOU a cat!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(3);

      // All three should parse as assignments
      sentences.forEach((sentence, index) => {
        expect(sentence).toBeInstanceOf(Ast.AssignmentSentence);
        const assignment = sentence as Ast.AssignmentSentence;
        expect(assignment.be.sequence.toLowerCase()).toBe("you");
        expect(assignment.value).toBeInstanceOf(Ast.PositiveConstantValue);
      });
    });

    it("should parse 'You' with comparative forms", () => {
      const spl = `
        Test for You with comparatives.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You as pretty as a rose!
          You are as pretty as a rose!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(2);

      // Test "You as pretty as a rose!"
      expect(sentences[0]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment1 = sentences[0] as Ast.AssignmentSentence;
      expect(assignment1.be.sequence).toBe("You");
      expect(assignment1.comparative).toBeDefined();

      // Test "You are as pretty as a rose!"
      expect(sentences[1]).toBeInstanceOf(Ast.AssignmentSentence);
      const assignment2 = sentences[1] as Ast.AssignmentSentence;
      expect(assignment2.be.sequence).toBe("You are");
      expect(assignment2.comparative).toBeDefined();
    });
  });

  describe("Assignment statements", () => {
    it("should parse all valid assignment forms", () => {
      const spl = `
        Test all assignment forms.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          I am a cat.
          You are a cat.
          You a cat.
          Thou art a cat.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences).toHaveLength(4);

      // All should be assignment sentences
      sentences.forEach((sentence) => {
        expect(sentence).toBeInstanceOf(Ast.AssignmentSentence);
      });
    });
  });
});
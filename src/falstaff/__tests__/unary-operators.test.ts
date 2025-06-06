import { Falstaff } from "../index";
import * as HoratioAst from "../../horatio/ast";
import { prettyPrint } from "../../ophelia";

describe("Falstaff Unary Operators", () => {
  describe("square operator", () => {
    it("should convert 'square of' to square()", () => {
      const title = new HoratioAst.Comment("Square Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: square of Romeo
      const romeoValue = new HoratioAst.CharacterValue(romeo);
      const squareOperator = new HoratioAst.UnaryOperator("square of");
      const squareValue = new HoratioAst.UnaryOperationValue(
        squareOperator,
        romeoValue,
      );

      // Assignment: You are the square of Romeo
      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        squareValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("the square of"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(square(romeo))");
    });
  });

  describe("cube operator", () => {
    it("should convert 'cube of' to cube()", () => {
      const title = new HoratioAst.Comment("Cube Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: cube of 3 (a lovely cat)
      const cat = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("cat"),
        [new HoratioAst.PositiveAdjective("lovely")], // 2^1 = 2
        "a",
      );
      const cubeOperator = new HoratioAst.UnaryOperator("cube of");
      const cubeValue = new HoratioAst.UnaryOperationValue(cubeOperator, cat);

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        cubeValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("the cube of"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(cube(2))");
    });
  });

  describe("square root operator", () => {
    it("should convert 'square root of' to square_root()", () => {
      const title = new HoratioAst.Comment("Square Root Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: square root of you
      const youValue = new HoratioAst.PronounValue(
        new HoratioAst.SecondPersonPronoun("you"),
      );
      const sqrtOperator = new HoratioAst.UnaryOperator("square root of");
      const sqrtValue = new HoratioAst.UnaryOperationValue(
        sqrtOperator,
        youValue,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        sqrtValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("the square root of"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(square_root(@you))");
    });
  });

  describe("factorial operator", () => {
    it("should convert 'factorial of' to factorial()", () => {
      const title = new HoratioAst.Comment("Factorial Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: factorial of the sum of a cat and a dog
      const cat = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("cat"),
        [],
        "a",
      ); // 1
      const dog = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("dog"),
        [new HoratioAst.PositiveAdjective("lovely")],
        "a",
      ); // 2
      const sum = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum"),
        cat,
        dog,
      );
      const factorialOperator = new HoratioAst.UnaryOperator("factorial of");
      const factorialValue = new HoratioAst.UnaryOperationValue(
        factorialOperator,
        sum,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        factorialValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("the factorial of"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(factorial(1 + 2))");
    });
  });

  describe("nested unary operators", () => {
    it("should handle nested unary operations", () => {
      const title = new HoratioAst.Comment("Nested Unary Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: square of the square root of Romeo
      const romeoValue = new HoratioAst.CharacterValue(romeo);
      const sqrtOperator = new HoratioAst.UnaryOperator("square root of");
      const sqrtValue = new HoratioAst.UnaryOperationValue(
        sqrtOperator,
        romeoValue,
      );
      const squareOperator = new HoratioAst.UnaryOperator("square of");
      const nestedValue = new HoratioAst.UnaryOperationValue(
        squareOperator,
        sqrtValue,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        nestedValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("as good as"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(square(square_root(romeo)))");
    });
  });

  describe("twice operator", () => {
    it("should convert 'twice' to '2 * X'", () => {
      const title = new HoratioAst.Comment("Twice Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: twice Romeo
      const romeoValue = new HoratioAst.CharacterValue(romeo);
      const twiceOperator = new HoratioAst.UnaryOperator("twice");
      const twiceValue = new HoratioAst.UnaryOperationValue(
        twiceOperator,
        romeoValue,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        twiceValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("twice"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(2 * romeo)");
    });

    it("should convert 'twice' with complex expression", () => {
      const title = new HoratioAst.Comment("Twice Complex Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: twice the sum of Romeo and 3
      const romeoValue = new HoratioAst.CharacterValue(romeo);
      const cat = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("cat"),
        [new HoratioAst.PositiveAdjective("lovely")], // 2^1 = 2
        "a",
      );
      const dog = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("dog"),
        [],
        "a",
      ); // 1
      const sumValue = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum of"),
        cat,
        dog,
      ); // 2 + 1 = 3

      const innerSum = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum of"),
        romeoValue,
        sumValue,
      ); // romeo + 3

      const twiceOperator = new HoratioAst.UnaryOperator("twice");
      const twiceValue = new HoratioAst.UnaryOperationValue(
        twiceOperator,
        innerSum,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        twiceValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("twice"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(2 * (romeo + 2 + 1))");
    });
  });

  describe("unary with arithmetic", () => {
    it("should handle unary operations within arithmetic expressions", () => {
      const title = new HoratioAst.Comment("Mixed Operations Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a number holder."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a calculator."),
      );

      // Create value: the sum of the square of Romeo and the cube of a cat
      const romeoValue = new HoratioAst.CharacterValue(romeo);
      const squareOperator = new HoratioAst.UnaryOperator("square of");
      const squareValue = new HoratioAst.UnaryOperationValue(
        squareOperator,
        romeoValue,
      );

      const cat = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("cat"),
        [],
        "a",
      ); // 1
      const cubeOperator = new HoratioAst.UnaryOperator("cube of");
      const cubeValue = new HoratioAst.UnaryOperationValue(cubeOperator, cat);

      const sumValue = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum"),
        squareValue,
        cubeValue,
      );

      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        sumValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("as good as"),
      );

      const line = new HoratioAst.Line(juliet, [assignment]);
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter([romeo, juliet]),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test act."),
        [subpart],
      );

      const program = new HoratioAst.Program(
        title,
        [romeoDecl, julietDecl],
        [act],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("@you.set(square(romeo) + cube(1))");
    });
  });
});

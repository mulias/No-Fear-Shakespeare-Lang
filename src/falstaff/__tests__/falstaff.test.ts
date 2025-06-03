import { Falstaff } from "../index";
import * as HoratioAst from "../../horatio/ast";
import { prettyPrint } from "../../ophelia";

describe("Falstaff", () => {
  describe("Hello World conversion", () => {
    it("should convert title to doc comment", () => {
      const title = new HoratioAst.Comment("The Infamous Hello World Program.");
      const program = new HoratioAst.Program(title, [], []);

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("## title: The Infamous Hello World Program.");
    });

    it("should convert character declarations to var doc comments", () => {
      const title = new HoratioAst.Comment("Test Program.");
      const romeo = new HoratioAst.Declaration(
        new HoratioAst.Character("Romeo"),
        new HoratioAst.Comment("a young man with a remarkable patience."),
      );
      const juliet = new HoratioAst.Declaration(
        new HoratioAst.Character("Juliet"),
        new HoratioAst.Comment("a likewise young woman of remarkable grace."),
      );

      const program = new HoratioAst.Program(title, [romeo, juliet], []);

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain(
        "## var romeo: a young man with a remarkable patience.",
      );
      expect(nfspl).toContain(
        "## var juliet: a likewise young woman of remarkable grace.",
      );
    });

    it("should convert character names to lowercase", () => {
      const title = new HoratioAst.Comment("Test Program.");
      const ladyMacbeth = new HoratioAst.Declaration(
        new HoratioAst.Character("Lady Macbeth"),
        new HoratioAst.Comment("an ambitious woman."),
      );
      const theBishop = new HoratioAst.Declaration(
        new HoratioAst.Character("The Bishop"),
        new HoratioAst.Comment("a holy man."),
      );

      const program = new HoratioAst.Program(
        title,
        [ladyMacbeth, theBishop],
        [],
      );

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("## var lady_macbeth: an ambitious woman.");
      expect(nfspl).toContain("## var the_bishop: a holy man.");
    });

    it("should convert acts and scenes with labels and descriptions", () => {
      const title = new HoratioAst.Comment("Test Program.");

      // We need to add Romeo and Juliet declarations for template substitution to work
      const romeo = new HoratioAst.Declaration(
        new HoratioAst.Character("Romeo"),
        new HoratioAst.Comment("a young man."),
      );
      const juliet = new HoratioAst.Declaration(
        new HoratioAst.Character("Juliet"),
        new HoratioAst.Comment("a young woman."),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Juliet's insults and flattery."),
        [
          new HoratioAst.Subpart(
            new HoratioAst.Numeral("I"),
            new HoratioAst.Comment("The insulting of Romeo."),
            new HoratioAst.Stage([]),
          ),
        ],
      );

      const program = new HoratioAst.Program(title, [romeo, juliet], [act]);

      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      expect(nfspl).toContain("Act1 {");
      expect(nfspl).toContain(
        "## description: {juliet}'s insults and flattery.",
      );
      expect(nfspl).toContain("Scene1 {");
      expect(nfspl).toContain("## description: The insulting of {romeo}.");
    });

    it("should convert Enter/Exit/Exeunt to stage/unstage", () => {
      const title = new HoratioAst.Comment("Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      // Add declarations so we have the character mappings
      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a young man."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a young woman."),
      );

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter(romeo, juliet),
          new HoratioAst.Exeunt(), // No parameters means everyone exits
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

      expect(nfspl).toContain("stage(romeo, juliet)");
      expect(nfspl).toContain("unstage_all");
    });

    it("should convert dialogue with assignment and output", () => {
      const title = new HoratioAst.Comment("Test Program.");
      const romeo = new HoratioAst.Character("Romeo");
      const juliet = new HoratioAst.Character("Juliet");

      // Add declarations
      const romeoDecl = new HoratioAst.Declaration(
        romeo,
        new HoratioAst.Comment("a young man."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("a young woman."),
      );

      // Create a simple constant value (0)
      const zeroValue = new HoratioAst.ZeroValue("nothing");

      // Create assignment sentence: "You are as lovely as nothing"
      const assignment = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("are"),
        zeroValue,
        new HoratioAst.SecondPersonPronoun("You"),
        new HoratioAst.BeComparative("as lovely as"),
      );

      // Create output sentence: "Speak your mind!"
      const output = new HoratioAst.CharOutputSentence("Speak your mind!");

      // Create a Line with Juliet speaking
      const line = new HoratioAst.Line(juliet, [assignment, output]);

      // Create Dialogue with the line
      const dialogue = new HoratioAst.Dialogue([line]);

      const subpart = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("Test scene."),
        new HoratioAst.Stage([
          new HoratioAst.Enter(romeo, juliet),
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

      expect(nfspl).toContain("juliet {");
      expect(nfspl).toContain("@you.set(0)");
      expect(nfspl).toContain("@you.print_char");
    });
  });

  describe("Full Hello World SPL conversion", () => {
    it("should convert the complete hi.spl example", () => {
      // Create the full AST for hi.spl
      const title = new HoratioAst.Comment("A New Beginning.");

      const hamlet = new HoratioAst.Character("Hamlet");
      const juliet = new HoratioAst.Character("Juliet");

      const hamletDecl = new HoratioAst.Declaration(
        hamlet,
        new HoratioAst.Comment("a literary/storage device."),
      );
      const julietDecl = new HoratioAst.Declaration(
        juliet,
        new HoratioAst.Comment("an orator."),
      );

      // First sentence: "Thou art the sum of an amazing healthy honest noble peaceful fine Lord and a lovely sweet golden summer's day"
      // This is 64 + 8 = 72 = 'H'
      const lord = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("Lord"),
        [
          new HoratioAst.PositiveAdjective("amazing"),
          new HoratioAst.PositiveAdjective("healthy"),
          new HoratioAst.PositiveAdjective("honest"),
          new HoratioAst.PositiveAdjective("noble"),
          new HoratioAst.PositiveAdjective("peaceful"),
          new HoratioAst.PositiveAdjective("fine"),
        ],
        "an",
      );

      const summersDay = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("summer's day"),
        [
          new HoratioAst.PositiveAdjective("lovely"),
          new HoratioAst.PositiveAdjective("sweet"),
          new HoratioAst.PositiveAdjective("golden"),
        ],
        "a",
      );

      const sumValue1 = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum"),
        lord,
        summersDay,
      );

      const assignment1 = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("art"),
        sumValue1,
        new HoratioAst.SecondPersonPronoun("Thou"),
        new HoratioAst.BeComparative("the sum of"),
      );

      const output1 = new HoratioAst.CharOutputSentence("Speak your mind!");

      // Second sentence: "Thou art the sum of thyself and a King" (adds 1)
      const king = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("King"),
        [],
        "a",
      );

      const thyself = new HoratioAst.PronounValue(
        new HoratioAst.SecondPersonPronoun("thyself"),
      );

      const sumValue2 = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum"),
        thyself,
        king,
      );

      const assignment2 = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("art"),
        sumValue2,
        new HoratioAst.SecondPersonPronoun("Thou"),
        new HoratioAst.BeComparative("the sum of"),
      );

      const output2 = new HoratioAst.CharOutputSentence("Speak your mind!");

      // Third sentence: "Thou art the sum of an amazing healthy honest hamster and a golden nose"
      // This is 8 + 2 = 10 = newline
      const hamster = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("hamster"),
        [
          new HoratioAst.PositiveAdjective("amazing"),
          new HoratioAst.PositiveAdjective("healthy"),
          new HoratioAst.PositiveAdjective("honest"),
        ],
        "an",
      );

      const nose = new HoratioAst.PositiveConstantValue(
        new HoratioAst.PositiveNoun("nose"),
        [new HoratioAst.PositiveAdjective("golden")],
        "a",
      );

      const sumValue3 = new HoratioAst.ArithmeticOperationValue(
        new HoratioAst.ArithmeticOperator("sum"),
        hamster,
        nose,
      );

      const assignment3 = new HoratioAst.AssignmentSentence(
        new HoratioAst.Be("art"),
        sumValue3,
        new HoratioAst.SecondPersonPronoun("Thou"),
        new HoratioAst.BeComparative("the sum of"),
      );

      const output3 = new HoratioAst.CharOutputSentence("Speak your mind!");

      // Create the dialogue
      const line1 = new HoratioAst.Line(juliet, [assignment1, output1]);
      const line2 = new HoratioAst.Line(juliet, [
        assignment2,
        output2,
        assignment3,
        output3,
      ]);
      const dialogue = new HoratioAst.Dialogue([line1, line2]);

      const scene = new HoratioAst.Subpart(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("The Prince's Speech."),
        new HoratioAst.Stage([
          new HoratioAst.Enter(hamlet, juliet),
          dialogue,
          new HoratioAst.Exeunt(),
        ]),
      );

      const act = new HoratioAst.Part(
        new HoratioAst.Numeral("I"),
        new HoratioAst.Comment("The Only Act."),
        [scene],
      );

      const program = new HoratioAst.Program(
        title,
        [hamletDecl, julietDecl],
        [act],
      );

      // Convert and check output
      const falstaff = new Falstaff(program);
      const opheliaAst = falstaff.run();
      const nfspl = prettyPrint(opheliaAst);

      // Check structure
      expect(nfspl).toContain("## title: A New Beginning.");
      expect(nfspl).toContain("## var hamlet: a literary/storage device.");
      expect(nfspl).toContain("## var juliet: an orator.");
      expect(nfspl).toContain("## description: The Only Act.");
      expect(nfspl).toContain("Act1 {");
      expect(nfspl).toContain("## description: The Prince's Speech.");
      expect(nfspl).toContain("Scene1 {");
      expect(nfspl).toContain("stage(hamlet, juliet)");
      expect(nfspl).toContain("juliet {");
      expect(nfspl).toContain("@you.set(64 + 8)"); // 'H' = 72
      expect(nfspl).toContain("@you.print_char");
      expect(nfspl).toContain("@you.set(@you + 1)"); // 'I'
      expect(nfspl).toContain("@you.set(8 + 2)"); // newline = 10
      expect(nfspl).toContain("unstage_all");
    });
  });
});

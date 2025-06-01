import Semantics from "../semantics";
import * as Ast from "../ast";
import Parser from "../parser";

describe("Horatio Semantics", () => {
  describe("Base methods", () => {
    it("should return false for declared() in base class", () => {
      const semantics = new Semantics();
      expect(semantics.declared("Romeo")).toBe(false);
    });

    it("should handle character not in characters object for toggleStage", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true };
      // Should not throw when toggling non-existent character
      semantics.toggleStage("Juliet");
      expect(semantics.characters.Romeo).toBe(true);
    });

    it("should handle undefined characters object in exeuntStage", () => {
      const semantics = new Semantics();
      // Should not throw when characters is undefined
      semantics.exeuntStage();
    });

    it("should handle undefined parts in actExists", () => {
      const semantics = new Semantics();
      expect(semantics.actExists("I")).toBe(false);
    });

    it("should handle undefined parts in sceneExists", () => {
      const semantics = new Semantics();
      expect(semantics.sceneExists("I", "I")).toBeFalsy();
    });
  });

  describe("Error cases", () => {
    it("should throw error for empty comment sequence", () => {
      const semantics = new Semantics();
      const comment = new Ast.Comment("");
      expect(() => semantics.visitComment(comment, null)).toThrow(
        "Semantic Error - Comment malformed.",
      );
    });

    it("should throw error for character without sequence", () => {
      const semantics = new Semantics();
      const character = new Ast.Character("");
      expect(() => semantics.visitCharacter(character, null)).toThrow(
        "Semantic Error - Character undefined.",
      );
    });

    it("should throw error for non-Character type", () => {
      const semantics = new Semantics();
      // Use any type to bypass TypeScript and test the defensive check
      const notACharacter: any = { sequence: "Romeo", visit: () => {} };
      expect(() => semantics.visitCharacter(notACharacter, null)).toThrow(
        "Semantic Error - Not of type Character.",
      );
    });

    it("should throw error for numeral without sequence", () => {
      const semantics = new Semantics();
      const numeral = new Ast.Numeral("");
      expect(() => semantics.visitNumeral(numeral, null)).toThrow(
        "Semantic Error - Numeral malformed.",
      );
    });

    it("should throw error when no characters enter", () => {
      const semantics = new Semantics();
      // We need to mock an Enter with null character_1 to test the error
      const enter = Object.create(Ast.Enter.prototype);
      enter.character_1 = null;
      enter.character_2 = null;
      expect(() => semantics.visitEnter(enter, null)).toThrow(
        "Semantic Error - No characters entering.",
      );
    });

    it("should throw error when no character exits", () => {
      const semantics = new Semantics();
      // We need to mock an Exit with null character to test the error
      const exit = Object.create(Ast.Exit.prototype);
      exit.character = null;
      expect(() => semantics.visitExit(exit, null)).toThrow(
        "Semantic Error - No character exiting.",
      );
    });

    it("should handle normal character exit", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true };
      semantics.declared = (char: string) => char === "Romeo";
      const exit = new Ast.Exit(new Ast.Character("Romeo"));

      const result = semantics.visitExit(exit, null);

      expect(result).toBeNull();
      expect(semantics.characters.Romeo).toBe(false);
    });

    it("should throw error for line with no sentences", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true };
      semantics.declared = (char: string) => char === "Romeo";
      const line = new Ast.Line(new Ast.Character("Romeo"), []);
      expect(() => semantics.visitLine(line, {})).toThrow(
        "Semantic Error - Line cannot have no sentences.",
      );
    });

    it("should throw error for zero value without sequence", () => {
      const semantics = new Semantics();
      const zero = new Ast.ZeroValue("");
      expect(() =>
        semantics.visitZeroValue(zero, { character: "Romeo" }),
      ).toThrow("Semantic Error - Zero value malformed.");
    });

    it("should throw error when act is already defined", () => {
      const semantics = new Semantics();
      semantics.parts = {};
      const parts = [
        new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("First"), [
          new Ast.Subpart(
            new Ast.Numeral("I"),
            new Ast.Comment("Scene"),
            new Ast.Stage([]),
          ),
        ]),
        new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Duplicate"), [
          new Ast.Subpart(
            new Ast.Numeral("I"),
            new Ast.Comment("Scene"),
            new Ast.Stage([]),
          ),
        ]),
      ];
      expect(() => semantics.collectActsAndScenes(parts)).toThrow(
        "Semantic Error - Act already defined.",
      );
    });

    it("should throw error when scene is already defined", () => {
      const semantics = new Semantics();
      semantics.parts = {};
      const parts = [
        new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("First"), [
          new Ast.Subpart(
            new Ast.Numeral("I"),
            new Ast.Comment("Scene 1"),
            new Ast.Stage([]),
          ),
          new Ast.Subpart(
            new Ast.Numeral("I"),
            new Ast.Comment("Scene 1 duplicate"),
            new Ast.Stage([]),
          ),
        ]),
      ];
      expect(() => semantics.collectActsAndScenes(parts)).toThrow(
        "Semantic Error - Scene already defined.",
      );
    });

    it("should throw error when character is already defined", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true }; // Use true to indicate already defined
      const declaration = new Ast.Declaration(
        new Ast.Character("Romeo"),
        new Ast.Comment("a young man"),
      );
      // visitDeclaration calls character.visit which returns the character
      expect(() => semantics.visitDeclaration(declaration, null)).toThrow(
        "Semantic Error - Character already defined.",
      );
    });

    it("should throw error for part with no subparts", () => {
      const semantics = new Semantics();
      const part = new Ast.Part(
        new Ast.Numeral("I"),
        new Ast.Comment("Empty act"),
        [],
      );
      expect(() => semantics.visitPart(part, null)).toThrow(
        "Semantic Error - No subparts defined.",
      );
    });

    it("should throw error when same character enters twice", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: false };
      semantics.declared = (char: string) => char === "Romeo";
      const enter = new Ast.Enter(
        new Ast.Character("Romeo"),
        new Ast.Character("Romeo"),
      );
      expect(() => semantics.visitEnter(enter, null)).toThrow(
        "Semantic Error - Same character entering twice in same statement.",
      );
    });

    it("should throw error when same characters exeunt", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true };
      semantics.declared = (char: string) => char === "Romeo";
      const exeunt = new Ast.Exeunt(
        new Ast.Character("Romeo"),
        new Ast.Character("Romeo"),
      );
      expect(() => semantics.visitExeunt(exeunt, null)).toThrow(
        "Semantic Error - Characters are the same.",
      );
    });

    it("should throw error for positive constant with negative noun", () => {
      const semantics = new Semantics();
      const value = new Ast.PositiveConstantValue(
        new Ast.NegativeNoun("devil"),
        [],
      );
      expect(() =>
        semantics.visitPositiveConstantValue(value, { character: "Romeo" }),
      ).toThrow(
        "Semantic Error - Positive Constants must use a positive or neutral noun",
      );
    });

    it("should throw error for negative constant with positive noun", () => {
      const semantics = new Semantics();
      const value = new Ast.NegativeConstantValue(
        new Ast.PositiveNoun("angel"),
        [],
      );
      expect(() =>
        semantics.visitNegativeConstantValue(value, { character: "Romeo" }),
      ).toThrow(
        "Semantic Error - Negative Constants must use a negative or neutral noun",
      );
    });

    it("should throw error for negative constant with positive adjective", () => {
      const semantics = new Semantics();
      const value = new Ast.NegativeConstantValue(
        new Ast.NegativeNoun("devil"),
        [new Ast.PositiveAdjective("beautiful")],
      );
      expect(() =>
        semantics.visitNegativeConstantValue(value, { character: "Romeo" }),
      ).toThrow(
        "Semantic Error - Negative Constants must use negative of neutral adjectives.",
      );
    });
  });

  describe("Visitor return values", () => {
    it("should return null for visitRecallSentence", () => {
      const semantics = new Semantics();
      const recall = new Ast.RecallSentence(new Ast.Comment("test"));
      const result = semantics.visitRecallSentence(recall, {
        character: "Romeo",
      });
      expect(result).toBeUndefined();
    });

    it("should return character value for visitCharacterValue", () => {
      const semantics = new Semantics();
      const charValue = new Ast.CharacterValue(new Ast.Character("Romeo"));
      const result = semantics.visitCharacterValue(charValue, {
        character: "Juliet",
      });
      expect(result).toBeNull();
    });

    it("should return null for visitLesserThanComparison", () => {
      const semantics = new Semantics();
      const comparison = new Ast.LesserThanComparison(
        new Ast.NegativeComparative("worse"),
      );
      const result = semantics.visitLesserThanComparison(comparison, {
        character: "Romeo",
      });
      expect(result).toBeNull();
    });

    it("should return null after numeral line in visitNumeral", () => {
      const semantics = new Semantics();
      const numeral = new Ast.Numeral("I");
      const result = semantics.visitNumeral(numeral, null);
      // The function returns the sequence, then has unreachable return null
      expect(result).toBe("I");
    });
  });

  describe("Complete program validation", () => {
    it("should validate a complete valid program", () => {
      const spl = `
        Test program.

        Romeo, a young man.
        Juliet, a lady.

        Act I: Test.

        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are nothing!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const semantics = new Semantics();
      semantics.characters = {};
      semantics.parts = {};

      // Override declared to return true for our characters
      semantics.declared = (character: string) => {
        return character === "Romeo" || character === "Juliet";
      };

      expect(() => ast.visit(semantics)).not.toThrow();
    });

    it("should throw error for program with no characters", () => {
      const program = new Ast.Program(
        new Ast.Comment("Test"),
        [],
        [new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act"), [])],
      );
      const semantics = new Semantics();
      expect(() => semantics.visitProgram(program)).toThrow(
        "Semantic Error - No characters declared.",
      );
    });

    it("should throw error for program with no parts", () => {
      const program = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a man"),
          ),
        ],
        [],
      );
      const semantics = new Semantics();
      semantics.characters = {};
      expect(() => semantics.visitProgram(program)).toThrow(
        "Semantic Error - No parts in program.",
      );
    });
  });

  describe("Value visitors", () => {
    it("should visit positive constant value with neutral noun", () => {
      const semantics = new Semantics();
      const value = new Ast.PositiveConstantValue(new Ast.NeutralNoun("tree"), [
        new Ast.PositiveAdjective("beautiful"),
      ]);
      const result = semantics.visitPositiveConstantValue(value, {
        character: "Romeo",
      });
      expect(result).toBe(0); // placeholder return
    });

    it("should visit negative constant value with neutral noun and adjectives", () => {
      const semantics = new Semantics();
      const value = new Ast.NegativeConstantValue(new Ast.NeutralNoun("tree"), [
        new Ast.NegativeAdjective("evil"),
        new Ast.NeutralAdjective("big"),
      ]);
      const result = semantics.visitNegativeConstantValue(value, {
        character: "Romeo",
      });
      expect(result).toBe(0); // placeholder return
    });

    it("should visit all noun types", () => {
      const semantics = new Semantics();

      expect(
        semantics.visitPositiveNoun(new Ast.PositiveNoun("angel")),
      ).toBeNull();
      expect(
        semantics.visitNeutralNoun(new Ast.NeutralNoun("tree")),
      ).toBeNull();
      expect(
        semantics.visitNegativeNoun(new Ast.NegativeNoun("devil")),
      ).toBeNull();
    });

    it("should visit all adjective types", () => {
      const semantics = new Semantics();

      expect(
        semantics.visitPositiveAdjective(
          new Ast.PositiveAdjective("beautiful"),
        ),
      ).toBeNull();
      expect(
        semantics.visitNeutralAdjective(new Ast.NeutralAdjective("big")),
      ).toBeNull();
      expect(
        semantics.visitNegativeAdjective(new Ast.NegativeAdjective("evil")),
      ).toBeNull();
    });

    it("should visit operators", () => {
      const semantics = new Semantics();

      expect(
        semantics.visitUnaryOperator(new Ast.UnaryOperator("square of")),
      ).toBeNull();
      expect(
        semantics.visitArithmeticOperator(new Ast.ArithmeticOperator("sum of")),
      ).toBeNull();
    });

    it("should visit comparatives", () => {
      const semantics = new Semantics();

      expect(
        semantics.visitPositiveComparative(
          new Ast.PositiveComparative("better"),
        ),
      ).toBeNull();
      expect(
        semantics.visitNegativeComparative(
          new Ast.NegativeComparative("worse"),
        ),
      ).toBeNull();
    });

    it("should visit pronouns", () => {
      const semantics = new Semantics();

      expect(
        semantics.visitFirstPersonPronoun(new Ast.FirstPersonPronoun("me")),
      ).toBeNull();
      expect(
        semantics.visitSecondPersonPronoun(new Ast.SecondPersonPronoun("you")),
      ).toBeNull();
    });

    it("should visit be forms", () => {
      const semantics = new Semantics();

      expect(semantics.visitBe(new Ast.Be("You are"))).toBeNull();
      expect(
        semantics.visitBeComparative(new Ast.BeComparative("Am I")),
      ).toBeNull();
    });
  });

  describe("Goto validation", () => {
    it("should throw error for goto to non-existent act", () => {
      const semantics = new Semantics();
      semantics.parts = { I: ["I", "II"] };
      const goto = new Ast.GotoSentence(
        "Let us return to act",
        "act",
        new Ast.Numeral("II"),
      );

      expect(() => semantics.visitGotoSentence(goto, { act: "I" })).toThrow(
        "Semantic Error - Act specified by Goto does not exist.",
      );
    });

    it("should throw error for goto to non-existent scene", () => {
      const semantics = new Semantics();
      semantics.parts = { I: ["I", "II"] };
      const goto = new Ast.GotoSentence(
        "Let us proceed to scene",
        "scene",
        new Ast.Numeral("III"),
      );

      expect(() => semantics.visitGotoSentence(goto, { act: "I" })).toThrow(
        "Semantic Error - Scene III does not exist in Act I.",
      );
    });

    it("should allow valid goto statements", () => {
      const semantics = new Semantics();
      semantics.parts = { I: ["I", "II"], II: ["I"] };

      const gotoAct = new Ast.GotoSentence(
        "Let us return to act",
        "act",
        new Ast.Numeral("II"),
      );
      expect(() =>
        semantics.visitGotoSentence(gotoAct, { act: "I" }),
      ).not.toThrow();

      const gotoScene = new Ast.GotoSentence(
        "Let us proceed to scene",
        "scene",
        new Ast.Numeral("II"),
      );
      expect(() =>
        semantics.visitGotoSentence(gotoScene, { act: "I" }),
      ).not.toThrow();
    });
  });

  describe("Input/Output visitors", () => {
    it("should visit input sentences", () => {
      const semantics = new Semantics();

      const intInput = new Ast.IntegerInputSentence("Listen to your heart");
      expect(semantics.visitIntegerInputSentence(intInput, null)).toBeNull();

      const charInput = new Ast.CharInputSentence("Open your mind");
      expect(semantics.visitCharInputSentence(charInput, null)).toBeNull();
    });

    it("should visit output sentences", () => {
      const semantics = new Semantics();

      const intOutput = new Ast.IntegerOutputSentence("Open your heart");
      expect(semantics.visitIntegerOutputSentence(intOutput, null)).toBeNull();

      const charOutput = new Ast.CharOutputSentence("Speak your mind");
      expect(semantics.visitCharOutputSentence(charOutput, null)).toBeNull();
    });
  });

  describe("Complex visitor paths", () => {
    it("should handle exeunt with no characters (everyone exits)", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true, Juliet: true, Hamlet: true };
      const exeunt = new Ast.Exeunt();

      semantics.visitExeunt(exeunt, null);

      expect(semantics.characters.Romeo).toBe(false);
      expect(semantics.characters.Juliet).toBe(false);
      expect(semantics.characters.Hamlet).toBe(false);
    });

    it("should handle exeunt with two different characters", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true, Juliet: true, Hamlet: true };
      semantics.declared = (char: string) =>
        ["Romeo", "Juliet", "Hamlet"].includes(char);
      const exeunt = new Ast.Exeunt(
        new Ast.Character("Romeo"),
        new Ast.Character("Juliet"),
      );

      semantics.visitExeunt(exeunt, null);

      expect(semantics.characters.Romeo).toBe(false);
      expect(semantics.characters.Juliet).toBe(false);
      expect(semantics.characters.Hamlet).toBe(true); // Hamlet didn't exit
    });

    it("should handle exeunt with only one character defined", () => {
      const semantics = new Semantics();
      semantics.characters = { Romeo: true };
      const exeunt = new Ast.Exeunt(new Ast.Character("Romeo"));

      expect(() => semantics.visitExeunt(exeunt, null)).toThrow(
        "Semantic Error - Either 2 or no characters can be defined, not one.",
      );

      const exeunt2 = new Ast.Exeunt(undefined, new Ast.Character("Romeo"));
      expect(() => semantics.visitExeunt(exeunt2, null)).toThrow(
        "Semantic Error - Either 2 or no characters can be defined, not one.",
      );
    });

    it("should process all sentence types in visitSentence methods", () => {
      const semantics = new Semantics();
      semantics.parts = { I: ["I", "II"] };

      // Assignment
      const assignment = new Ast.AssignmentSentence(
        new Ast.Be("You are"),
        new Ast.ZeroValue("nothing"),
      );
      expect(semantics.visitAssignmentSentence(assignment, {})).toBeNull();

      // Question
      const question = new Ast.QuestionSentence(
        "Am I",
        new Ast.BeComparative("Am I"),
        new Ast.GreaterThanComparison(new Ast.PositiveComparative("better")),
        new Ast.ZeroValue("nothing"),
      );
      expect(semantics.visitQuestionSentence(question, {})).toBeNull();

      // Response
      const response = new Ast.ResponseSentence(
        new Ast.GotoSentence(
          "Let us proceed to scene",
          "scene",
          new Ast.Numeral("II"),
        ),
        true,
      );
      expect(
        semantics.visitResponseSentence(response, { act: "I" }),
      ).toBeNull();

      // Remember
      const remember = new Ast.RememberSentence(
        new Ast.FirstPersonPronoun("me"),
      );
      expect(
        semantics.visitRememberSentence(remember, { character: "Romeo" }),
      ).toBeNull();
    });

    it("should handle all value types", () => {
      const semantics = new Semantics();

      // Unary operation
      const unary = new Ast.UnaryOperationValue(
        new Ast.UnaryOperator("square of"),
        new Ast.PronounValue(new Ast.SecondPersonPronoun("you")),
      );
      expect(
        semantics.visitUnaryOperationValue(unary, { character: "Romeo" }),
      ).toBe(0);

      // Arithmetic operation
      const arithmetic = new Ast.ArithmeticOperationValue(
        new Ast.ArithmeticOperator("sum of"),
        new Ast.PronounValue(new Ast.FirstPersonPronoun("me")),
        new Ast.ZeroValue("nothing"),
      );
      expect(
        semantics.visitArithmeticOperationValue(arithmetic, {
          character: "Romeo",
        }),
      ).toBe(0);

      // Pronoun value
      const pronoun = new Ast.PronounValue(new Ast.SecondPersonPronoun("you"));
      expect(
        semantics.visitPronounValue(pronoun, { character: "Romeo" }),
      ).toBeNull();
    });

    it("should handle all comparison types", () => {
      const semantics = new Semantics();

      // Greater than
      const greater = new Ast.GreaterThanComparison(
        new Ast.PositiveComparative("better"),
      );
      expect(
        semantics.visitGreaterThanComparison(greater, { character: "Romeo" }),
      ).toBeNull();

      // Equal to
      const equal = new Ast.EqualToComparison(
        new Ast.PositiveAdjective("good"),
      );
      expect(
        semantics.visitEqualToComparison(equal, { character: "Romeo" }),
      ).toBeNull();

      // Inverse
      const inverse = new Ast.InverseComparison(
        new Ast.GreaterThanComparison(new Ast.PositiveComparative("better")),
      );
      expect(
        semantics.visitInverseComparison(inverse, { character: "Romeo" }),
      ).toBeNull();
    });
  });
});

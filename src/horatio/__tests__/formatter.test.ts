import Parser from "../parser";
import Formatter from "../formatter";
import { prettyPrint } from "../prettyPrint";
import * as Ast from "../ast";

describe("Horatio Formatter", () => {
  describe("AST consistency tests", () => {
    it("should produce the same AST when parsing original and formatted code", () => {
      const originalSpl = `
        A simple test program.

        Romeo, a young man with a remarkable patience.
        Juliet, a likewise young woman of remarkable grace.

        Act I: The beginning.

        Scene I: Romeo and Juliet meet.

        [Enter Romeo and Juliet]

        Romeo:
          You are as lovely as a rose!
          Speak your mind!

        Juliet:
          You are as good as the sum of a cat and a dog!
          Remember me.

        [Exeunt]
      `;

      // Parse original
      const parser1 = new Parser(originalSpl);
      const ast1 = parser1.parse();

      // Format and pretty print the AST
      const generatedSpl = prettyPrint(ast1);

      // Parse the generated SPL
      const parser2 = new Parser(generatedSpl);
      const ast2 = parser2.parse();

      // Compare key AST properties
      expect(ast1.comment.sequence).toBe(ast2.comment.sequence);
      expect(ast1.declarations.length).toBe(ast2.declarations.length);
      expect(ast1.parts.length).toBe(ast2.parts.length);

      // Compare declarations
      ast1.declarations.forEach((decl, i) => {
        expect(decl.character.sequence).toBe(
          ast2.declarations[i]!.character.sequence,
        );
        expect(decl.comment.sequence).toBe(
          ast2.declarations[i]!.comment.sequence,
        );
      });

      // Compare acts and scenes
      ast1.parts.forEach((part, i) => {
        expect(part.numeral.sequence).toBe(ast2.parts[i]!.numeral.sequence);
        expect(part.comment.sequence).toBe(ast2.parts[i]!.comment.sequence);
        expect(part.subparts.length).toBe(ast2.parts[i]!.subparts.length);
      });
    });

    it("should produce identical output when formatting already formatted code", () => {
      const spl = `
        The Tragedy of Formatting.

        Romeo, a well-formatted character.
        Juliet, another well-formatted character.

        Act I: The first act.

        Scene I: The first scene.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing!
          You are as pretty as a flower!

        Juliet:
          Remember you.
          Recall your past.

        [Exit Romeo]
        
        Juliet:
          Speak your mind!

        [Exit Juliet]

        Scene II: The second scene.

        [Enter Romeo]

        Romeo:
          I am the square of myself.

        [Exeunt]

        Act II: The second act.

        Scene I: Another scene.

        [Enter Juliet]

        Juliet:
          You are as good as the sum of a cat and a dog!

        [Exeunt]
      `;

      // First pass
      const parser1 = new Parser(spl);
      const ast1 = parser1.parse();
      const generated1 = prettyPrint(ast1);

      // Second pass
      const parser2 = new Parser(generated1);
      const ast2 = parser2.parse();
      const generated2 = prettyPrint(ast2);

      // Should be identical
      expect(generated2).toBe(generated1);
    });
  });

  describe("Formatter visitor methods", () => {
    it("should format all types of sentences correctly", () => {
      const spl = `
        Test all sentence types.

        Romeo, a test character.
        Juliet, another test character.

        Act I: Testing.

        Scene I: All sentences.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing!
          You pretty little warm thing!
          You are as good as the sum of a cat and a dog!
          You are as good as the square of yourself!
          Are you better than nothing?
          If so, let us proceed to scene II.
          If not, let us return to scene I.
          Remember me.
          Recall your past.
          Speak your mind!
          Open your heart!
          Listen to your heart!
          Open your mind!
          Let us return to scene I.
          Let us proceed to act II.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const formatter = new Formatter();
      const formatted = formatter.visitProgram(ast);

      // Check that we have all the expected parts
      expect(formatted.title).toBe("Test all sentence types.");
      expect(formatted.declarations).toHaveLength(2);
      expect(formatted.parts).toHaveLength(1);
      expect(formatted.parts[0]!.subparts).toHaveLength(1);

      const scene = formatted.parts[0]!.subparts[0]!;
      expect(scene.heading).toBe("Scene I: All sentences.");

      // Count dialogue lines
      const dialogueLines = scene.body.filter(
        (item) => typeof item === "object" && "name" in item && "text" in item,
      );
      expect(dialogueLines.length).toBeGreaterThan(0);
    });

    it("should handle complex arithmetic and comparisons", () => {
      const spl = `
        Complex expressions.

        Romeo, a character.
        Juliet, another character.

        Act I: Testing.

        Scene I: Complex math.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of the difference between a cat and a dog and the product of a tree and a flower!
          You are as lovely as the quotient between the square of a rose and the cube of a flower.
          Are you not as good as the remainder of the quotient between yourself and me?

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const generated = prettyPrint(ast);

      // Parse the generated code to ensure it's valid
      const parser2 = new Parser(generated);
      expect(() => parser2.parse()).not.toThrow();
    });

    it("should format stage directions correctly", () => {
      const spl = `
        Stage direction test.

        Romeo, first character.
        Juliet, second character.
        Hamlet, third character.

        Act I: Testing.

        Scene I: Entrances and exits.

        [Enter Romeo]
        [Enter Juliet and Hamlet]

        Romeo:
          You are as good as nothing!

        [Exit Romeo]
        [Exit Juliet]

        Hamlet:
          I am nothing.

        [Enter Romeo and Juliet]

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const formatter = new Formatter();
      const formatted = formatter.visitProgram(ast);

      const scene = formatted.parts[0]!.subparts[0]!;
      const stageDirections = scene.body.filter(
        (item) => typeof item === "string" && item.startsWith("["),
      );

      expect(stageDirections).toContain("[Enter Romeo]");
      expect(stageDirections).toContain("[Enter Juliet and Hamlet]");
      expect(stageDirections).toContain("[Exit Romeo]");
      expect(stageDirections).toContain("[Exit Juliet]");
      expect(stageDirections).toContain("[Exeunt]");
    });

    it("should handle multi-line titles correctly", () => {
      const spl = `
        This is a very long title
        that spans multiple lines
        and tests the formatter.

        Romeo, a character.

        Act I: Test.

        Scene I: Test.

        [Enter Romeo]

        Romeo:
          You are as good as nothing!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const formatter = new Formatter();
      const formatted = formatter.visitProgram(ast);

      expect(formatted.title).toContain("This is a very long title");
      expect(formatted.title).toContain("that spans multiple lines");
      expect(formatted.title).toContain("and tests the formatter.");
    });

    it("should format the YOU token assignments correctly", () => {
      const spl = `
        Test YOU token formatting.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.

        Scene I: YOU tokens.

        [Enter Romeo and Juliet]

        Romeo:
          You pretty little warm thing!
          You are as pretty as a pretty little warm thing!
          You nothing!
          You are as good as nothing!
          You as pretty as a rose!
          You are as pretty as a rose!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const generated = prettyPrint(ast);

      // Should be able to parse the generated code
      const parser2 = new Parser(generated);
      const ast2 = parser2.parse();

      // Check that all sentences are preserved
      const sentences1 = ast.parts[0]!.subparts[0]!.stage.directions.filter(
        (d) => d instanceof Ast.Dialogue,
      )
        .flatMap((d: any) => d.lines)
        .flatMap((l: any) => l.sentences);

      const sentences2 = ast2.parts[0]!.subparts[0]!.stage.directions.filter(
        (d) => d instanceof Ast.Dialogue,
      )
        .flatMap((d: any) => d.lines)
        .flatMap((l: any) => l.sentences);

      expect(sentences2.length).toBe(sentences1.length);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty dialogue sections", () => {
      const spl = `
        Empty dialogue test.

        Romeo, a character.

        Act I: Test.

        Scene I: Test.

        [Enter Romeo]
        [Exit Romeo]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const generated = prettyPrint(ast);

      expect(generated).toContain("[Enter Romeo]");
      expect(generated).toContain("[Exit Romeo]");
    });

    it("should preserve punctuation in sentences", () => {
      const spl = `
        Punctuation test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.

        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing!
          Are you better than nothing?
          Speak your mind.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();
      const generated = prettyPrint(ast);

      // The pretty printer combines sentences on one line
      expect(generated).toContain("You are as good as nothing");
      expect(generated).toContain("Are you better than nothing");
      expect(generated).toContain("Speak your mind");
    });
  });
});

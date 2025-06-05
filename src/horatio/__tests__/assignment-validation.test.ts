import Parser from "../parser";

describe("Assignment validation according to Shakespeare spec", () => {
  describe("Valid assignment forms", () => {
    test("Direct assignment: You [noun with adjectives]", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Direct assignment forms.

        [Enter Romeo and Juliet]

        Romeo:
          You lying stupid fatherless big smelly half-witted coward!
          You pretty little warm thing!
          You devil!
          You nothing!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).not.toThrow();
    });

    test("Comparative assignment: You are as [adjective] as [value]", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Comparative assignment forms.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat!
          You are as stupid as the difference between a handsome rich brave hero and thyself!
          You are as bad as nothing!
          You are as lovely as the sum of a rose and a flower!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).not.toThrow();
    });

    test("Pronouns as values in expressions", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Pronouns in expressions.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as me!
          You are as bad as thyself!
          You are as lovely as the sum of me and thyself!
          You are as stupid as the difference between me and you!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).not.toThrow();
    });

    test("Complex expressions with pronouns", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Complex expressions.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of me and a cat!
          You are as bad as the difference between thyself and nothing!
          You are as lovely as the product of me and a rose!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).not.toThrow();
    });

    test("Character names as values in expressions", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.
        Hamlet, a prince.

        Act I: Test.
        Scene I: Character names as values.

        [Enter Romeo and Juliet]

        Romeo:
          You Hamlet!
          You are as good as Hamlet!
          You are as lovely as the sum of Romeo and a cat!
          You are as bad as the difference between Juliet and nothing!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).not.toThrow();
    });
  });

  describe("Invalid assignment forms that should be rejected", () => {
    test("Invalid: You are [noun with adjectives]", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Invalid form.

        [Enter Romeo and Juliet]

        Romeo:
          You are a stinky cow!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).toThrow();
    });

    test("Invalid: You are me (pronoun without comparison)", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Invalid form.

        [Enter Romeo and Juliet]

        Romeo:
          You are me!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).toThrow();
    });

    test("Invalid: You are [character name] (missing 'as [adj] as')", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.
        Hamlet, a prince.

        Act I: Test.
        Scene I: Invalid form.

        [Enter Romeo and Juliet]

        Romeo:
          You are Hamlet!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).toThrow();
    });

    test("Invalid: Multiple invalid forms", () => {
      const invalids = [
        "You are a cat!",
        "You are thyself!",
        "You are you!",
        "You are a big big cat!",
        "You are nothing!",
        "You are the sum of a cat and a dog!",
      ];

      for (const invalid of invalids) {
        const code = `
          Test Program.
          Romeo, a young man.
          Juliet, a young woman.

          Act I: Test.
          Scene I: Invalid form.

          [Enter Romeo and Juliet]

          Romeo:
            ${invalid}

          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).toThrow();
      }
    });
  });

  describe("Parser error messages", () => {
    test("Provides helpful error for invalid assignment forms", () => {
      const code = `
        Test Program.
        Romeo, a young man.
        Juliet, a young woman.

        Act I: Test.
        Scene I: Invalid form.

        [Enter Romeo and Juliet]

        Romeo:
          You are a cat!

        [Exeunt]
      `;

      expect(() => {
        const parser = new Parser(code);
        parser.parse();
      }).toThrow(/invalid assignment form|expected "as"/i);
    });
  });
});

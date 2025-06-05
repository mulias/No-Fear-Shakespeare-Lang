import Parser from "../parser";

describe("Shakespeare assignment forms - spec compliance", () => {
  describe("Two valid assignment forms per spec", () => {
    test("Form 1: You [noun with adjectives] or You [pronoun]", () => {
      const validExamples = [
        "You lying stupid fatherless big smelly half-witted coward!",
        "You cat!",
        "You big big cat!",
        "You nothing!",
        "You pretty little flower!",
        "You me!",
        "You you!",
        "You thyself!",
      ];

      for (const example of validExamples) {
        const code = `
          Test.
          Romeo, test.
          Juliet, test.
          Act I: Test.
          Scene I: Test.
          [Enter Romeo and Juliet]
          Romeo: ${example}
          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).not.toThrow();
      }
    });

    test("Form 2: You are as [adjective] as [value]", () => {
      const validExamples = [
        "You are as good as a cat!",
        "You are as bad as nothing!",
        "You are as lovely as the sum of a rose and a flower!",
        "You are as stupid as me!",
        "You are as happy as thyself!",
        "You are as good as the difference between me and you!",
      ];

      for (const example of validExamples) {
        const code = `
          Test.
          Romeo, test.
          Juliet, test.
          Act I: Test.
          Scene I: Test.
          [Enter Romeo and Juliet]
          Romeo: ${example}
          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).not.toThrow();
      }
    });

    test("Valid: Character names used as values", () => {
      const validExamples = [
        "You Romeo!", // Direct assignment with character
        "You Juliet!", // Direct assignment with character
        "You Hamlet!", // Direct assignment with character
        "You are as good as Romeo!", // Character in expression
        "You are as bad as Juliet!", // Character in expression
        "You the sum of Romeo and Juliet!", // Characters in arithmetic
        "You the difference between Romeo and a cat!", // Character in arithmetic
      ];

      for (const example of validExamples) {
        const code = `
          Test.
          Romeo, test.
          Juliet, test.
          Hamlet, test.
          Act I: Test.
          Scene I: Test.
          [Enter Romeo and Juliet]
          Romeo: ${example}
          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).not.toThrow();
      }
    });
  });

  describe("Invalid assignment forms", () => {
    test("Invalid: You are [noun/pronoun/character] (missing 'as [adj] as')", () => {
      const invalidExamples = [
        "You are cat!",
        "You are a cat!",
        "You are nothing!",
        "You are a big big cat!",
        "You are me!",
        "You are thyself!",
        "You are you!",
        "You are Romeo!",
        "You are Juliet!",
        "You are the sum of a cat and a dog!",
      ];

      for (const example of invalidExamples) {
        const code = `
          Test.
          Romeo, test.
          Juliet, test.
          Act I: Test.
          Scene I: Test.
          [Enter Romeo and Juliet]
          Romeo: ${example}
          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).toThrow();
      }
    });
  });

  describe("Pronouns in valid contexts", () => {
    test("me/thyself/you are valid as values in expressions", () => {
      const validUsages = [
        "You are as good as me!",
        "You are as bad as thyself!",
        "You are as lovely as you!",
        "You are as stupid as the sum of me and thyself!",
        "You the sum of me and thyself!",
        "You the difference between me and you!",
      ];

      for (const example of validUsages) {
        const code = `
          Test.
          Romeo, test.
          Juliet, test.
          Act I: Test.
          Scene I: Test.
          [Enter Romeo and Juliet]
          Romeo: ${example}
          [Exeunt]
        `;

        expect(() => {
          const parser = new Parser(code);
          parser.parse();
        }).not.toThrow();
      }
    });
  });
});

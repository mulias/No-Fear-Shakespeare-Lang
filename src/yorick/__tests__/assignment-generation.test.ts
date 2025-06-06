import { Possum } from "../../possum";
import { Ophelia } from "../../ophelia";
import { Yorick } from "../../yorick";
import { prettyPrint } from "../../horatio/prettyPrint";

// Helper to normalize whitespace for testing
function normalizeWhitespace(text: string): string {
  return text.split(/\s+/).join(" ").trim();
}

async function transpileNfsplToSpl(nfsplSource: string): Promise<string> {
  const possum = new Possum(nfsplSource);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const yorickAst = yorick.run();

  return prettyPrint(yorickAst);
}

describe("Yorick Assignment Generation", () => {
  describe("Direct assignments for non-zero constants", () => {
    test("should generate direct assignment for positive constants", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(1)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/You \w+[.!]/);
      expect(spl).not.toMatch(/You are as/);
    });

    test("should generate direct assignment for negative constants", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(-1)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/You \w+[.!]/);
      expect(spl).not.toMatch(/You are as/);
    });

    test("should generate direct assignment with adjectives for powers of 2", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(2)
              @you.set(4)
              @you.set(8)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      const normalized = normalizeWhitespace(spl);
      expect(normalized).toMatch(/You \w+ \w+[.!]/);
      expect(normalized).toMatch(/You \w+ \w+ \w+[.!]/);
      expect(normalized).toMatch(/You \w+ \w+ \w+ \w+[.!]/);
      expect(spl).not.toMatch(/You are as/);
    });
  });

  describe("Comparative assignments for zero, pronouns, and expressions", () => {
    test("should generate comparative assignment for zero", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(0)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/(You are|Thou art) as \w+ as nothing[.!]/);
    });

    test("should generate comparative assignment for 'me' pronoun", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(a)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/(You are|Thou art) as \w+ as (me|myself)[.!]/);
    });

    test("should generate comparative assignment for '@you' pronoun", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(@you)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(
        /(You are|Thou art) as \w+ as (thyself|yourself|thee|thou)[.!]/,
      );
    });

    test("should generate comparative assignment for arithmetic expressions", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(a + 1)
              @you.set(@you * 2)
              @you.set(a - @you)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      const normalized = normalizeWhitespace(spl);
      expect(normalized).toMatch(/the sum of (me|myself) and/);
      expect(normalized).toMatch(
        /the product of (thyself|yourself|thee|thou) and/,
      );
      expect(normalized).toMatch(
        /the difference between (me|myself) and (thyself|yourself|thee|thou)/,
      );
    });

    test("should generate comparative assignment for unary functions", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(square(a))
              @you.set(cube(@you))
              @you.set(square_root(a))
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      const normalized = normalizeWhitespace(spl);
      expect(normalized).toMatch(/square of (me|myself)/);
      expect(normalized).toMatch(/cube of (thyself|yourself|thee|thou)/);
      expect(normalized).toMatch(/square root of (me|myself)/);
    });
  });

  describe("Variable to pronoun mapping", () => {
    test("should always map speaker variable to 'me'", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(romeo, juliet)
            romeo {
              @you.set(romeo + 1)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/the sum of (me|myself|I) and/);
      expect(spl).not.toMatch(/Romeo/);
    });

    test("should always map addressee variable to 'thyself' or @you context", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(romeo, juliet)
            romeo {
              @you.set(romeo + @you)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      const normalized = normalizeWhitespace(spl);
      expect(normalized).toMatch(
        /the sum of (me|myself) and (thyself|yourself|thee|thou)/,
      );
      expect(spl).not.toMatch(/Juliet/);
    });

    test("should handle complex expressions with both speaker and addressee", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(hamlet, ophelia)
            hamlet {
              @you.set(hamlet * @you + 1)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      const normalized = normalizeWhitespace(spl);
      expect(normalized).toMatch(
        /the sum of.*the product of (me|myself) and (thyself|yourself|thee|thou).*and/,
      );
      expect(spl).not.toMatch(/Hamlet|Ophelia/);
    });
  });

  describe("Random adjective selection", () => {
    test("should never use character names as adjectives", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(romeo, juliet)
            romeo {
              @you.set(0)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/(You are|Thou art) as \w+ as nothing[.!]/);
      expect(spl).not.toMatch(/You are as Romeo as/);
      expect(spl).not.toMatch(/You are as Juliet as/);
    });
  });

  describe("Edge cases and validation", () => {
    test("should handle negative numbers correctly", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(-2)
              @you.set(-4)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);

      expect(spl).toMatch(/You \w+( \w+)* \w+[.!]/);
      expect(spl).not.toMatch(/You are as/);
    });

    test("should handle mixed assignment types in same dialogue", async () => {
      const nfspl = `
        Main {
          Scene1 {
            stage(a, b)
            a {
              @you.set(1)
              @you.set(0)
              @you.set(a + 1)
              @you.set(4)
            }
          }
        }
      `;

      const spl = await transpileNfsplToSpl(nfspl);
      const normalized = normalizeWhitespace(spl);

      expect(normalized).toMatch(/You \w+[.!]/);
      expect(normalized).toMatch(/(You are|Thou art) as \w+ as nothing[.!]/);
      expect(normalized).toMatch(/(You are|Thou art) as \w+ as the sum of/);
      expect(normalized).toMatch(/You \w+ \w+ \w+[.!]/);
    });
  });
});

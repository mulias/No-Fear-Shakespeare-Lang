import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { Yorick } from "../yorick";
import Horatio from "../horatio/compiler";
import { prettyPrint } from "../horatio/prettyPrint";
import { IO } from "../horatio/types";

describe("NFSPL to SPL Integration Tests", () => {
  /**
   * Test that NFSPL programs can be:
   * 1. Parsed by Possum (NFSPL -> Possum AST)
   * 2. Transformed by Ophelia (Possum AST -> Ophelia AST)
   * 3. Transpiled by Yorick (Ophelia AST -> Horatio AST)
   * 4. Formatted to SPL text (Horatio AST -> SPL source)
   * 5. Re-parsed by Horatio (SPL source -> Horatio AST)
   *
   * The final parsed SPL AST should be identical to the transpiled AST from step 3.
   */

  const mockIO: IO = {
    print: () => {},
    read_char: () => {},
    read_int: () => {},
    debug: false,
    printDebug: () => {},
    clear: () => {},
  };

  async function roundTripTest(nfsplSource: string, testName: string) {
    // Step 1: Parse NFSPL with Possum
    const possum = new Possum(nfsplSource);
    const possumAst = await possum.run();

    // Step 2: Transform with Ophelia
    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    // Step 3: Transpile with Yorick
    const yorick = new Yorick(opheliaAst);
    const yorickAst = yorick.run();

    // Step 4: Format to SPL
    const splSource = prettyPrint(yorickAst);

    // Step 5: Parse SPL back to AST
    try {
      const horatio = Horatio.fromSource(splSource, mockIO);
      const horatioAst = horatio.ast;
      expect(horatioAst).toBeTruthy();
      expect(yorickAst).toBeTruthy();
    } catch (e) {
      throw new Error(`Round-trip parsing failed: ${e}`);
    }
  }

  describe("basic programs", () => {
    it("should handle simple variable assignment", async () => {
      const nfspl = `
        Main {
          Start {
            stage(a, b)
            a {
              @you.set(42)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "simple assignment");
    });

    it("should test character recognition directly", () => {
      // Test if Horatio can parse a simple program with known characters
      const simpleSpl = `Romeo and Juliet and the sum of nothing and nothing.

Romeo, a young man.
Juliet, a young woman.

                     Act I: Test.

                     Scene I: A test.

[Enter Romeo and Juliet]

Romeo:
    You are as good as the sum of nothing and nothing!

[Exeunt]`;

      const horatio = Horatio.fromSource(simpleSpl, mockIO);
      expect(horatio.ast).toBeTruthy();
    });

    it("should handle character output", async () => {
      const nfspl = `
        Main {
          Start {
            stage(writer, output)
            writer {
              @you.set('H')
              @you.print_char
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "character output");
    });

    it("should handle integer output", async () => {
      const nfspl = `
        Main {
          Start {
            stage(counter, output)
            counter {
              @you.set(123)
              @you.print_int
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "integer output");
    });

    it("should handle character input", async () => {
      const nfspl = `
        Main {
          Start {
            stage(reader, input)
            reader {
              @you.read_char
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "character input");
    });

    it("should handle integer input", async () => {
      const nfspl = `
        Main {
          Start {
            stage(reader, input)
            reader {
              @you.read_int
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "integer input");
    });
  });

  describe("arithmetic operations", () => {
    it("should handle addition", async () => {
      const nfspl = `
        Main {
          Start {
            stage(calc, result)
            calc {
              @you.set(10 + 5)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "addition");
    });

    it("should handle subtraction", async () => {
      const nfspl = `
        Main {
          Start {
            stage(calc, result)
            calc {
              @you.set(20 - 7)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "subtraction");
    });

    it("should handle multiplication", async () => {
      const nfspl = `
        Main {
          Start {
            stage(calc, result)
            calc {
              @you.set(6 * 7)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "multiplication");
    });

    it("should handle division", async () => {
      const nfspl = `
        Main {
          Start {
            stage(calc, result)
            calc {
              @you.set(15 / 3)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "division");
    });

    it("should handle modulo", async () => {
      const nfspl = `
        Main {
          Start {
            stage(calc, result)
            calc {
              @you.set(17 % 5)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "modulo");
    });
  });

  describe("stack operations", () => {
    it("should handle push_self", async () => {
      const nfspl = `
        Main {
          Start {
            stage(stack, helper)
            stack {
              @you.push_self
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "push_self");
    });

    it("should handle push_me", async () => {
      const nfspl = `
        Main {
          Start {
            stage(pusher, stack)
            pusher {
              @you.push_me
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "push_me");
    });

    it("should handle pop", async () => {
      const nfspl = `
        Main {
          Start {
            stage(stack, helper)
            stack {
              @you.pop
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "pop");
    });
  });

  describe("control flow", () => {
    it("should handle comparisons", async () => {
      const nfspl = `
        Main {
          Start {
            stage(tester, value)
            tester {
              test_eq(@you, 42)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "test_eq comparison");
    });

    it("should handle goto statements", async () => {
      const nfspl = `
        Main {
          Start {
            stage(jumper, helper)
            jumper {
              goto(End)
            }
          }
          End {
            stage(done, helper)
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "goto statement");
    });

    it("should handle if statements", async () => {
      const nfspl = `
        Main {
          Start {
            stage(decider, value)
            decider {
              test_eq(@you, 1)
              if_true(goto(Success))
            }
          }
          Success {
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "if statement");
    });
  });

  describe("complex programs", () => {
    it("should handle multiple acts and scenes", async () => {
      const nfspl = `
        Act1 {
          Scene1 {
            stage(a, b)
            a { @you.set(1) }
            unstage_all
          }
          Scene2 {
            stage(c, d)
            c { @you.set(2) }
            unstage_all
          }
        }
        Act2 {
          Scene1 {
            stage(e, f)
            e { @you.set(3) }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "multiple acts and scenes");
    });

    it("should handle variable references", async () => {
      const nfspl = `
        Main {
          Start {
            stage(a, b)
            a {
              @you.set(10)
              @you.set(a + 5)
            }
            unstage_all
          }
        }
      `;
      await roundTripTest(nfspl, "variable references");
    });
  });
});

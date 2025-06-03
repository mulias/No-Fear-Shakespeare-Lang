import fs from "fs";
import path from "path";
import Horatio from "../../horatio/horatio";
import { Falstaff } from "../index";
import { prettyPrint } from "../../ophelia";
import type { IO } from "../../horatio/types";

// Mock IO for testing
class MockIO implements IO {
  debug = false;

  print(text: string): void {
    // No-op for testing
  }

  read_char(callback: (input: string) => void): void {
    callback("");
  }

  read_int(callback: (input: string) => void): void {
    callback("0");
  }

  printDebug(text: string): void {
    // No-op for testing
  }

  clear(): void {
    // No-op for testing
  }
}

describe("Falstaff Integration Tests", () => {
  it("should convert hi.spl to NFSPL", () => {
    // Read the SPL file
    const splPath = path.join(
      __dirname,
      "../../../examples/shakespeare/hi.spl",
    );
    const splContent = fs.readFileSync(splPath, "utf-8");

    // Parse SPL to Horatio AST
    const io = new MockIO();
    const horatio = Horatio.fromSource(splContent, io);

    // Convert to NFSPL
    const falstaff = new Falstaff(horatio.ast);
    const opheliaAst = falstaff.run();
    const nfspl = prettyPrint(opheliaAst);

    // Basic structure checks
    expect(nfspl).toContain("## title: A New Beginning");
    expect(nfspl).toContain("## var hamlet: a literary/storage device");
    expect(nfspl).toContain("## var juliet: an orator");
    expect(nfspl).toContain("Act1 {");
    expect(nfspl).toContain("Scene1 {");
    expect(nfspl).toContain("stage(hamlet, juliet)");
    expect(nfspl).toContain("juliet {");
    expect(nfspl).toContain("@you.print_char");
    expect(nfspl).toContain("unstage_all");
  });

  it("should handle descriptions with character name substitution", () => {
    const splContent = `
The Infamous Hello World Program.

Romeo, a young man with a remarkable patience.
Juliet, a likewise young woman of remarkable grace.

Act I: Juliet's insults and flattery.

Scene I: The insulting of Romeo.

[Enter Romeo and Juliet]

Juliet:
You are as lovely as the sum of a cat and a codpiece! Speak your mind!

[Exeunt]
`;

    // Parse SPL to Horatio AST
    const io = new MockIO();
    const horatio = Horatio.fromSource(splContent, io);

    // Convert to NFSPL
    const falstaff = new Falstaff(horatio.ast);
    const opheliaAst = falstaff.run();
    const nfspl = prettyPrint(opheliaAst);

    // Check that character names in descriptions are converted to template variables
    expect(nfspl).toContain("## description: {juliet}'s insults and flattery");
    expect(nfspl).toContain("## description: The insulting of {romeo}");
  });

  it("should convert reverse.spl to NFSPL", () => {
    // Read the SPL file
    const splPath = path.join(
      __dirname,
      "../../../examples/shakespeare/reverse.spl",
    );
    const splContent = fs.readFileSync(splPath, "utf-8");

    // Parse SPL to Horatio AST
    const io = new MockIO();
    const horatio = Horatio.fromSource(splContent, io);

    // Convert to NFSPL
    const falstaff = new Falstaff(horatio.ast);
    const opheliaAst = falstaff.run();
    const nfspl = prettyPrint(opheliaAst);

    // Basic structure checks
    expect(nfspl).toContain("## title: Outputting Input Reversedly");
    expect(nfspl).toContain("## var othello: a stacky man");
    expect(nfspl).toContain(
      "## var lady_macbeth: who pushes him around till he pops",
    );
    expect(nfspl).toContain("Act1 {");
    expect(nfspl).toContain("Scene1 {");
    expect(nfspl).toContain("Scene2 {");
    expect(nfspl).toContain("Scene3 {");
    expect(nfspl).toContain("Scene4 {");

    // Check for stack operations
    expect(nfspl).toContain("@you.read_char");
    expect(nfspl).toContain("@you.push_self");
    expect(nfspl).toContain("@you.pop");

    // Check for comparisons and conditionals
    expect(nfspl).toContain("test_eq(othello, -1)");
    expect(nfspl).toContain("test_gt(@you, 0)");
    expect(nfspl).toContain("if_false(goto(Scene2))");
    expect(nfspl).toContain("if_true(goto(Scene3))");

    // Check for goto statements
    expect(nfspl).toContain("goto(Scene2)");
    expect(nfspl).toContain("goto(Scene3)");
  });

  it("should convert primes.spl to NFSPL", () => {
    // Read the SPL file
    const splPath = path.join(
      __dirname,
      "../../../examples/shakespeare/primes.spl",
    );
    const splContent = fs.readFileSync(splPath, "utf-8");

    // Parse SPL to Horatio AST
    const io = new MockIO();
    const horatio = Horatio.fromSource(splContent, io);

    // Convert to NFSPL
    const falstaff = new Falstaff(horatio.ast);
    const opheliaAst = falstaff.run();
    const nfspl = prettyPrint(opheliaAst);

    // Basic structure checks
    expect(nfspl).toContain("## title: Prime Number Computation in Copenhagen");
    expect(nfspl).toContain("## var romeo: a young man of Verona");
    expect(nfspl).toContain("## var juliet: a young woman");
    expect(nfspl).toContain("## var hamlet: a temporary variable from Denmark");
    expect(nfspl).toContain(
      "## var the_ghost: a limiting factor (and by a remarkable coincidence also Hamlet's father)",
    );

    // Check acts and scenes
    expect(nfspl).toContain("Act1 {");
    expect(nfspl).toContain("Act2 {");
    expect(nfspl).toContain("Scene1 {");
    expect(nfspl).toContain("Scene2 {");
    expect(nfspl).toContain("Scene3 {");
    expect(nfspl).toContain("Scene4 {");
    expect(nfspl).toContain("Scene5 {");

    // Check character staging
    expect(nfspl).toContain("stage(the_ghost, juliet)");
    expect(nfspl).toContain("unstage(the_ghost)");
    expect(nfspl).toContain("stage(romeo)");
    expect(nfspl).toContain("unstage(romeo)");
    expect(nfspl).toContain("stage(hamlet)");
    expect(nfspl).toContain("unstage(hamlet)");
    expect(nfspl).toContain("unstage_all");

    // Check I/O operations
    expect(nfspl).toContain("@you.print_char");
    expect(nfspl).toContain("@you.read_int");
    expect(nfspl).toContain("@you.print_int");

    // Check arithmetic operations
    expect(nfspl).toContain("square(@you) - 2");
    expect(nfspl).toContain("@you + 1");

    // Check comparisons
    expect(nfspl).toContain("test_gt(@you, the_ghost)");
    expect(nfspl).toContain("test_gt(juliet, @you)");
    expect(nfspl).toContain("test_eq(romeo % juliet, 0)");

    // Check conditionals
    expect(nfspl).toContain("if_true(goto(Scene5))");
    expect(nfspl).toContain("if_true(goto(Scene3))");
    expect(nfspl).toContain("if_true(goto(Scene4))");

    // Check gotos
    expect(nfspl).toContain("goto(Scene2)");
    expect(nfspl).toContain("goto(Scene1)");
  });
});

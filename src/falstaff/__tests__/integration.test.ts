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
});

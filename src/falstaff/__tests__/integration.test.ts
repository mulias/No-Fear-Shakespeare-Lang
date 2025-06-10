import Horatio from "../../horatio/horatio";
import { Falstaff } from "../index";
import { prettyPrint } from "../../ophelia/prettyPrint";
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
});

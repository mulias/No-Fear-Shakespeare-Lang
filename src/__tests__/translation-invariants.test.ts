import fs from "fs";
import path from "path";
import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { Program as OpheliaAst } from "../ophelia/ast";
import { Yorick } from "../yorick";
import { Falstaff } from "../falstaff";
import { prettyPrint } from "../horatio/prettyPrint";
import { prettyPrint as opheliaPrettyPrint } from "../ophelia/prettyPrint";
import Horatio from "../horatio/compiler";
import { Program as HoratioAst } from "../horatio/ast";
import { IO } from "../horatio/types";

describe("Translation Invariants", () => {
  // Mock IO interface for testing
  const mockIO: IO = {
    print: () => {},
    read_char: () => {},
    read_int: () => {},
    debug: false,
    printDebug: () => {},
    clear: () => {},
  };

  const examplesDir = path.join(__dirname, "examples");
  const nfsplDir = path.join(examplesDir, "nfspl");
  const splDir = path.join(examplesDir, "spl");

  /**
   * Transpile NFSPL source to SPL
   */
  async function transpileNfsplToSpl(source: string): Promise<HoratioAst> {
    const possum = new Possum(source);
    const possumAst = await possum.run();

    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    const yorick = new Yorick(opheliaAst);
    return yorick.run();
  }

  /**
   * Transpile SPL source to NFSPL
   */
  function transpilesplToNfspl(source: string): OpheliaAst {
    const horatio = Horatio.fromSource(source, mockIO);
    const falstaff = new Falstaff(horatio.ast);
    return falstaff.run();
  }

  /**
   * Format SPL by parsing and pretty-printing
   */
  function formatSpl(source: string): string {
    const horatio = Horatio.fromSource(source, mockIO);
    return prettyPrint(horatio.ast);
  }

  /**
   * Read all files from a directory with specific extension
   */
  function getExampleFiles(dir: string, extension: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(extension))
      .sort();
  }

  describe("NFSPL Invariants", () => {
    const nfsplFiles = getExampleFiles(nfsplDir, ".nfspl");

    nfsplFiles.forEach(async (filename) => {
      const filePath = path.join(nfsplDir, filename);
      const originalSource = fs.readFileSync(filePath, "utf-8");
      const horatioAst = await transpileNfsplToSpl(originalSource);
      const splResult = prettyPrint(horatioAst);

      it(`should produce valid SPL from ${filename}`, () => {
        // The generated SPL should be parseable
        expect(() => {
          const horatio = Horatio.fromSource(splResult, mockIO);
          expect(horatio.ast).toBeTruthy();
        }).not.toThrow();
      });

      it(`should produce consistent SPL output for ${filename}`, async () => {
        const filePath = path.join(nfsplDir, filename);
        const originalSource = fs.readFileSync(filePath, "utf-8");

        // Perform transpilation multiple times
        const spl2 = await transpileNfsplToSpl(originalSource);

        // Results should be identical
        expect(splResult).toBe(spl2);
      });
    });
  });

  describe("SPL Invariants", () => {
    const splFiles = getExampleFiles(splDir, ".spl");

    splFiles.forEach((filename) => {
      const filePath = path.join(splDir, filename);
      const originalSource = fs.readFileSync(filePath, "utf-8");
      const opheliasAst = transpilesplToNfspl(originalSource);
      const nfsplResult = opheliaPrettyPrint(opheliasAst);

      it(`should produce valid and formatted NFSPL from ${filename}`, () => {
        // The generated NFSPL should be parseable
        expect(async () => {
          const possum = new Possum(nfsplResult);
          const possumAst = await possum.run();
          const ophelia = new Ophelia(possumAst);
          const opheliaAst = ophelia.run();
          expect(opheliaAst).toBeTruthy();

          const nfsplFormatted = opheliaPrettyPrint(opheliaAst);
          expect(nfsplResult).toBe(nfsplFormatted);
        }).not.toThrow();
      });

      it(`should produce consistent NFSPL output for ${filename}`, () => {
        // Perform transpilation multiple times
        const nfspl2 = opheliaPrettyPrint(transpilesplToNfspl(originalSource));

        // Results should be identical
        expect(nfsplResult).toBe(nfspl2);
      });

      it(`should maintain ${filename} AST structure through formatting`, () => {
        // Parse original SPL
        const horatio1 = Horatio.fromSource(originalSource, mockIO);
        const originalAst = horatio1.ast;

        // Format and re-parse
        const formatted = formatSpl(originalSource);
        const horatio2 = Horatio.fromSource(formatted, mockIO);
        const formattedAst = horatio2.ast;

        // The ASTs should be identical
        expect(formattedAst).toEqual(originalAst);
      });
    });
  });
});

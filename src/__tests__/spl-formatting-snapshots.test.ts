import fs from "fs";
import path from "path";
import { Falstaff } from "../falstaff";
import { prettyPrint as opheliaPrettyPrint } from "../ophelia/prettyPrint";
import Horatio from "../horatio/compiler";
import { prettyPrint } from "../horatio/prettyPrint";
import { IO } from "../horatio/types";

describe("Example File Snapshots", () => {
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
  const splDir = path.join(examplesDir, "spl");

  /**
   * Transpile SPL source to NFSPL
   */
  function transpilesplToNfspl(source: string): string {
    const horatio = Horatio.fromSource(source, mockIO);
    const falstaff = new Falstaff(horatio.ast);
    const opheliaAst = falstaff.run();
    return opheliaPrettyPrint(opheliaAst);
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

  describe("SPL Formatting Snapshots", () => {
    const splFiles = getExampleFiles(splDir, ".spl");

    splFiles.forEach((filename) => {
      it(`should format ${filename}j`, () => {
        const filePath = path.join(splDir, filename);
        const source = fs.readFileSync(filePath, "utf-8");

        const horatioAst = Horatio.fromSource(source, mockIO).ast;
        const formatted = prettyPrint(horatioAst);

        expect(formatted).toMatchSnapshot(`${filename}-formatted`);
      });
    });
  });
});

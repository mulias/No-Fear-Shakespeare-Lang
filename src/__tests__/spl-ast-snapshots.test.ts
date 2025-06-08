import fs from "fs";
import path from "path";
import Horatio from "../horatio/compiler";
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
   * Read all files from a directory with specific extension
   */
  function getExampleFiles(dir: string, extension: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(extension))
      .sort();
  }

  describe("SPL AST Snapshots", () => {
    const splFiles = getExampleFiles(splDir, ".spl");

    splFiles.forEach((filename) => {
      it(`should parse ${filename} to Horatio AST`, () => {
        const filePath = path.join(splDir, filename);
        const source = fs.readFileSync(filePath, "utf-8");

        const horatio = Horatio.fromSource(source, mockIO);
        expect(horatio.ast).toMatchSnapshot(`${filename}-horatio-ast`);
      });
    });
  });
});

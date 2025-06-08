import fs from "fs";
import path from "path";
import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { Yorick } from "../yorick";
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
  const nfsplDir = path.join(examplesDir, "nfspl");

  /**
   * Transpile NFSPL source to SPL
   */
  async function transpileNfsplToSpl(source: string): Promise<string> {
    const possum = new Possum(source);
    const possumAst = await possum.run();

    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    const yorick = new Yorick(opheliaAst);
    const yorickAst = yorick.run();

    return prettyPrint(yorickAst);
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

  describe("NFSPL to SPL Transpilation Snapshots", () => {
    const nfsplFiles = getExampleFiles(nfsplDir, ".nfspl");

    nfsplFiles.forEach((filename) => {
      it(`should transpile ${filename} to SPL`, async () => {
        const filePath = path.join(nfsplDir, filename);
        const source = fs.readFileSync(filePath, "utf-8");

        const spl = await transpileNfsplToSpl(source);

        expect(spl).toMatchSnapshot(`${filename}-to-spl`);
      });
    });
  });
});

import fs from "fs";
import path from "path";
import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { Yorick } from "../yorick";

describe("Comprehensive Example File Snapshots", () => {
  const examplesDir = path.join(__dirname, "examples");
  const nfsplDir = path.join(examplesDir, "nfspl");

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

  describe("NFSPL AST Snapshots", () => {
    const nfsplFiles = getExampleFiles(nfsplDir, ".nfspl");

    nfsplFiles.forEach((filename) => {
      it(`should parse ${filename} to Horatio AST via transpilation`, async () => {
        const filePath = path.join(nfsplDir, filename);
        const source = fs.readFileSync(filePath, "utf-8");

        const possum = new Possum(source);
        const possumAst = await possum.run();

        const ophelia = new Ophelia(possumAst);
        const opheliaAst = ophelia.run();

        const yorick = new Yorick(opheliaAst);
        const horatioAst = yorick.run();

        expect(horatioAst).toMatchSnapshot(`${filename}-horatio-ast`);
      });
    });
  });
});

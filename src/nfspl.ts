#!/usr/bin/env node

import fs from "fs";
import prompt from "prompt-sync";
import path from "path";
import process from "process";
import { Possum } from "./possum";
import { Ophelia } from "./ophelia";
import { Yorick } from "./yorick";
import Horatio from "./horatio/horatio";
import { prettyPrint } from "./horatio/prettyPrint";
import { prettyPrint as opheliaPrettyPrint } from "./ophelia";
import { Falstaff } from "./falstaff";
import type { IO } from "./horatio/types";

const USAGE = `Usage: nfspl <command> [options] <file>

Commands:
  perform, execute, exec           Execute an NFSPL or SPL file
  translate, transpile, trans      Convert between NFSPL and SPL syntax
  compose, format, fmt             Format an NFSPL or SPL file

Options:
  -o, --output <file>   Output file (for transpile/format commands)
  -h, --help            Show this help message

Examples:
  nfspl exec program.nfspl
  nfspl perform program.spl
  nfspl translate program.nfspl -o program.spl
  nfspl transpile program.spl
  nfspl format program.spl
`;

interface CommandLineArgs {
  command: string;
  inputFile: string;
  outputFile?: string;
}

function printUsageAndExit(code: number = 0): never {
  console.log(USAGE);
  process.exit(code);
}

function parseArgs(args: string[]): CommandLineArgs {
  if (args.length < 2) {
    printUsageAndExit(1);
  }

  const command = args[0] ?? "";
  let inputFile = "";
  let outputFile: string | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i] ?? "";

    if (arg === "-h" || arg === "--help") {
      printUsageAndExit(0);
    } else if (arg === "-o" || arg === "--output") {
      if (i + 1 >= args.length) {
        console.error("Error: -o/--output requires a filename");
        printUsageAndExit(1);
      }
      outputFile = args[++i];
    } else if (!inputFile) {
      inputFile = arg;
    } else {
      console.error(`Error: Unexpected argument: ${arg}`);
      printUsageAndExit(1);
    }
  }

  if (!inputFile) {
    console.error("Error: No input file specified");
    printUsageAndExit(1);
  }

  return { command, inputFile, outputFile };
}

function detectFileType(filename: string): "nfspl" | "spl" {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".nfspl") return "nfspl";
  if (ext === ".spl") return "spl";

  console.error(
    `Error: Unknown file extension '${ext}'. Expected .nfspl or .spl`,
  );
  process.exit(1);
}

async function readFile(filename: string): Promise<string> {
  try {
    return await fs.promises.readFile(filename, "utf-8");
  } catch (error) {
    console.error(`Error reading file '${filename}':`, error);
    process.exit(1);
  }
}

async function writeFile(filename: string, content: string): Promise<void> {
  try {
    await fs.promises.writeFile(filename, content, "utf-8");
  } catch (error) {
    console.error(`Error writing file '${filename}':`, error);
    process.exit(1);
  }
}

const reader = prompt({ sigint: true });

class TermIO implements IO {
  _hasBufferedInput = false;
  _inputBuffer = "";
  debug = false;

  print(text: string): void {
    process.stdout.write(text);
  }

  read_char(callback: (input: string) => void): void {
    const input = this._hasBufferedInput ? this._inputBuffer : reader("> ");

    const char = input.slice(0, 1);
    const restInput = input.slice(1);

    callback(char);

    this._hasBufferedInput = !!char;
    this._inputBuffer = restInput;
  }

  read_int(callback: (input: string) => void): void {
    if (this._inputBuffer) {
      this._hasBufferedInput = false;
      this._inputBuffer = "";
    }

    const input = reader("> ");
    callback(input);
  }

  printDebug(text: string): void {
    process.stderr.write(`[DEBUG] ${text}\n`);
  }

  clear(): void {}
}

async function executeNfspl(filename: string): Promise<void> {
  const io = new TermIO();
  const source = await readFile(filename);

  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const horatioAst = yorick.run();

  const horatio = Horatio.fromAst(horatioAst, io);
  horatio.run();
  io.print("\n");
}

async function executeSpl(filename: string): Promise<void> {
  const io = new TermIO();
  const source = await readFile(filename);
  const horatio = Horatio.fromSource(source, io);
  horatio.run();
  io.print("\n");
}

async function transpileNfsplToSpl(inputFile: string): Promise<string> {
  const source = await readFile(inputFile);

  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const horatioAst = yorick.run();

  return prettyPrint(horatioAst);
}

async function formatSpl(inputFile: string): Promise<string> {
  const io = new TermIO();
  const source = await readFile(inputFile);
  const horatio = Horatio.fromSource(source, io);
  return prettyPrint(horatio.ast);
}

async function formatNfspl(inputFile: string): Promise<string> {
  const source = await readFile(inputFile);

  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  return opheliaPrettyPrint(opheliaAst);
}

async function transpileSplToNfspl(inputFile: string): Promise<string> {
  const source = await readFile(inputFile);
  const io = new TermIO();
  const horatio = Horatio.fromSource(source, io);

  const falstaff = new Falstaff(horatio.ast);
  const opheliaAst = falstaff.run();

  return opheliaPrettyPrint(opheliaAst);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
    printUsageAndExit(0);
  }

  const { command, inputFile, outputFile } = parseArgs(args);
  const fileType = detectFileType(inputFile);

  try {
    switch (command) {
      case "perform":
      case "execute":
      case "exec": {
        if (fileType === "nfspl") {
          await executeNfspl(inputFile);
        } else {
          await executeSpl(inputFile);
        }
        break;
      }

      case "translate":
      case "transpile":
      case "trans": {
        let result: string;

        if (fileType === "nfspl") {
          result = await transpileNfsplToSpl(inputFile);
        } else {
          result = await transpileSplToNfspl(inputFile);
        }

        if (outputFile) {
          await writeFile(outputFile, result);
          console.log(`Transpiled to ${outputFile}`);
        } else {
          console.log(result);
        }
        break;
      }

      case "compose":
      case "format":
      case "fmt": {
        let result: string;

        if (fileType === "nfspl") {
          result = await formatNfspl(inputFile);
        } else {
          result = await formatSpl(inputFile);
        }

        if (outputFile) {
          await writeFile(outputFile, result);
          console.log(`Formatted output written to ${outputFile}`);
        } else {
          console.log(result);
        }
        break;
      }

      default:
        console.error(`Error: Unknown command '${command}'`);
        printUsageAndExit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

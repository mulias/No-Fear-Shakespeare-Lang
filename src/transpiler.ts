#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Possum } from "./possum";
import { Ophelia } from "./ophelia";
import { Yorick } from "./yorick";
import { prettyPrint } from "./horatio/prettyPrint";

async function transpile(inputFile: string, outputFile?: string) {
  try {
    // Read the NFSPL source file
    const source = fs.readFileSync(inputFile, "utf8");

    // Run through the transpilation pipeline
    const possum = new Possum(source);
    const possumAst = await possum.run();

    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    const yorick = new Yorick(opheliaAst);
    const yorickAst = yorick.run();

    // Convert to Shakespeare text
    const shakespeareCode = prettyPrint(yorickAst);

    // Determine output file name
    if (!outputFile) {
      const dir = path.dirname(inputFile);
      const base = path.basename(inputFile, path.extname(inputFile));
      outputFile = path.join(dir, `${base}.spl`);
    }

    // Write the output
    fs.writeFileSync(outputFile, shakespeareCode);
    console.log(`Transpiled ${inputFile} -> ${outputFile}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Main CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: transpiler <input.nfspl> [output.spl]");
  console.log(
    "  Transpiles No Fear Shakespeare to Shakespeare Programming Language",
  );
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

if (!inputFile) {
  console.error("Error: No input file specified");
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${inputFile}' not found`);
  process.exit(1);
}

transpile(inputFile, outputFile);

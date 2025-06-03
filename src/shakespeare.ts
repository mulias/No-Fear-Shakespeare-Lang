import * as fs from "fs";
import prompt from "prompt-sync";
import Horatio from "./horatio/compiler";
import { IO } from "./horatio/types";

const reader = prompt({ sigint: true });

const io: IO = {
  print: (v) => process.stdout.write(`${v}`),
  read_char: (callback) => {
    const input = reader("> ");
    callback(input);
  },
  read_int: (callback) => {
    const input = reader("> ");
    callback(input);
  },
  debug: false,
  printDebug: (v) => console.log(v),
  clear: () => console.clear(),
};

const shakespeareFile = process.argv[2];

if (!shakespeareFile) {
  console.error("Usage: yarn shakespeare <shakespeare-file.spl>");
  process.exit(1);
}

if (!fs.existsSync(shakespeareFile)) {
  console.error(`File not found: ${shakespeareFile}`);
  process.exit(1);
}

const source = fs.readFileSync(shakespeareFile, "utf8");

try {
  const horatio = Horatio.fromSource(source, io);
  horatio.run();
} catch (e) {
  io.print(`${e}`);
}

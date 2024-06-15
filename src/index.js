import * as fs from "fs";
import prompt from "prompt-sync";
import { Yorick } from "./yorick";
import Horatio from "./horatio/compiler";
import { Possum } from "./possum";

const reader = prompt({ sigint: true });

const io = {
  print: (v) => process.stdout.write(`${v}`),
  read: (callback) => {
    const input = reader("> ");
    callback(input);
  },
  debug: false,
  printDebug: (v) => console.log(v),
};

const source = fs.readFileSync(
  "examples/no_fear_shakespeare/reverse.nfspl",
  "utf8",
);

async function run() {
  try {
    const possum = new Possum();
    const possumAst = await possum.parse(source);
    const yorick = new Yorick(possumAst);
    const horatio = new Horatio(io);
    const horatioAst = yorick.transpile();
    const program = horatio.fromAst(horatioAst);
    program.run();
  } catch (e) {
    io.print(e.message);
  }
}

run();

import * as fs from "fs";
import prompt from "prompt-sync";
import { Possum } from "./possum";
import { Ophelia } from "./ophelia";
import { Yorick } from "./yorick";
import Horatio from "./horatio/compiler";
import { IO } from "./horatio/types";

const reader = prompt({ sigint: true });

const io: IO = {
  print: (v) => process.stdout.write(`${v}`),
  read: (callback) => {
    const input = reader("> ");
    callback(input);
  },
  debug: false,
  printDebug: (v) => console.log(v),
  clear: () => console.clear(),
};

const source = fs.readFileSync(
  process.argv[2] || "examples/no_fear_shakespeare/fizzbuzz.nfspl",
  "utf8",
);

async function run() {
  try {
    const possum = new Possum(source);
    const possumAst = await possum.run();

    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    const yorick = new Yorick(opheliaAst);
    const yorickAst = yorick.run();

    const horatio = Horatio.fromAst(yorickAst, io);
    horatio.run();
  } catch (e) {
    io.print(`${e}`);
  }
}

run();

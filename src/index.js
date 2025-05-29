import * as fs from "fs";
import prompt from "prompt-sync";
import { Possum } from "./possum";
import { Ophelia } from "./ophelia";
import { Yorick } from "./yorick";
import Horatio from "./horatio/compiler";

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
  "examples/no_fear_shakespeare/fizzbuzz.nfspl",
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

    const horatio = new Horatio(yorickAst, io);
    horatio.run();
  } catch (e) {
    io.print(e.message);
  }
}

run();

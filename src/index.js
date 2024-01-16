import * as fs from "fs";
import prompt from "prompt-sync";
import { Yorick } from "./yorick";
import Horatio from "./horatio/compiler";
import possumAst from "./possum/reverseExample";

const reader = prompt({ sigint: true });

const io = {
  print: (v) => process.stdout.write(`${v}`),
  read: (callback) => {
    const input = reader("> ");
    callback(input);
  },
  debug: true,
  printDebug: (v) => console.log(v),
};

try {
  const yorick = new Yorick(possumAst);
  const horatio = new Horatio(io);
  const horatioAst = yorick.transpile();
  const program = horatio.fromAst(horatioAst);
  program.run();
} catch (e) {
  io.print(e.message);
}

import * as fs from "fs";
import yorick from "./yorick";
import Compiler from "./horatio/compiler";
import possumAst from "./possum/hiExample";

const io = {
  print: (d) => process.stdout.write(`${d}`),
};

const compiler = new Compiler(io);

const extendedHoratioAst =
  yorick[
    "There are more things in Heaven and Earth, Horatio, than are dreamt of in your philosophy."
  ](possumAst);

const horatioAst =
  yorick["Something is rotten in the state of Denmark."](extendedHoratioAst);

console.log(horatioAst);

const program = compiler.fromAst(horatioAst);

program.run();

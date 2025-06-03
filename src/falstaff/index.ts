import * as HoratioAst from "../horatio/ast";
import * as OpheliaAst from "../ophelia/ast";
import { Reverser } from "./reverser";

export class Falstaff {
  private horatioAst: HoratioAst.Program;

  constructor(horatioAst: HoratioAst.Program) {
    this.horatioAst = horatioAst;
  }

  run(): OpheliaAst.Program {
    const reverser = new Reverser();
    return reverser.reverseProgram(this.horatioAst);
  }
}

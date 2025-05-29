import Generator from "./generator";
import Program from "./program";
import Wordlists from "./wordlists";
import * as Ast from "./ast";
import { IO } from "./types";

/**
 * Horatio Encoder
 */
export default class Encoder extends Generator {
  program: Program;

  constructor(io: IO) {
    super();
    this.program = new Program(io);
  }

  /**
   * Encode
   */
  encode(program: Ast.Program): Program {
    program.visit(this, null);
    return this.program;
  }

  /**
   * Get index number from roman numeral
   */
  numeralIndex(numeral: string): number {
    return Wordlists.roman_numerals.indexOf(numeral);
  }
}

import Compiler from "./compiler";
import * as Ast from "./ast";
import Program from "./program";

/**
 * Horatio
 * A Javascript compiler for the Shakespeare Programming Language
 *
 * @author Miles Zimmerman
 */
import { IO } from "./types";

declare global {
  interface Window {
    Horatio: typeof Horatio;
  }
}

class Horatio extends Compiler {
  constructor(
    source: string | undefined,
    ast: Ast.Program,
    io: IO,
    program: Program,
  ) {
    super(source, ast, io, program);
  }
}

if (typeof window !== "undefined") {
  window.Horatio = Horatio;
}

export default Horatio;

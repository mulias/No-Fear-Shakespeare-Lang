import Parser from "./parser";
import Checker from "./checker";
import Encoder from "./encoder";
import * as Ast from "./ast";
import Program from "./program";
import { IO } from "./types";

/**
 * Compiles SPL into javascript
 * @memberof Horatio
 */
export default class Compiler {
  source?: string;
  ast: Ast.Program;
  io: IO;
  program: Program;

  constructor(
    source: string | undefined,
    ast: Ast.Program,
    io: IO,
    program: Program,
  ) {
    this.source = source;
    this.ast = ast;
    this.io = io;
    this.program = program;
  }

  /**
   * Compile an SPL program
   * @param {string} source - The input SPL program
   */
  static fromSource(source: string, io: IO): Compiler {
    // Parse source
    let parser = new Parser(source);

    // Generate AST
    let ast = parser.parse();

    // Semantic Check
    let checker = new Checker();
    checker.check(ast);

    // Code Generation
    let encoder = new Encoder(io);
    let program = encoder.encode(ast);

    return new Compiler(source, ast, io, program);
  }

  static fromAst(ast: Ast.Program, io: IO): Compiler {
    // Semantic Check
    let checker = new Checker();
    checker.check(ast);

    // Code Generation
    let encoder = new Encoder(io);
    let program = encoder.encode(ast);

    return new Compiler(undefined, ast, io, program);
  }

  run(): void {
    this.program.run();
  }
}

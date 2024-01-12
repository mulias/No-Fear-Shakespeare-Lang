import * as PossumAst from "../possum/ast";
import * as Ast from "./ast";

const buildPlaceholder = <T>(placeholder: T): Ast.Placeholder<T> => ({
  placeholder,
});

const buildProgram = (program: PossumAst.Program): Ast.Program =>
  new Ast.Program(
    buildComment("Title todo."),
    buildPlaceholder(null),
    buildParts(program.nodes),
  );

const buildComment = (text: string): Ast.Comment => new Ast.Comment(text);

const buildParts = (acts: PossumAst.Act[]): Ast.Part[] =>
  acts.map(
    (act, index) =>
      new Ast.Part(
        act.labelId,
        buildPlaceholder(index + 1),
        buildComment(act.labelId),
        [],
      ),
  );

export default {
  ["There are more things in Heaven and Earth, Horatio, than are dreamt of in your philosophy."]:
    buildProgram,
  ["Something is rotten in the state of Denmark."]: (ast: Ast.Program) => ast,
};

import * as HoratioAst from "../horatio/ast";

export default {
  ["There are more things in Heaven and Earth, Horatio, than are dreamt of in your philosophy."]:
    (ast: any) => {
      switch (ast.type) {
        case "program":
          const comment = new HoratioAst.Comment("Placeholder");
          return new HoratioAst.Program(comment, [], []);
          break;
        default:
          throw new Error(`missing type ${ast.type}`);
      }
    },
  ["Something is rotten in the state of Denmark."]: (ast: any) => ast,
};

import { Ophelia } from "../index";
import * as PossumAst from "../../possum/ast";
import * as OpheliaAst from "../ast";

describe("Ophelia Transformer", () => {
  describe("valid AST transformations", () => {
    it("should transform a simple program structure", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.type).toBe("program");
      expect(ast.acts).toHaveLength(1);
      expect(ast.acts[0]?.actId).toBe("Main");
      expect(ast.acts[0]?.scenes).toHaveLength(1);
      expect(ast.acts[0]?.scenes[0]?.sceneId).toBe("Start");
    });

    it("should transform stage directions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "a" },
                      { type: "var", value: "b" },
                    ],
                  },
                  { type: "var", value: "unstage_all" },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      expect(directions).toHaveLength(2);

      const stage = directions[0] as OpheliaAst.Stage;
      expect(stage.type).toBe("stage");
      expect(stage.varId1).toBe("a");
      expect(stage.varId2).toBe("b");

      const unstageAll = directions[1] as OpheliaAst.UnstageAll;
      expect(unstageAll.type).toBe("unstage_all");
    });

    it("should transform dialogue blocks with statements", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "b" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "int", value: 42 }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: { type: "var", value: "print_char" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      expect(directions).toHaveLength(1);

      const dialogue = directions[0] as OpheliaAst.Dialogue;
      expect(dialogue.type).toBe("dialogue");
      expect(dialogue.speakerVarId).toBe("b");
      expect(dialogue.lines).toHaveLength(2);

      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      expect(setStmt.type).toBe(".set");
      expect(setStmt.varId).toBe("a");
      expect(setStmt.value).toEqual({ type: "int", value: 42 });

      const printStmt = dialogue.lines[1] as OpheliaAst.PrintChar;
      expect(printStmt.type).toBe(".print_char");
      expect(printStmt.varId).toBe("a");
    });

    it("should transform test expressions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "function_call",
                        postfixed: { type: "var", value: "test_eq" },
                        value: [
                          { type: "var", value: "a" },
                          { type: "int", value: 0 },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      const dialogue = directions[0] as OpheliaAst.Dialogue;
      const testStmt = dialogue.lines[0] as OpheliaAst.Test;
      expect(testStmt.type).toBe("test_eq");
      expect(testStmt.left).toEqual({ type: "var", id: "a" });
      expect(testStmt.right).toEqual({ type: "int", value: 0 });
    });

    it("should transform if statements", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "function_call",
                        postfixed: { type: "var", value: "if_true" },
                        value: [
                          {
                            type: "function_call",
                            postfixed: { type: "var", value: "goto" },
                            value: [{ type: "var", value: "End" }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      const dialogue = directions[0] as OpheliaAst.Dialogue;
      const ifStmt = dialogue.lines[0] as OpheliaAst.If;
      expect(ifStmt.type).toBe("if");
      expect(ifStmt.is).toBe(true);

      const gotoStmt = ifStmt.then as OpheliaAst.Goto;
      expect(gotoStmt.type).toBe("goto");
      expect(gotoStmt.labelId).toBe("End");
    });

    it("should transform arithmetic expressions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [
                            {
                              type: "add",
                              left: { type: "var", value: "b" },
                              right: { type: "int", value: 1 },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      const dialogue = directions[0] as OpheliaAst.Dialogue;
      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      const arithmetic = setStmt.value as OpheliaAst.Arithmetic;
      expect(arithmetic.type).toBe("arithmetic");
      expect(arithmetic.op).toBe("+");
      expect(arithmetic.left).toEqual({ type: "var", id: "b" });
      expect(arithmetic.right).toEqual({ type: "int", value: 1 });
    });
  });

  describe("error reporting", () => {
    it("should report errors for malformed nodes", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "malformed",
            value: "invalid syntax here",
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Found 1 error:\n  1. Malformed syntax: invalid syntax here at "invalid syntax here"',
      );
    });

    it("should report errors for invalid top-level structure", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          { type: "int", value: 42 }, // Not a block
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Found 1 error:\n  1. Expected a block with a label (e.g., Main { ... })",
      );
    });

    it("should report errors for unknown functions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "unknown_function" },
                    value: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Found 1 error:\n  1. Expected a stage direction or dialogue block at "unknown_function(...)"',
      );
    });

    it("should report errors for invalid method calls", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: { type: "var", value: "invalid_method" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        /Unknown method: invalid_method at "a.invalid_method"/,
      );
    });

    it("should report multiple errors", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "bad_func" },
                    value: [],
                  },
                ],
              },
              {
                type: "block",
                postfixed: { type: "var", value: "Scene2" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "var",
                        value: "standalone_var",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(/Found \d+ errors:/);
    });

    it("should report errors for wrong stage argument count", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "a" },
                      { type: "var", value: "b" },
                      { type: "var", value: "c" }, // Too many args
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Found 1 error:\n  1. stage() expects 1 or 2 arguments",
      );
    });

    it("should report errors for non-variable stage arguments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "int", value: 42 }, // Not a variable
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Found 1 error:\n  1. stage() arguments must be variables",
      );
    });

    it("should report error for lowercase act names", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "main" }, // lowercase
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Found 1 error:\n  1. Act labels must start with a capital letter, found: "main"',
      );
    });

    it("should report error for lowercase scene names", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "start" }, // lowercase
                value: [],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Found 1 error:\n  1. Scene labels must start with a capital letter, found: "start"',
      );
    });

    it("should report error for uppercase speaking block names", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "Speaker" }, // uppercase
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: { type: "var", value: "print_char" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Found 1 error:\n  1. Speaking blocks must use lowercase variable names, found: \"Speaker\". Use lowercase for dialogue (e.g., 'a { ... }') or place this at the scene level for a subscene.",
      );
    });
  });

  describe("complex scenarios", () => {
    it("should handle fizzbuzz-like structures", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Start" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "n" },
                      { type: "var", value: "out" },
                    ],
                  },
                ],
              },
              {
                type: "block",
                postfixed: { type: "var", value: "Loop" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "out" },
                    value: [
                      {
                        type: "function_call",
                        postfixed: { type: "var", value: "test_gt" },
                        value: [
                          { type: "var", value: "n" },
                          { type: "int", value: 100 },
                        ],
                      },
                      {
                        type: "function_call",
                        postfixed: { type: "var", value: "if_true" },
                        value: [
                          {
                            type: "function_call",
                            postfixed: { type: "var", value: "goto" },
                            value: [{ type: "var", value: "End" }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: "block",
                postfixed: { type: "var", value: "End" },
                value: [{ type: "var", value: "unstage_all" }],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.acts[0]?.scenes).toHaveLength(3);
      expect(ast.acts[0]?.scenes[0]?.sceneId).toBe("Start");
      expect(ast.acts[0]?.scenes[1]?.sceneId).toBe("Loop");
      expect(ast.acts[0]?.scenes[2]?.sceneId).toBe("End");
    });

    it("should handle multiple speaking blocks in one scene", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Play" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Dialogue" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "a" },
                      { type: "var", value: "b" },
                    ],
                  },
                  {
                    type: "block",
                    postfixed: { type: "var", value: "a" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "b" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "char", value: "H" }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "b" },
                        right: { type: "var", value: "print_char" },
                      },
                    ],
                  },
                  {
                    type: "block",
                    postfixed: { type: "var", value: "b" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "char", value: "i" }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "a" },
                        right: { type: "var", value: "print_char" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions = ast.acts[0]?.scenes[0]?.directions || [];
      expect(directions).toHaveLength(3); // stage + 2 dialogues

      const stage = directions[0] as OpheliaAst.Stage;
      expect(stage.type).toBe("stage");

      const dialogue1 = directions[1] as OpheliaAst.Dialogue;
      expect(dialogue1.type).toBe("dialogue");
      expect(dialogue1.speakerVarId).toBe("a");
      expect(dialogue1.lines).toHaveLength(2);

      const dialogue2 = directions[2] as OpheliaAst.Dialogue;
      expect(dialogue2.type).toBe("dialogue");
      expect(dialogue2.speakerVarId).toBe("b");
      expect(dialogue2.lines).toHaveLength(2);
    });
  });
});

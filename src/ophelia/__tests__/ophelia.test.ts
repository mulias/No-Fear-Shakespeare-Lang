import { Ophelia, prettyPrint } from "../index";
import * as PossumAst from "../../possum/ast";
import * as OpheliaAst from "../ast";
import { templateString } from "../../test-helpers";

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
      expect(
        ast.items.filter((item): item is OpheliaAst.Act => item.type === "act"),
      ).toHaveLength(1);
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).actId,
      ).toBe("Main");
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        ),
      ).toHaveLength(1);
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.sceneId,
      ).toBe("Start");
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
      expect(directions).toHaveLength(2);

      const stage = directions[0] as OpheliaAst.Stage;
      expect(stage.type).toBe("stage");
      expect(stage.varIds).toEqual(["a", "b"]);

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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "int", value: 42 }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
      expect(directions).toHaveLength(1);

      const dialogue = directions[0] as OpheliaAst.Dialogue;
      expect(dialogue.type).toBe("dialogue");
      expect(dialogue.speakerVarId).toBe("b");
      expect(dialogue.lines).toHaveLength(2);

      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      expect(setStmt.type).toBe(".set");
      expect(setStmt.value).toEqual({ type: "int", value: 42 });

      const printStmt = dialogue.lines[1] as OpheliaAst.PrintChar;
      expect(printStmt.type).toBe(".print_char");
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [
                            {
                              type: "add",
                              left: { type: "var", value: "speaker" },
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
      const dialogue = directions[0] as OpheliaAst.Dialogue;
      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      const arithmetic = setStmt.value as OpheliaAst.Arithmetic;
      expect(arithmetic.type).toBe("arithmetic");
      expect(arithmetic.op).toBe("+");
      expect(arithmetic.left).toEqual({ type: "var", id: "speaker" });
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
                        left: { type: "var", value: "@you" },
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
        /Unknown method: invalid_method at "@you.invalid_method"/,
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
        "Found 1 error:\n  1. stage() expects at least 1 argument",
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
                        left: { type: "var", value: "@you" },
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

  describe("comment support", () => {
    it("should transform comments", () => {
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
                    type: "comment",
                    value: "This is a comment",
                  },
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "a" },
                      { type: "var", value: "b" },
                    ],
                  },
                  {
                    type: "comment",
                    value: "Another comment",
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
      expect(directions).toHaveLength(3);

      const comment1 = directions[0] as OpheliaAst.Comment;
      expect(comment1.type).toBe("comment");
      expect(comment1.content).toBe("This is a comment");

      const stage = directions[1] as OpheliaAst.Stage;
      expect(stage.type).toBe("stage");

      const comment2 = directions[2] as OpheliaAst.Comment;
      expect(comment2.type).toBe("comment");
      expect(comment2.content).toBe("Another comment");
    });

    it("should handle comments mixed with dialogue", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
                value: [
                  {
                    type: "comment",
                    value: "Setup comment",
                  },
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [{ type: "var", value: "speaker" }],
                  },
                  {
                    type: "comment",
                    value: "Dialogue comment",
                  },
                  {
                    type: "block",
                    postfixed: { type: "var", value: "speaker" },
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
      expect(directions).toHaveLength(4);

      expect(directions[0]?.type).toBe("comment");
      expect(directions[1]?.type).toBe("stage");
      expect(directions[2]?.type).toBe("comment");
      expect(directions[3]?.type).toBe("dialogue");
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

      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        ),
      ).toHaveLength(3);
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.sceneId,
      ).toBe("Start");
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[1]?.sceneId,
      ).toBe("Loop");
      expect(
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[2]?.sceneId,
      ).toBe("End");
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "char", value: "H" }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "char", value: "i" }],
                        },
                      },
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
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

      const directions =
        (
          ast.items.filter(
            (item): item is OpheliaAst.Act => item.type === "act",
          )[0] as OpheliaAst.Act
        ).items.filter(
          (item): item is OpheliaAst.Scene => item.type === "scene",
        )[0]?.directions || [];
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

    it("should handle @you variable correctly", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [{ type: "int", value: 42 }],
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
      const result = ophelia.run();

      const directions =
        result.items
          .filter((item): item is OpheliaAst.Act => item.type === "act")[0]
          ?.items.filter(
            (item): item is OpheliaAst.Scene => item.type === "scene",
          )[0]?.directions || [];
      const dialogue = directions[1] as OpheliaAst.Dialogue;
      expect(dialogue).toMatchObject({
        type: "dialogue",
        speakerVarId: "a",
        lines: [
          {
            type: ".set",
            value: { type: "int", value: 42 },
          },
        ],
      });
    });

    it("should reject invalid @ variables", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                        left: { type: "var", value: "@invalid" },
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
        /Invalid @ variable.*Only "@you" is allowed/,
      );
    });

    it("should handle @you in expressions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [
                            {
                              type: "add",
                              left: { type: "var", value: "@you" },
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
      const result = ophelia.run();

      const directions =
        result.items
          .filter((item): item is OpheliaAst.Act => item.type === "act")[0]
          ?.items.filter(
            (item): item is OpheliaAst.Scene => item.type === "scene",
          )[0]?.directions || [];
      const dialogue = directions[1] as OpheliaAst.Dialogue;
      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      const arithmetic = setStmt.value as OpheliaAst.Arithmetic;

      expect(arithmetic).toMatchObject({
        type: "arithmetic",
        op: "+",
        left: { type: "you" },
        right: { type: "int", value: 1 },
      });
    });

    it("should reject @you in stage() calls", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "@you" },
                      { type: "var", value: "b" },
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
        /stage\(\) arguments must be variables/,
      );
    });

    it("should reject @you in unstage() calls", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "unstage" },
                    value: [{ type: "var", value: "@you" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        /unstage\(\) arguments must be variables/,
      );
    });

    it("should handle @you in all statement types", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                      // @you.print_char
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "print_char" },
                      },
                      // @you.print_int
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "print_int" },
                      },
                      // @you.read_char
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "read_char" },
                      },
                      // @you.read_int
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "read_int" },
                      },
                      // @you.push_self
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "push_self" },
                      },
                      // @you.push_me
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "push_me" },
                      },
                      // @you.pop
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
                        right: { type: "var", value: "pop" },
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
      const result = ophelia.run();

      const directions =
        result.items
          .filter((item): item is OpheliaAst.Act => item.type === "act")[0]
          ?.items.filter(
            (item): item is OpheliaAst.Scene => item.type === "scene",
          )[0]?.directions || [];
      const dialogue = directions[1] as OpheliaAst.Dialogue;

      expect(dialogue.lines).toHaveLength(7);
      expect(dialogue.lines[0]).toMatchObject({ type: ".print_char" });
      expect(dialogue.lines[1]).toMatchObject({ type: ".print_int" });
      expect(dialogue.lines[2]).toMatchObject({ type: ".read_char" });
      expect(dialogue.lines[3]).toMatchObject({ type: ".read_int" });
      expect(dialogue.lines[4]).toMatchObject({ type: ".push_self" });
      expect(dialogue.lines[5]).toMatchObject({ type: ".push_me" });
      expect(dialogue.lines[6]).toMatchObject({ type: ".pop" });
    });

    it("should handle @you in test expressions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                        type: "function_call",
                        postfixed: { type: "var", value: "test_eq" },
                        value: [
                          { type: "var", value: "@you" },
                          { type: "int", value: 42 },
                        ],
                      },
                      {
                        type: "function_call",
                        postfixed: { type: "var", value: "test_gt" },
                        value: [
                          { type: "int", value: 10 },
                          { type: "var", value: "@you" },
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
      const result = ophelia.run();

      const directions =
        result.items
          .filter((item): item is OpheliaAst.Act => item.type === "act")[0]
          ?.items.filter(
            (item): item is OpheliaAst.Scene => item.type === "scene",
          )[0]?.directions || [];
      const dialogue = directions[1] as OpheliaAst.Dialogue;

      const test1 = dialogue.lines[0] as OpheliaAst.Test;
      expect(test1).toMatchObject({
        type: "test_eq",
        left: { type: "you" },
        right: { type: "int", value: 42 },
      });

      const test2 = dialogue.lines[1] as OpheliaAst.Test;
      expect(test2).toMatchObject({
        type: "test_gt",
        left: { type: "int", value: 10 },
        right: { type: "you" },
      });
    });

    it("should reject @you as a speaker", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
                value: [
                  {
                    type: "block",
                    postfixed: { type: "var", value: "@you" }, // @you as speaker
                    value: [
                      {
                        type: "method_access",
                        left: { type: "var", value: "@you" },
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
      expect(() => ophelia.run()).toThrow(/@you cannot be used as a speaker/);
    });

    it("should handle mixed @you and regular variables in arithmetic", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene" },
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
                        left: { type: "var", value: "@you" },
                        right: {
                          type: "function_call",
                          postfixed: { type: "var", value: "set" },
                          value: [
                            {
                              type: "multiply",
                              left: { type: "var", value: "@you" },
                              right: { type: "var", value: "a" },
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
      const result = ophelia.run();

      const directions =
        result.items
          .filter((item): item is OpheliaAst.Act => item.type === "act")[0]
          ?.items.filter(
            (item): item is OpheliaAst.Scene => item.type === "scene",
          )[0]?.directions || [];
      const dialogue = directions[1] as OpheliaAst.Dialogue;
      const setStmt = dialogue.lines[0] as OpheliaAst.Set;
      const arithmetic = setStmt.value as OpheliaAst.Arithmetic;

      expect(arithmetic).toMatchObject({
        type: "arithmetic",
        op: "*",
        left: { type: "you" },
        right: { type: "var", id: "a" },
      });
    });
  });

  describe("doc comment title support", () => {
    it("should extract title from doc comment at program level", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              {
                type: "template_string",
                value: [
                  {
                    type: "template_string_segment",
                    value: "To Fizz, Perchance To Buzz",
                  },
                ],
              },
            ],
          },
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

      expect(ast.title).toBeDefined();
      expect(ast.title).toEqual({
        type: "template_string",
        value: [
          {
            type: "template_string_segment",
            value: "To Fizz, Perchance To Buzz",
          },
        ],
      });
    });

    it("should work without title doc comment", () => {
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

      expect(ast.title).toBeUndefined();
    });

    it("should reject title doc comment after first act", () => {
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
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              templateString("Too Late Title"),
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Title doc comment must be at the top level of the program, before any acts",
      );
    });

    it("should reject multiple title doc comments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              templateString("First Title"),
            ],
          },
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              templateString("Second Title"),
            ],
          },
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
      expect(() => ophelia.run()).toThrow(
        "Multiple title doc comments found. Only one title is allowed",
      );
    });

    it("should reject non-title doc comments at program level", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "author" },
              templateString("William Shakespeare"),
            ],
          },
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
      expect(() => ophelia.run()).toThrow(
        'Invalid doc comment key "author" at program level. Only "title", "var", and "description" are allowed at the top level.',
      );
    });

    it("should allow regular comments before title doc comment", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "comment",
            value: "This is a regular comment",
          },
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              templateString("The Title After Comment"),
            ],
          },
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

      expect(ast.title).toBeDefined();
      expect(ast.title).toEqual({
        type: "template_string",
        value: [
          { type: "template_string_segment", value: "The Title After Comment" },
        ],
      });
    });

    it("should preserve title through pretty printing", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              templateString("Pretty Printed Title"),
            ],
          },
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
      const prettyPrinted = prettyPrint(ast);

      expect(prettyPrinted).toContain("## title: Pretty Printed Title");
      expect(prettyPrinted.indexOf("## title:")).toBe(0); // Should be first line
    });

    it("should round-trip: parse -> pretty print -> parse again", async () => {
      // Import Possum for parsing
      const { Possum } = await import("../../possum");

      // Original NFSPL source with title
      const originalSource = `## title: Round Trip Test

Main {
  Start {
    stage(a, b)

    a {
      @you.set(42)
      @you.print_int
    }

    unstage_all
  }
}`;

      // Parse original source
      const possum1 = new Possum(originalSource);
      const possumAst1 = await possum1.run();

      // Transform to Ophelia AST
      const ophelia1 = new Ophelia(possumAst1);
      const opheliaAst1 = ophelia1.run();

      // Pretty print
      const prettyPrinted = prettyPrint(opheliaAst1);

      // Parse the pretty printed code
      const possum2 = new Possum(prettyPrinted);
      const possumAst2 = await possum2.run();

      // Transform to Ophelia AST again
      const ophelia2 = new Ophelia(possumAst2);
      const opheliaAst2 = ophelia2.run();

      // The two Ophelia ASTs should be equivalent
      expect(opheliaAst2.title).toEqual(opheliaAst1.title);
      expect(opheliaAst2.items).toEqual(opheliaAst1.items);

      // Pretty printing again should produce the same result
      const prettyPrinted2 = prettyPrint(opheliaAst2);
      expect(prettyPrinted2).toBe(prettyPrinted);
    });
  });

  describe("doc comment description support", () => {
    it("should extract description for act", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              templateString("The main act where everything happens"),
            ],
          },
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

      const act = ast.items[0] as OpheliaAst.Act;
      expect(act.type).toBe("act");
      expect(act.description).toEqual({
        type: "template_string",
        value: [
          {
            type: "template_string_segment",
            value: "The main act where everything happens",
          },
        ],
      });
    });

    it("should extract description for scene", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "doc_comment",
                value: [
                  { type: "doc_comment_property", value: "description" },
                  templateString("The opening scene"),
                ],
              },
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

      const act = ast.items[0] as OpheliaAst.Act;
      const scene = act.items[0] as OpheliaAst.Scene;
      expect(scene.type).toBe("scene");
      expect(scene.description).toEqual({
        type: "template_string",
        value: [
          { type: "template_string_segment", value: "The opening scene" },
        ],
      });
    });

    it("should handle acts and scenes without descriptions", () => {
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

      const act = ast.items[0] as OpheliaAst.Act;
      const scene = act.items[0] as OpheliaAst.Scene;
      expect(act.description).toBeUndefined();
      expect(scene.description).toBeUndefined();
    });

    it("should reject multiple description doc comments before act", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              templateString("First description"),
            ],
          },
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              templateString("Second description"),
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Multiple description doc comments found before act",
      );
    });

    it("should reject multiple description doc comments before scene", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "doc_comment",
                value: [
                  { type: "doc_comment_property", value: "description" },
                  templateString("First description"),
                ],
              },
              {
                type: "doc_comment",
                value: [
                  { type: "doc_comment_property", value: "description" },
                  templateString("Second description"),
                ],
              },
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
        "Multiple description doc comments found before scene",
      );
    });

    it("should reject description doc comment not followed by act", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              templateString("Orphaned description"),
            ],
          },
          {
            type: "comment",
            value: "Just a comment",
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Description doc comment must be followed by an act",
      );
    });

    it("should reject description doc comment not followed by scene", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "doc_comment",
                value: [
                  { type: "doc_comment_property", value: "description" },
                  templateString("Orphaned description"),
                ],
              },
              {
                type: "comment",
                value: "Just a comment",
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Description doc comment must be followed by a scene",
      );
    });

    it("should reject doc comments inside scenes", () => {
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
                    type: "doc_comment",
                    value: [
                      { type: "doc_comment_property", value: "description" },
                      templateString("Invalid placement"),
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
        "Doc comments are not allowed inside scenes",
      );
    });

    it("should reject non-description doc comments at program level", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "author" },
              templateString("Shakespeare"),
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Invalid doc comment key "author" at program level',
      );
    });

    it("should allow regular comments between description and act", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              templateString("The main act"),
            ],
          },
          {
            type: "comment",
            value: "This is fine",
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        "Description doc comment must be followed by an act, not a regular comment",
      );
    });

    it("should preserve descriptions through pretty printing", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            description: templateString("The main act"),
            items: [
              {
                type: "scene",
                sceneId: "Start",
                description: templateString("The starting scene"),
                directions: [],
              },
            ],
          },
        ],
      };

      const prettyPrinted = prettyPrint(ast);
      expect(prettyPrinted).toContain("## description: The main act");
      expect(prettyPrinted).toContain("## description: The starting scene");

      // Check proper placement
      const lines = prettyPrinted.split("\n");
      const actDescIndex = lines.findIndex((l) =>
        l.includes("## description: The main act"),
      );
      const actIndex = lines.findIndex((l) => l.includes("Main {"));
      const sceneDescIndex = lines.findIndex((l) =>
        l.includes("## description: The starting scene"),
      );
      const sceneIndex = lines.findIndex((l) => l.includes("Start {"));

      expect(actDescIndex).toBeLessThan(actIndex);
      expect(sceneDescIndex).toBeLessThan(sceneIndex);
      expect(sceneDescIndex).toBeGreaterThan(actIndex);
    });
  });

  describe("var doc comment support", () => {
    it("should extract var declarations from doc comments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "stack" },
              templateString("a stacky gentleperson"),
            ],
          },
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "count" },
              templateString("who counts the memories"),
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.varDeclarations.size).toBe(2);
      expect(ast.varDeclarations.get("stack")).toEqual(
        templateString("a stacky gentleperson"),
      );
      expect(ast.varDeclarations.get("count")).toEqual(
        templateString("who counts the memories"),
      );
    });

    it("should handle programs without var declarations", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.varDeclarations.size).toBe(0);
    });

    it("should reject duplicate var declarations", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "stack" },
              templateString("first description"),
            ],
          },
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "stack" },
              templateString("second description"),
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      expect(() => ophelia.run()).toThrow(
        'Variable "stack" already declared. Only one declaration per variable is allowed.',
      );
    });

    it("should preserve var declarations through pretty printing", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map([
          ["stack", templateString("a stacky gentleperson")],
          ["count", templateString("who counts things")],
        ]),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [],
          },
        ],
      };

      const prettyPrinted = prettyPrint(ast);
      expect(prettyPrinted).toContain("## var stack: a stacky gentleperson");
      expect(prettyPrinted).toContain("## var count: who counts things");
    });
  });

  describe("template string support", () => {
    it("should handle template strings in title doc comments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              {
                type: "template_string",
                value: [
                  { type: "template_string_segment", value: "The Tale of " },
                  { type: "template_var_segment", value: "a" },
                  { type: "template_string_segment", value: " and " },
                  { type: "template_var_segment", value: "b" },
                ],
              },
            ],
          },
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

      expect(ast.title).toBeDefined();
      expect(ast.title?.type).toBe("template_string");
      expect(ast.title?.value).toHaveLength(4);
      expect(ast.title?.value[0]).toEqual({
        type: "template_string_segment",
        value: "The Tale of ",
      });
      expect(ast.title?.value[1]).toEqual({
        type: "template_var_segment",
        value: "a",
      });
      expect(ast.title?.value[2]).toEqual({
        type: "template_string_segment",
        value: " and ",
      });
      expect(ast.title?.value[3]).toEqual({
        type: "template_var_segment",
        value: "b",
      });
    });

    it("should handle template strings in var declarations", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "stack" },
              {
                type: "template_string",
                value: [
                  {
                    type: "template_string_segment",
                    value: "a stacky gentleperson named ",
                  },
                  { type: "template_var_segment", value: "stack" },
                ],
              },
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.varDeclarations.size).toBe(1);
      const stackDescription = ast.varDeclarations.get("stack");
      expect(stackDescription).toBeDefined();
      expect(stackDescription?.type).toBe("template_string");
      expect(stackDescription?.value).toHaveLength(2);
      expect(stackDescription?.value[0]).toEqual({
        type: "template_string_segment",
        value: "a stacky gentleperson named ",
      });
      expect(stackDescription?.value[1]).toEqual({
        type: "template_var_segment",
        value: "stack",
      });
    });

    it("should handle template strings in act descriptions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "description" },
              {
                type: "template_string",
                value: [
                  {
                    type: "template_string_segment",
                    value: "An act featuring ",
                  },
                  { type: "template_var_segment", value: "hero" },
                  { type: "template_string_segment", value: " the brave" },
                ],
              },
            ],
          },
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

      const act = ast.items[0] as OpheliaAst.Act;
      expect(act.description).toBeDefined();
      expect(act.description?.type).toBe("template_string");
      expect(act.description?.value).toHaveLength(3);
      expect(act.description?.value[0]).toEqual({
        type: "template_string_segment",
        value: "An act featuring ",
      });
      expect(act.description?.value[1]).toEqual({
        type: "template_var_segment",
        value: "hero",
      });
      expect(act.description?.value[2]).toEqual({
        type: "template_string_segment",
        value: " the brave",
      });
    });

    it("should handle template strings in scene descriptions", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [
              {
                type: "doc_comment",
                value: [
                  { type: "doc_comment_property", value: "description" },
                  {
                    type: "template_string",
                    value: [
                      { type: "template_string_segment", value: "Where " },
                      { type: "template_var_segment", value: "protagonist" },
                      { type: "template_string_segment", value: " meets " },
                      { type: "template_var_segment", value: "antagonist" },
                    ],
                  },
                ],
              },
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

      const act = ast.items[0] as OpheliaAst.Act;
      const scene = act.items[0] as OpheliaAst.Scene;
      expect(scene.description).toBeDefined();
      expect(scene.description?.type).toBe("template_string");
      expect(scene.description?.value).toHaveLength(4);
      expect(scene.description?.value[0]).toEqual({
        type: "template_string_segment",
        value: "Where ",
      });
      expect(scene.description?.value[1]).toEqual({
        type: "template_var_segment",
        value: "protagonist",
      });
      expect(scene.description?.value[2]).toEqual({
        type: "template_string_segment",
        value: " meets ",
      });
      expect(scene.description?.value[3]).toEqual({
        type: "template_var_segment",
        value: "antagonist",
      });
    });

    it("should preserve template variables in pretty printing", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        title: {
          type: "template_string",
          value: [
            { type: "template_string_segment", value: "The Adventures of " },
            { type: "template_var_segment", value: "hero" },
          ],
        },
        varDeclarations: new Map([
          [
            "hero",
            {
              type: "template_string",
              value: [
                { type: "template_string_segment", value: "a brave " },
                { type: "template_var_segment", value: "hero" },
              ],
            },
          ],
        ]),
        items: [
          {
            type: "act",
            actId: "Main",
            description: {
              type: "template_string",
              value: [
                {
                  type: "template_string_segment",
                  value: "The main act starring ",
                },
                { type: "template_var_segment", value: "hero" },
              ],
            },
            items: [
              {
                type: "scene",
                sceneId: "Start",
                description: {
                  type: "template_string",
                  value: [
                    { type: "template_string_segment", value: "Where " },
                    { type: "template_var_segment", value: "hero" },
                    {
                      type: "template_string_segment",
                      value: " begins the journey",
                    },
                  ],
                },
                directions: [],
              },
            ],
          },
        ],
      };

      const prettyPrinted = prettyPrint(ast);
      expect(prettyPrinted).toContain("## title: The Adventures of {hero}");
      expect(prettyPrinted).toContain("## var hero: a brave {hero}");
      expect(prettyPrinted).toContain(
        "## description: The main act starring {hero}",
      );
      expect(prettyPrinted).toContain(
        "## description: Where {hero} begins the journey",
      );
    });

    it("should handle template strings with only text segments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_property", value: "title" },
              {
                type: "template_string",
                value: [
                  {
                    type: "template_string_segment",
                    value: "Plain text title",
                  },
                ],
              },
            ],
          },
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

      expect(ast.title).toBeDefined();
      expect(ast.title?.type).toBe("template_string");
      expect(ast.title?.value).toHaveLength(1);
      expect(ast.title?.value[0]).toEqual({
        type: "template_string_segment",
        value: "Plain text title",
      });

      const prettyPrinted = prettyPrint(ast);
      expect(prettyPrinted).toContain("## title: Plain text title");
    });

    it("should handle template strings with only variable segments", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "doc_comment",
            value: [
              { type: "doc_comment_var", value: "name" },
              {
                type: "template_string",
                value: [{ type: "template_var_segment", value: "name" }],
              },
            ],
          },
          {
            type: "block",
            postfixed: { type: "var", value: "Main" },
            value: [],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      expect(ast.varDeclarations.size).toBe(1);
      const nameDescription = ast.varDeclarations.get("name");
      expect(nameDescription).toBeDefined();
      expect(nameDescription?.type).toBe("template_string");
      expect(nameDescription?.value).toHaveLength(1);
      expect(nameDescription?.value[0]).toEqual({
        type: "template_var_segment",
        value: "name",
      });

      const prettyPrinted = prettyPrint(ast);
      expect(prettyPrinted).toContain("## var name: {name}");
    });
  });
});

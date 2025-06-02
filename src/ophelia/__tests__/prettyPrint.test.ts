import { prettyPrint } from "../index";
import * as OpheliaAst from "../ast";

describe("Ophelia Pretty Printer", () => {
  describe("basic program structure", () => {
    it("should print a simple program with one act and scene", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
  }
}`);
    });

    it("should print multiple acts and scenes", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [],
              },
              {
                type: "scene",
                sceneId: "End",
                directions: [],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
  }

  End {
  }
}`);
    });
  });

  describe("stage directions", () => {
    it("should print stage directions with one character", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: null,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    stage(a)
  }
}`);
    });

    it("should print stage directions with two characters", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: "b",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    stage(a, b)
  }
}`);
    });

    it("should print unstage directions", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "unstage",
                    varId1: "a",
                    varId2: "b",
                  },
                  {
                    type: "unstage_all",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    unstage(a, b)

    unstage_all
  }
}`);
    });
  });

  describe("dialogue blocks", () => {
    it("should print simple dialogue with basic statements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "b",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 72 },
                      },
                      {
                        type: ".print_char",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    b {
      @you.set(72)
      @you.print_char
    }
  }
}`);
    });

    it("should print multiple dialogue blocks", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: "b",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "char", value: "H" },
                      },
                      {
                        type: ".print_char",
                      },
                    ],
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "b",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "char", value: "i" },
                      },
                      {
                        type: ".print_char",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    stage(a, b)

    a {
      @you.set('H')
      @you.print_char
    }

    b {
      @you.set('i')
      @you.print_char
    }
  }
}`);
    });
  });

  describe("expressions", () => {
    it("should print arithmetic expressions", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "b",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "you" },
                          op: "+",
                          right: { type: "int", value: 1 },
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

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    b {
      @you.set(@you + 1)
    }
  }
}`);
    });

    it("should print complex arithmetic expressions", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "n",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: {
                            type: "arithmetic",
                            left: { type: "you" },
                            op: "%",
                            right: { type: "int", value: 15 },
                          },
                          op: "*",
                          right: { type: "var", id: "count" },
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

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    n {
      @you.set(@you % 15 * count)
    }
  }
}`);
    });

    it("should print variables and @you", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "speaker",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "var", id: "stack" },
                      },
                      {
                        type: ".set",
                        value: { type: "you" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    speaker {
      @you.set(stack)
      @you.set(@you)
    }
  }
}`);
    });
  });

  describe("statements", () => {
    it("should print all I/O statements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "io",
                    lines: [
                      { type: ".print_char" },
                      { type: ".print_int" },
                      { type: ".read_char" },
                      { type: ".read_int" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    io {
      @you.print_char
      @you.print_int
      @you.read_char
      @you.read_int
    }
  }
}`);
    });

    it("should print stack operations", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "stack",
                    lines: [
                      { type: ".push_self" },
                      { type: ".push_me" },
                      { type: ".pop" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    stack {
      @you.push_self
      @you.push
      @you.pop
    }
  }
}`);
    });

    it("should print test statements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "tester",
                    lines: [
                      {
                        type: "test_eq",
                        left: { type: "you" },
                        right: { type: "int", value: 0 },
                      },
                      {
                        type: "test_gt",
                        left: { type: "var", id: "a" },
                        right: { type: "int", value: 100 },
                      },
                      {
                        type: "test_not_lt",
                        left: { type: "char", value: "x" },
                        right: { type: "you" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    tester {
      test_eq(@you, 0)
      test_gt(a, 100)
      test_not_lt('x', @you)
    }
  }
}`);
    });

    it("should print if statements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "controller",
                    lines: [
                      {
                        type: "if",
                        is: true,
                        then: {
                          type: "goto",
                          labelId: "End",
                        },
                      },
                      {
                        type: "if",
                        is: false,
                        then: {
                          type: ".print_char",
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

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    controller {
      if_true(goto(End))
      if_false(@you.print_char)
    }
  }
}`);
    });

    it("should print goto statements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "jumper",
                    lines: [
                      {
                        type: "goto",
                        labelId: "Loop",
                      },
                      {
                        type: "goto",
                        labelId: "End",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    jumper {
      goto(Loop)
      goto(End)
    }
  }
}`);
    });
  });

  describe("complete examples", () => {
    it("should print a hello world program", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "PrintHi",
                directions: [
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: "b",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "b",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 72 },
                      },
                      {
                        type: ".print_char",
                      },
                    ],
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "b",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "you" },
                          op: "+",
                          right: { type: "int", value: 1 },
                        },
                      },
                      {
                        type: ".print_char",
                      },
                    ],
                  },
                  {
                    type: "unstage_all",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  PrintHi {
    stage(a, b)

    b {
      @you.set(72)
      @you.print_char
    }

    b {
      @you.set(@you + 1)
      @you.print_char
    }

    unstage_all
  }
}`);
    });

    it("should print a fizzbuzz-like program structure", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "n",
                    varId2: "out",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "out",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 0 },
                      },
                    ],
                  },
                ],
              },
              {
                type: "scene",
                sceneId: "Loop",
                directions: [
                  {
                    type: "dialogue",
                    speakerVarId: "out",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "you" },
                          op: "+",
                          right: { type: "int", value: 1 },
                        },
                      },
                      {
                        type: "test_gt",
                        left: { type: "you" },
                        right: { type: "int", value: 100 },
                      },
                      {
                        type: "if",
                        is: true,
                        then: {
                          type: "goto",
                          labelId: "End",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: "scene",
                sceneId: "End",
                directions: [
                  {
                    type: "unstage_all",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
    stage(n, out)

    out {
      @you.set(0)
    }
  }

  Loop {
    out {
      @you.set(@you + 1)
      test_gt(@you, 100)
      if_true(goto(End))
    }
  }

  End {
    unstage_all
  }
}`);
    });
  });

  describe("title doc comment", () => {
    it("should print title doc comment with two hashes", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        title: "My Awesome Program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`## title: My Awesome Program
Main {
  Start {
  }
}`);
    });

    it("should work without title", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`Main {
  Start {
  }
}`);
    });

    it("should print title and preserve other elements", () => {
      const ast: OpheliaAst.Program = {
        type: "program",
        title: "FizzBuzz Implementation",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "n",
                    varId2: "out",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "n",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 1 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = prettyPrint(ast);
      expect(result).toBe(`## title: FizzBuzz Implementation
Main {
  Start {
    stage(n, out)

    n {
      @you.set(1)
    }
  }
}`);
    });
  });
});

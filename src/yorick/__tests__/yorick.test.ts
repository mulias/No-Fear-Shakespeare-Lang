import { Yorick } from "../index";
import * as OpheliaAst from "../../ophelia/ast";
import * as Ast from "../../horatio/ast";
import { templateString } from "../../test-helpers";

describe("Yorick Transpiler", () => {
  describe("comment handling", () => {
    it("should ignore comments when generating SPL AST", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                    type: "comment",
                    content: "This comment should be ignored",
                  },
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: "b",
                  },
                  {
                    type: "comment",
                    content: "Another comment to ignore",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 42 },
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      // Should have 1 part (act)
      expect(ast.parts).toHaveLength(1);
      const part = ast.parts[0];

      // Should have 1 subpart (scene)
      expect(part?.subparts).toHaveLength(1);
      const subpart = part?.subparts[0];

      // Stage should only have 3 directions (stage, dialogue, unstage_all - no comments)
      expect(subpart?.stage.directions).toHaveLength(3);
    });
  });

  describe("basic program structure", () => {
    it("should generate a program with title and declarations", () => {
      const opheliaAst: OpheliaAst.Program = {
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast).toBeInstanceOf(Ast.Program);
      expect(ast.comment).toBeInstanceOf(Ast.Comment);
      expect(ast.comment.sequence).toMatch(/^The \w+ \w+ \w+$/); // e.g., "The beautiful wonderful rose" (no characters)
      expect(ast.declarations).toEqual([]);
      expect(ast.parts).toHaveLength(1);
    });

    it("should use provided title instead of generating one", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("To Fizz, Perchance To Buzz"),
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast).toBeInstanceOf(Ast.Program);
      expect(ast.comment).toBeInstanceOf(Ast.Comment);
      expect(ast.comment.sequence).toBe("To Fizz, Perchance To Buzz");
      expect(ast.declarations).toHaveLength(2);
      expect(ast.parts).toHaveLength(1);
    });

    it("should generate title with character name when no custom title is provided", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                    varId1: "hero",
                    varId2: null,
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.comment.sequence).toMatch(/^\w+ and the \w+ \w+$/); // e.g., "Romeo and the beautiful rose"
    });

    it("should use provided description for acts", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            description: templateString("The grand opening act"),
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.parts[0]?.comment.sequence).toBe("The grand opening act");
    });

    it("should use provided description for scenes", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                description: templateString("Where it all begins"),
                directions: [],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.parts[0]?.subparts[0]?.comment.sequence).toBe(
        "Where it all begins",
      );
    });

    it("should fall back to auto-generated descriptions when not provided", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "MainAct",
            items: [
              {
                type: "scene",
                sceneId: "OpeningScene",
                directions: [],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      // Should convert camelCase to sentence case
      expect(ast.parts[0]?.comment.sequence).toBe("Main act");
      expect(ast.parts[0]?.subparts[0]?.comment.sequence).toBe("Opening scene");
    });

    it("should handle both act and scene descriptions together", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            description: templateString("The main storyline"),
            items: [
              {
                type: "scene",
                sceneId: "Start",
                description: templateString("Setting the stage"),
                directions: [
                  {
                    type: "stage",
                    varId1: "a",
                    varId2: null,
                  },
                ],
              },
              {
                type: "scene",
                sceneId: "End",
                description: templateString("The grand finale"),
                directions: [],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.parts[0]?.comment.sequence).toBe("The main storyline");
      expect(ast.parts[0]?.subparts[0]?.comment.sequence).toBe(
        "Setting the stage",
      );
      expect(ast.parts[0]?.subparts[1]?.comment.sequence).toBe(
        "The grand finale",
      );
    });

    it("should generate character declarations for variables", () => {
      const opheliaAst: OpheliaAst.Program = {
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.declarations).toHaveLength(2);

      const decl1 = ast.declarations[0]!;
      expect(decl1).toBeInstanceOf(Ast.Declaration);
      expect(decl1.character).toBeInstanceOf(Ast.Character);
      expect(decl1.comment).toBeInstanceOf(Ast.Comment);
      expect(decl1.comment.sequence).toBe("the a variable");

      const decl2 = ast.declarations[1]!;
      expect(decl2.comment.sequence).toBe("the b variable");
    });
  });

  describe("acts and scenes", () => {
    it("should convert acts to parts with roman numerals", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "FirstAct",
            items: [],
          },
          {
            type: "act",
            actId: "SecondAct",
            items: [],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.parts).toHaveLength(2);

      const part1 = ast.parts[0]!;
      expect(part1).toBeInstanceOf(Ast.Part);
      expect(part1.numeral).toBeInstanceOf(Ast.Numeral);
      expect(part1.numeral.sequence).toBe("I");
      expect(part1.comment.sequence).toBe("First act");

      const part2 = ast.parts[1]!;
      expect(part2.numeral.sequence).toBe("II");
      expect(part2.comment.sequence).toBe("Second act");
    });

    it("should convert scenes to subparts", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            items: [
              {
                type: "scene",
                sceneId: "Beginning",
                directions: [],
              },
              {
                type: "scene",
                sceneId: "Middle",
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const act = ast.parts[0]!;
      expect(act.subparts).toHaveLength(3);

      const scene1 = act.subparts[0]!;
      expect(scene1).toBeInstanceOf(Ast.Subpart);
      expect(scene1.numeral.sequence).toBe("I");
      expect(scene1.comment.sequence).toBe("Beginning");

      const scene2 = act.subparts[1]!;
      expect(scene2.numeral.sequence).toBe("II");
      expect(scene2.comment.sequence).toBe("Middle");

      const scene3 = act.subparts[2]!;
      expect(scene3.numeral.sequence).toBe("III");
      expect(scene3.comment.sequence).toBe("End");
    });
  });

  describe("stage directions", () => {
    it("should convert stage to enter", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                    varId1: "romeo",
                    varId2: null,
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const stage = ast.parts[0]?.subparts[0]?.stage;
      expect(stage?.directions).toHaveLength(1);

      const enter = stage?.directions[0] as Ast.Enter;
      expect(enter).toBeInstanceOf(Ast.Enter);
      expect(enter.character_1).toBeInstanceOf(Ast.Character);
    });

    it("should convert stage with two characters", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                    varId1: "romeo",
                    varId2: "juliet",
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const enter = ast.parts[0]?.subparts[0]?.stage.directions[0] as Ast.Enter;
      expect(enter.character_1).toBeInstanceOf(Ast.Character);
      expect(enter.character_2).toBeInstanceOf(Ast.Character);
    });

    it("should convert unstage to exit", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: null },
                  { type: "unstage", varId1: "a", varId2: null },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const events = ast.parts[0]?.subparts[0]?.stage.directions || [];
      expect(events).toHaveLength(2);

      const exit = events[1] as Ast.Exit;
      expect(exit).toBeInstanceOf(Ast.Exit);
      expect(exit.character).toBeInstanceOf(Ast.Character);
    });

    it("should convert unstage_all to exeunt", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  { type: "unstage_all" },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const events = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const exeunt = events[1] as Ast.Exeunt;
      expect(exeunt).toBeInstanceOf(Ast.Exeunt);
      expect(exeunt.character_1).toBeNull();
      expect(exeunt.character_2).toBeNull();
    });
  });

  describe("dialogue and statements", () => {
    it("should convert dialogue blocks", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "speaker", varId2: "listener" },
                  {
                    type: "dialogue",
                    speakerVarId: "speaker",
                    lines: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const events = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = events[1] as Ast.Dialogue;
      expect(dialogue).toBeInstanceOf(Ast.Dialogue);
      expect(dialogue.lines).toHaveLength(1);
      expect(dialogue.lines[0]?.character).toBeInstanceOf(Ast.Character);
    });

    it("should convert set statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 42 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;
      expect(sentence).toBeInstanceOf(Ast.AssignmentSentence);
      expect(sentence.be).toBeInstanceOf(Ast.Be);
      expect(sentence.value).toBeTruthy();
      expect(sentence.subject).toBeUndefined(); // Always acts on @you
    });

    it("should convert print_char statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.CharOutputSentence;
      expect(sentence).toBeInstanceOf(Ast.CharOutputSentence);
      expect(sentence.sequence).toBeTruthy();
      expect(sentence.subject).toBeUndefined();
    });

    it("should convert goto statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: null },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: "goto",
                        labelId: "End",
                      },
                    ],
                  },
                ],
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.GotoSentence;
      expect(sentence).toBeInstanceOf(Ast.GotoSentence);
      expect(sentence.part).toBe("scene");
      expect(sentence.numeral).toBeInstanceOf(Ast.Numeral);
      expect(sentence.numeral.sequence).toBe("II");
    });

    it("should convert test statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: "test_eq",
                        left: { type: "var", id: "b" },
                        right: { type: "int", value: 0 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.QuestionSentence;
      expect(sentence).toBeInstanceOf(Ast.QuestionSentence);
      expect(sentence.value1).toBeInstanceOf(Ast.BeComparative);
      expect(sentence.comparison).toBeInstanceOf(Ast.EqualToComparison);
      expect(sentence.value2).toBeTruthy();
    });

    it("should convert if statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: null },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
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
                directions: [],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.ResponseSentence;
      expect(sentence).toBeInstanceOf(Ast.ResponseSentence);
      expect(sentence.runIf).toBe(true);
      expect(sentence.sentence).toBeInstanceOf(Ast.GotoSentence);
    });
  });

  describe("value generation", () => {
    it("should convert positive integers to adjective chains", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 5 }, // Binary: 101 = 2^2 + 2^0
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;

      // 5 = 2^0 + 2^2 = 1 + 4
      // So we expect an ArithmeticOperationValue with addition
      const value = sentence.value as Ast.ArithmeticOperationValue;
      expect(value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      expect(value.operator.sequence).toMatch(/sum|add/i);
    });

    it("should convert zero to nothing", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 0 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;
      const value = sentence.value as Ast.ZeroValue;
      expect(value).toBeInstanceOf(Ast.ZeroValue);
      expect(value.sequence).toMatch(/nothing|zero/i);
    });

    it("should convert negative integers", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: -3 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;

      // -3 should use negative adjectives/nouns
      const value = sentence.value;
      expect(value).toBeTruthy();
    });

    it("should convert character literals to ASCII values", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "char", value: "A" }, // ASCII 65
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;

      // 'A' = 65 = 64 + 1 = 2^6 + 2^0
      expect(sentence.value).toBeTruthy();
    });

    it("should convert arithmetic expressions", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          op: "+",
                          left: { type: "var", id: "a" },
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.AssignmentSentence;
      const value = sentence.value as Ast.ArithmeticOperationValue;
      expect(value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      expect(value.operator.sequence).toMatch(/sum|add/i);
      expect(value.value_1).toBeInstanceOf(Ast.PronounValue);
      expect(value.value_2).toBeTruthy();
    });
  });

  describe("stack operations", () => {
    it("should convert push_self statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".push_self",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.RememberSentence;
      expect(sentence).toBeInstanceOf(Ast.RememberSentence);
      expect(sentence.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);
      expect(sentence.subject).toBeUndefined();
    });

    it("should convert push_me statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".push_me",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.RememberSentence;
      expect(sentence).toBeInstanceOf(Ast.RememberSentence);
      expect(sentence.pronoun).toBeInstanceOf(Ast.FirstPersonPronoun);
      expect(sentence.subject).toBeInstanceOf(Ast.Character);
      expect(sentence.subject?.sequence).toBeTruthy();
    });

    it("should convert pop statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".pop",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.RecallSentence;
      expect(sentence).toBeInstanceOf(Ast.RecallSentence);
      expect(sentence.comment).toBeInstanceOf(Ast.Comment);
      expect(sentence.subject).toBeUndefined();
    });
  });

  describe("I/O operations", () => {
    it("should convert read_char statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".read_char",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]?.sentences[0] as Ast.CharInputSentence;
      expect(sentence).toBeInstanceOf(Ast.CharInputSentence);
      expect(sentence.sequence).toBeTruthy();
      expect(sentence.subject).toBeUndefined();
    });

    it("should convert print_int statements", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".print_int",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const dialogue = ast.parts[0]?.subparts[0]?.stage
        .directions[1] as Ast.Dialogue;
      const sentence = dialogue.lines[0]
        ?.sentences[0] as Ast.IntegerOutputSentence;
      expect(sentence).toBeInstanceOf(Ast.IntegerOutputSentence);
      expect(sentence.sequence).toBeTruthy();
      expect(sentence.subject).toBeUndefined();
    });
  });

  describe("comparisons", () => {
    it("should convert different test types to appropriate comparisons", () => {
      const testCases: Array<[OpheliaAst.Test["type"], string]> = [
        ["test_eq", "EqualToComparison"],
        ["test_gt", "GreaterThanComparison"],
        ["test_lt", "LesserThanComparison"],
        ["test_not_eq", "InverseComparison"],
        ["test_not_gt", "InverseComparison"],
        ["test_not_lt", "InverseComparison"],
      ];

      testCases.forEach(([testType, expectedClass]) => {
        const opheliaAst: OpheliaAst.Program = {
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
                    { type: "stage", varId1: "a", varId2: "b" },
                    {
                      type: "dialogue",
                      speakerVarId: "a",
                      lines: [
                        {
                          type: testType,
                          left: { type: "var", id: "b" },
                          right: { type: "int", value: 0 },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const yorick = new Yorick(opheliaAst);
        const ast = yorick.run();

        const dialogue = ast.parts[0]?.subparts[0]?.stage
          .directions[1] as Ast.Dialogue;
        const sentence = dialogue.lines[0]
          ?.sentences[0] as Ast.QuestionSentence;
        expect(sentence.comparison.constructor.name).toBe(expectedClass);
      });
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid character in char literal", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: null },
                  {
                    type: "dialogue",
                    speakerVarId: "a",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "char", value: "" }, // Empty string
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      expect(() => yorick.run()).toThrow(/not a valid ascii character/);
    });
  });

  describe("character assignment", () => {
    it("should assign unique Shakespeare characters to variables", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                  { type: "stage", varId1: "a", varId2: "b" },
                  { type: "stage", varId1: "c", varId2: null },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const charNames = ast.declarations.map((d) => d.character.sequence);
      expect(charNames).toHaveLength(3);
      expect(new Set(charNames).size).toBe(3); // All unique

      // Check that they're actual Shakespeare character names
      charNames.forEach((name) => {
        expect(name).toMatch(/^[A-Z][a-zA-Z\s]+$/); // Capitalized names, can have spaces
      });
    });
  });

  describe("camelCase conversion", () => {
    it("should convert camelCase labels to sentence case", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "MyFirstAct",
            items: [
              {
                type: "scene",
                sceneId: "TheBeginningScene",
                directions: [],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.parts[0]?.comment.sequence).toBe("My first act");
      expect(ast.parts[0]?.subparts[0]?.comment.sequence).toBe(
        "The beginning scene",
      );
    });
  });

  describe("var declarations", () => {
    it("should use var descriptions from declarations", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map([
          ["stack", templateString("a stacky gentleperson")],
          ["count", templateString("who counts the memories")],
        ]),
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
                    varId1: "stack",
                    varId2: "count",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "stack",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 42 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.declarations).toHaveLength(2);

      // Find the declarations by their description
      const stackDecl = ast.declarations.find(
        (d) => d.comment.sequence === "a stacky gentleperson",
      );
      const countDecl = ast.declarations.find(
        (d) => d.comment.sequence === "who counts the memories",
      );

      expect(stackDecl?.comment.sequence).toBe("a stacky gentleperson");
      expect(countDecl?.comment.sequence).toBe("who counts the memories");
    });

    it("should fall back to default descriptions for undeclared vars", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map([
          ["stack", templateString("a stacky gentleperson")],
        ]),
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
                    varId1: "stack",
                    varId2: "undeclared",
                  },
                  {
                    type: "dialogue",
                    speakerVarId: "stack",
                    lines: [
                      {
                        type: ".set",
                        value: { type: "int", value: 42 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.declarations).toHaveLength(2);

      // Find the declarations by their description
      const stackDecl = ast.declarations.find(
        (d) => d.comment.sequence === "a stacky gentleperson",
      );
      const undeclaredDecl = ast.declarations.find(
        (d) => d.comment.sequence === "the undeclared variable",
      );

      expect(stackDecl?.comment.sequence).toBe("a stacky gentleperson");
      expect(undeclaredDecl?.comment.sequence).toBe("the undeclared variable");
    });

    it("should work when no vars are declared", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                        value: { type: "int", value: 42 },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.declarations).toHaveLength(2);

      // Find the declarations by their description
      const aDecl = ast.declarations.find(
        (d) => d.comment.sequence === "the a variable",
      );
      const bDecl = ast.declarations.find(
        (d) => d.comment.sequence === "the b variable",
      );

      expect(aDecl?.comment.sequence).toBe("the a variable");
      expect(bDecl?.comment.sequence).toBe("the b variable");
    });
  });

  describe("template string support", () => {
    it("should convert template strings in var declarations to actual character names", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map([
          [
            "hero",
            {
              type: "template_string",
              value: [
                { type: "template_string_segment", value: "a brave " },
                { type: "template_var_segment", value: "hero" },
                { type: "template_string_segment", value: " named " },
                { type: "template_var_segment", value: "hero" },
              ],
            },
          ],
          [
            "villain",
            {
              type: "template_string",
              value: [
                { type: "template_string_segment", value: "the evil " },
                { type: "template_var_segment", value: "villain" },
              ],
            },
          ],
        ]),
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
                    varId1: "hero",
                    varId2: "villain",
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.declarations).toHaveLength(2);

      // The declarations should contain the character names, not the template vars
      const heroDecl = ast.declarations[0];
      const villainDecl = ast.declarations[1];

      // Should contain actual character names, not {hero} or {villain}
      expect(heroDecl?.comment.sequence).toContain("a brave ");
      expect(heroDecl?.comment.sequence).toContain(" named ");
      expect(heroDecl?.comment.sequence).not.toContain("{hero}");

      expect(villainDecl?.comment.sequence).toContain("the evil ");
      expect(villainDecl?.comment.sequence).not.toContain("{villain}");

      // The character names should be actual Shakespeare characters
      const heroCharacterName = heroDecl?.character.sequence;
      const villainCharacterName = villainDecl?.character.sequence;

      expect(heroCharacterName).toMatch(/^[A-Z][a-zA-Z\s]+$/);
      expect(villainCharacterName).toMatch(/^[A-Z][a-zA-Z\s]+$/);
      expect(heroCharacterName).not.toBe(villainCharacterName);

      // The template should be replaced with the actual character names
      expect(heroDecl?.comment.sequence).toContain(heroCharacterName || "");
      expect(villainDecl?.comment.sequence).toContain(
        villainCharacterName || "",
      );
    });

    it("should convert template strings in title", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: {
          type: "template_string",
          value: [
            { type: "template_string_segment", value: "The Adventures of " },
            { type: "template_var_segment", value: "hero" },
            { type: "template_string_segment", value: " and " },
            { type: "template_var_segment", value: "sidekick" },
          ],
        },
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
                    varId1: "hero",
                    varId2: "sidekick",
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      // The title should contain actual character names
      expect(ast.comment.sequence).toContain("The Adventures of ");
      expect(ast.comment.sequence).toContain(" and ");
      expect(ast.comment.sequence).not.toContain("{hero}");
      expect(ast.comment.sequence).not.toContain("{sidekick}");

      // Extract the character names from declarations to verify they match
      const heroCharacterName = ast.declarations.find(
        (d) => d.comment.sequence === "the hero variable",
      )?.character.sequence;
      const sidekickCharacterName = ast.declarations.find(
        (d) => d.comment.sequence === "the sidekick variable",
      )?.character.sequence;

      expect(ast.comment.sequence).toContain(heroCharacterName || "");
      expect(ast.comment.sequence).toContain(sidekickCharacterName || "");
    });

    it("should convert template strings in act descriptions", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map(),
        items: [
          {
            type: "act",
            actId: "Main",
            description: {
              type: "template_string",
              value: [
                { type: "template_string_segment", value: "Where " },
                { type: "template_var_segment", value: "protagonist" },
                {
                  type: "template_string_segment",
                  value: " faces great challenges",
                },
              ],
            },
            items: [
              {
                type: "scene",
                sceneId: "Start",
                directions: [
                  {
                    type: "stage",
                    varId1: "protagonist",
                    varId2: null,
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const actDescription = ast.parts[0]?.comment.sequence;
      expect(actDescription).toContain("Where ");
      expect(actDescription).toContain(" faces great challenges");
      expect(actDescription).not.toContain("{protagonist}");

      // Should contain the actual character name
      const protagonistCharacterName = ast.declarations[0]?.character.sequence;
      expect(actDescription).toContain(protagonistCharacterName || "");
    });

    it("should convert template strings in scene descriptions", () => {
      const opheliaAst: OpheliaAst.Program = {
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
                description: {
                  type: "template_string",
                  value: [
                    {
                      type: "template_string_segment",
                      value: "The scene where ",
                    },
                    { type: "template_var_segment", value: "player1" },
                    { type: "template_string_segment", value: " meets " },
                    { type: "template_var_segment", value: "player2" },
                  ],
                },
                directions: [
                  {
                    type: "stage",
                    varId1: "player1",
                    varId2: "player2",
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const sceneDescription = ast.parts[0]?.subparts[0]?.comment.sequence;
      expect(sceneDescription).toContain("The scene where ");
      expect(sceneDescription).toContain(" meets ");
      expect(sceneDescription).not.toContain("{player1}");
      expect(sceneDescription).not.toContain("{player2}");

      // Should contain actual character names
      const player1CharacterName = ast.declarations[0]?.character.sequence;
      const player2CharacterName = ast.declarations[1]?.character.sequence;
      expect(sceneDescription).toContain(player1CharacterName || "");
      expect(sceneDescription).toContain(player2CharacterName || "");
    });

    it("should handle template strings with only text segments", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: {
          type: "template_string",
          value: [
            { type: "template_string_segment", value: "Plain Text Title" },
          ],
        },
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

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      expect(ast.comment.sequence).toBe("Plain Text Title");
    });

    it("should handle template strings with only variable segments", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        varDeclarations: new Map([
          [
            "name",
            {
              type: "template_string",
              value: [{ type: "template_var_segment", value: "name" }],
            },
          ],
        ]),
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
                    varId1: "name",
                    varId2: null,
                  },
                ],
              },
            ],
          },
        ],
      };

      const yorick = new Yorick(opheliaAst);
      const ast = yorick.run();

      const nameDecl = ast.declarations[0];
      const characterName = nameDecl?.character.sequence;

      // The description should just be the character name
      expect(nameDecl?.comment.sequence).toBe(characterName);
      expect(nameDecl?.comment.sequence).not.toContain("{name}");
    });
  });
});

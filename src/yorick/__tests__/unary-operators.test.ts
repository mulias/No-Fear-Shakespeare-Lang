import { Yorick } from "../index";
import * as OpheliaAst from "../../ophelia/ast";
import * as HoratioAst from "../../horatio/ast";

describe("Yorick Unary Operators", () => {
  describe("square operator", () => {
    it("should convert square() to 'the square of'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: {
          type: "template_string",
          value: [{ type: "template_string_segment", value: "Unary Test" }],
        },
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "unary",
                          op: "square",
                          operand: { type: "var", id: "y" },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      // Find the assignment sentence
      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("square of");
    });
  });

  describe("cube operator", () => {
    it("should convert cube() to 'the cube of'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "unary",
                          op: "cube",
                          operand: { type: "int", value: 3 },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("cube of");
    });
  });

  describe("square_root operator", () => {
    it("should convert square_root() to 'the square root of'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "unary",
                          op: "square_root",
                          operand: { type: "you" },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("square root of");
    });
  });

  describe("factorial operator", () => {
    it("should convert factorial() to 'the factorial of'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "y",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "unary",
                          op: "factorial",
                          operand: {
                            type: "arithmetic",
                            left: { type: "int", value: 3 },
                            op: "+",
                            right: { type: "int", value: 2 },
                          },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("factorial of");
      expect(value.value).toBeInstanceOf(HoratioAst.ArithmeticOperationValue);
    });
  });

  describe("twice operator", () => {
    it("should convert '2 * X' to 'twice X'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "int", value: 2 },
                          op: "*",
                          right: { type: "var", id: "y" },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      // Find the assignment sentence
      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("twice");
      expect(value.value).toBeInstanceOf(HoratioAst.CharacterValue);
    });

    it("should convert '2 * complex_expr' to 'twice complex_expr'", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "int", value: 2 },
                          op: "*",
                          right: {
                            type: "arithmetic",
                            left: { type: "var", id: "x" },
                            op: "+",
                            right: { type: "int", value: 3 },
                          },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("twice");
      expect(value.value).toBeInstanceOf(HoratioAst.ArithmeticOperationValue);
    });

    it("should NOT convert 'X * 2' to 'twice X' (order matters)", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "arithmetic",
                          left: { type: "var", id: "y" },
                          op: "*",
                          right: { type: "int", value: 2 },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value;

      // Should remain as arithmetic, not converted to unary
      expect(value).toBeInstanceOf(HoratioAst.ArithmeticOperationValue);
      const arithValue = value as HoratioAst.ArithmeticOperationValue;
      expect(arithValue.operator.sequence).toBe("product of");
    });
  });

  describe("nested unary operations", () => {
    it("should handle nested unary operations correctly", () => {
      const varDeclarations = new Map<string, OpheliaAst.TemplateString>([
        [
          "x",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "a variable" }],
          },
        ],
        [
          "y",
          {
            type: "template_string",
            value: [
              { type: "template_string_segment", value: "another variable" },
            ],
          },
        ],
      ]);

      const program: OpheliaAst.Program = {
        type: "program",
        title: undefined,
        varDeclarations,
        items: [
          {
            type: "act",
            actId: "Act1",
            description: undefined,
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                description: undefined,
                directions: [
                  { type: "stage", varId1: "x", varId2: "y" },
                  {
                    type: "dialogue",
                    speakerVarId: "x",
                    lines: [
                      {
                        type: ".set",
                        value: {
                          type: "unary",
                          op: "square",
                          operand: {
                            type: "unary",
                            op: "square_root",
                            operand: { type: "var", id: "x" },
                          },
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

      const yorick = new Yorick(program);
      const splAst = yorick.run();

      const act = splAst.parts[0];
      const scene = act?.subparts[0];
      const stage = scene?.stage;
      const dialogue = stage?.directions.find(
        (d) => d instanceof HoratioAst.Dialogue,
      ) as HoratioAst.Dialogue;
      const line = dialogue?.lines[0];
      const assignment = line?.sentences[0] as HoratioAst.AssignmentSentence;
      const value = assignment?.value as HoratioAst.UnaryOperationValue;

      expect(value).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(value.operator.sequence).toBe("square of");

      const innerValue = value.value as HoratioAst.UnaryOperationValue;
      expect(innerValue).toBeInstanceOf(HoratioAst.UnaryOperationValue);
      expect(innerValue.operator.sequence).toBe("square root of");
    });
  });
});

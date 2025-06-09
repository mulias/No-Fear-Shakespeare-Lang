import * as OpheliaAst from "../../ophelia/ast";
import { Yorick } from "..";
import * as Ast from "../../horatio/ast";

describe("Blank line preservation", () => {
  it("should preserve followedByBlankLine from Ophelia statements to Horatio sentences", () => {
    const program: OpheliaAst.Program = {
      type: "program",
      varDeclarations: new Map([
        [
          "romeo",
          {
            type: "template_string",
            value: [
              {
                type: "template_string_segment",
                value: "young man with a crush on Juliet",
              },
            ],
          },
        ],
        [
          "juliet",
          {
            type: "template_string",
            value: [
              {
                type: "template_string_segment",
                value: "a lady with a rod of iron in her soul",
              },
            ],
          },
        ],
      ]),
      items: [
        {
          type: "act",
          actId: "Act1",
          items: [
            {
              type: "scene",
              sceneId: "Scene1",
              directions: [
                {
                  type: "stage",
                  varIds: ["romeo", "juliet"],
                },
                {
                  type: "dialogue",
                  speakerVarId: "romeo",
                  lines: [
                    {
                      type: ".set",
                      value: { type: "int", value: 5 },
                      followedByBlankLine: true,
                    },
                    {
                      type: ".print_int",
                      followedByBlankLine: false,
                    },
                    {
                      type: ".print_char",
                      followedByBlankLine: true,
                    },
                    {
                      type: "test_eq",
                      left: { type: "you" },
                      right: { type: "int", value: 10 },
                      followedByBlankLine: true,
                    },
                    {
                      type: "goto",
                      labelId: "Scene1",
                      followedByBlankLine: false,
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
    const result = yorick.run();

    // Get the dialogue from the result
    const act = result.parts[0]!;
    const scene = act.subparts[0]!;
    const stage = scene.stage;
    const dialogue = stage.directions.find(
      (d) => d instanceof Ast.Dialogue,
    ) as Ast.Dialogue;
    const sentences = dialogue.lines[0]!.sentences;

    // Check that followedByBlankLine is preserved for each sentence type
    expect(sentences[0]).toBeInstanceOf(Ast.AssignmentSentence);
    expect((sentences[0] as Ast.AssignmentSentence).followedByBlankLine).toBe(
      true,
    );

    expect(sentences[1]).toBeInstanceOf(Ast.IntegerOutputSentence);
    expect(
      (sentences[1] as Ast.IntegerOutputSentence).followedByBlankLine,
    ).toBe(false);

    expect(sentences[2]).toBeInstanceOf(Ast.CharOutputSentence);
    expect((sentences[2] as Ast.CharOutputSentence).followedByBlankLine).toBe(
      true,
    );

    expect(sentences[3]).toBeInstanceOf(Ast.QuestionSentence);
    expect((sentences[3] as Ast.QuestionSentence).followedByBlankLine).toBe(
      true,
    );

    expect(sentences[4]).toBeInstanceOf(Ast.GotoSentence);
    expect((sentences[4] as Ast.GotoSentence).followedByBlankLine).toBe(false);
  });

  it("should preserve followedByBlankLine for other statement types", () => {
    const program: OpheliaAst.Program = {
      type: "program",
      varDeclarations: new Map([
        [
          "romeo",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "young Romeo" }],
          },
        ],
        [
          "juliet",
          {
            type: "template_string",
            value: [{ type: "template_string_segment", value: "sweet Juliet" }],
          },
        ],
      ]),
      items: [
        {
          type: "act",
          actId: "Act1",
          items: [
            {
              type: "scene",
              sceneId: "Scene1",
              directions: [
                {
                  type: "stage",
                  varIds: ["romeo", "juliet"],
                },
                {
                  type: "dialogue",
                  speakerVarId: "romeo",
                  lines: [
                    {
                      type: ".read_char",
                      followedByBlankLine: true,
                    },
                    {
                      type: ".read_int",
                      followedByBlankLine: false,
                    },
                    {
                      type: ".push_self",
                      followedByBlankLine: true,
                    },
                    {
                      type: ".push_me",
                      followedByBlankLine: false,
                    },
                    {
                      type: ".pop",
                      followedByBlankLine: true,
                    },
                    {
                      type: "if",
                      is: true,
                      then: {
                        type: ".print_char",
                        followedByBlankLine: false,
                      },
                      followedByBlankLine: true,
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
    const result = yorick.run();

    // Get the dialogue from the result
    const act = result.parts[0]!;
    const scene = act.subparts[0]!;
    const stage = scene.stage;
    const dialogue = stage.directions.find(
      (d) => d instanceof Ast.Dialogue,
    ) as Ast.Dialogue;
    const sentences = dialogue.lines[0]!.sentences;

    // Check that followedByBlankLine is preserved
    expect(sentences[0]).toBeInstanceOf(Ast.CharInputSentence);
    expect((sentences[0] as Ast.CharInputSentence).followedByBlankLine).toBe(
      true,
    );

    expect(sentences[1]).toBeInstanceOf(Ast.IntegerInputSentence);
    expect((sentences[1] as Ast.IntegerInputSentence).followedByBlankLine).toBe(
      false,
    );

    expect(sentences[2]).toBeInstanceOf(Ast.RememberSentence);
    expect((sentences[2] as Ast.RememberSentence).followedByBlankLine).toBe(
      true,
    );

    expect(sentences[3]).toBeInstanceOf(Ast.RememberSentence);
    expect((sentences[3] as Ast.RememberSentence).followedByBlankLine).toBe(
      false,
    );

    expect(sentences[4]).toBeInstanceOf(Ast.RecallSentence);
    expect((sentences[4] as Ast.RecallSentence).followedByBlankLine).toBe(true);

    expect(sentences[5]).toBeInstanceOf(Ast.ResponseSentence);
    expect((sentences[5] as Ast.ResponseSentence).followedByBlankLine).toBe(
      true,
    );
  });
});

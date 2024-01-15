import { Program } from "./ast";

const hi: Program = {
  type: "program",
  acts: [
    {
      type: "act",
      actId: "Main",
      scenes: [
        {
          type: "scene",
          sceneId: "PrintHi",
          directions: [
            { type: "stage", varId1: "a", varId2: "b" },
            {
              type: "dialogue",
              speakerVarId: "b",
              lines: [
                {
                  type: ".set",
                  varId: "a",
                  value: { type: "int", value: 72 },
                },
                { type: ".print_char", varId: "a" },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "b",
              lines: [
                {
                  type: ".set",
                  varId: "a",
                  value: {
                    type: "arithmetic",
                    left: { type: "var", id: "a" },
                    op: "+",
                    right: { type: "int", value: 1 },
                  },
                },
                { type: ".print_char", varId: "a" },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "a",
              lines: [
                {
                  type: ".set",
                  varId: "b",
                  value: { type: "int", value: 10 },
                },
                { type: ".print_char", varId: "b" },
              ],
            },
            { type: "unstage_all" },
          ],
        },
      ],
    },
  ],
};

export default hi;

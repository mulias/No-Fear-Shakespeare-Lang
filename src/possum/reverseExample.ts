import { Program } from "./ast";

const reverse: Program = {
  type: "program",
  acts: [
    {
      type: "act",
      actId: "Main",
      scenes: [
        {
          type: "scene",
          sceneId: "Init",
          directions: [
            { type: "stage", varId1: "stack", varId2: "count" },
            {
              type: "dialogue",
              speakerVarId: "stack",
              lines: [
                {
                  type: ".set",
                  varId: "count",
                  value: { type: "int", value: 0 },
                },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "GetInput",
          directions: [
            {
              type: "dialogue",
              speakerVarId: "count",
              lines: [
                { type: ".read_char", varId: "stack" },
                { type: ".push", varId: "stack" },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "stack",
              lines: [
                {
                  type: ".set",
                  varId: "count",
                  value: {
                    type: "arithmetic",
                    left: { type: "var", id: "count" },
                    op: "+",
                    right: { type: "int", value: 1 },
                  },
                },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "count",
              lines: [
                {
                  type: "test_eq",
                  left: { type: "var", id: "stack" },
                  right: { type: "int", value: -1 },
                },
                {
                  type: "if",
                  is: false,
                  then: { type: "goto", labelId: "GetInput" },
                },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "count",
              lines: [{ type: ".pop", varId: "stack" }],
            },
            {
              type: "dialogue",
              speakerVarId: "stack",
              lines: [
                {
                  type: ".set",
                  varId: "count",
                  value: {
                    type: "arithmetic",
                    left: { type: "var", id: "count" },
                    op: "-",
                    right: { type: "int", value: 1 },
                  },
                },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "PrintReversed",
          directions: [
            {
              type: "dialogue",
              speakerVarId: "count",
              lines: [
                { type: ".pop", varId: "stack" },
                { type: ".print_char", varId: "stack" },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "stack",
              lines: [
                {
                  type: ".set",
                  varId: "count",
                  value: {
                    type: "arithmetic",
                    left: { type: "var", id: "count" },
                    op: "-",
                    right: { type: "int", value: 1 },
                  },
                },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "count",
              lines: [
                {
                  type: "test_gt",
                  left: { type: "var", id: "count" },
                  right: { type: "int", value: 0 },
                },
                {
                  type: "if",
                  is: true,
                  then: { type: "goto", labelId: "PrintReversed" },
                },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "End",
          directions: [{ type: "unstage_all" }],
        },
      ],
    },
  ],
};

export default reverse;

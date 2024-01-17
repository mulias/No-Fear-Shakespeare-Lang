import { Program } from "./ast";

const fizzbuzz: Program = {
  type: "program",
  acts: [
    {
      type: "act",
      actId: "Main",
      scenes: [
        {
          type: "scene",
          sceneId: "Start",
          directions: [
            { type: "stage", varId1: "n", varId2: "out" },
            {
              type: "dialogue",
              speakerVarId: "out",
              lines: [
                {
                  type: ".set",
                  varId: "n",
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
                  varId: "n",
                  value: {
                    type: "arithmetic",
                    left: { type: "var", id: "n" },
                    op: "+",
                    right: { type: "int", value: 1 },
                  },
                },
                {
                  type: "test_gt",
                  left: { type: "var", id: "n" },
                  right: { type: "int", value: 100 },
                },
                {
                  type: "if",
                  is: true,
                  then: { type: "goto", labelId: "End" },
                },
                {
                  type: "test_eq",
                  left: {
                    type: "arithmetic",
                    left: { type: "var", id: "n" },
                    op: "%",
                    right: { type: "int", value: 15 },
                  },
                  right: { type: "int", value: 0 },
                },
                {
                  type: "if",
                  is: true,
                  then: { type: "goto", labelId: "Fizzbuzz" },
                },
                {
                  type: "test_eq",
                  left: {
                    type: "arithmetic",
                    left: { type: "var", id: "n" },
                    op: "%",
                    right: { type: "int", value: 3 },
                  },
                  right: { type: "int", value: 0 },
                },
                {
                  type: "if",
                  is: true,
                  then: { type: "goto", labelId: "Fizz" },
                },
                {
                  type: "test_eq",
                  left: {
                    type: "arithmetic",
                    left: { type: "var", id: "n" },
                    op: "%",
                    right: { type: "int", value: 5 },
                  },
                  right: { type: "int", value: 0 },
                },
                {
                  type: "if",
                  is: true,
                  then: { type: "goto", labelId: "Buzz" },
                },
              ],
            },
            {
              type: "dialogue",
              speakerVarId: "n",
              lines: [
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "var", id: "n" },
                },
                { type: ".print_int", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "int", value: 10 },
                },
                { type: ".print_char", varId: "out" },
                { type: "goto", labelId: "Loop" },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "Fizzbuzz",
          directions: [
            {
              type: "dialogue",
              speakerVarId: "n",
              lines: [
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "f" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "i" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "b" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "u" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "int", value: 10 },
                },
                { type: ".print_char", varId: "out" },
                { type: "goto", labelId: "Loop" },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "Fizz",
          directions: [
            {
              type: "dialogue",
              speakerVarId: "n",
              lines: [
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "f" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "i" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "int", value: 10 },
                },
                { type: ".print_char", varId: "out" },
                { type: "goto", labelId: "Loop" },
              ],
            },
          ],
        },
        {
          type: "scene",
          sceneId: "Buzz",
          directions: [
            {
              type: "dialogue",
              speakerVarId: "n",
              lines: [
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "b" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "u" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "char", value: "z" },
                },
                { type: ".print_char", varId: "out" },
                {
                  type: ".set",
                  varId: "out",
                  value: { type: "int", value: 10 },
                },
                { type: ".print_char", varId: "out" },
                { type: "goto", labelId: "Loop" },
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

export default fizzbuzz;

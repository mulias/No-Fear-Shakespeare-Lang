import { Program } from "./ast";

const hi: Program = {
  type: "program",
  nodes: [
    {
      type: "act",
      labelId: "Main",
      nodes: [
        { type: "stage", varIds: ["a"] },
        {
          type: "block",
          varId: "a",
          nodes: [
            {
              type: "assign",
              varId: "a",
              value: { type: "integer", value: 72 },
            },
            { type: "print_char", varId: "a" },
            {
              type: "assign",
              varId: "a",
              value: {
                type: "arithmetic",
                left: { type: "var", id: "a" },
                op: "+",
                right: { type: "integer", value: 1 },
              },
            },
            { type: "print_char", varId: "a" },
            {
              type: "assign",
              varId: "a",
              value: { type: "integer", value: 10 },
            },
            { type: "print_char", varId: "a" },
          ],
        },
        { type: "unstage_all" },
      ],
    },
  ],
};

export default hi;

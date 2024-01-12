import { Program } from "./ast";

const hi: Program = {
  type: "program",
  nodes: [
    {
      type: "act",
      labelId: "Main",
      nodes: [
        { type: "stage", varIds: ["a", "b"] },
        {
          type: "block",
          speakerVarId: "b",
          subjectVarId: "a",
          nodes: [
            { type: "assign", value: { type: "int", value: 72 } },
            { type: "print_char" },
            {
              type: "assign",
              value: {
                type: "arithmetic",
                left: { type: "var", id: "out" },
                op: "+",
                right: { type: "int", value: 1 },
              },
            },
            { type: "print_char" },
          ],
        },
        {
          type: "block",
          speakerVarId: "a",
          subjectVarId: "b",
          nodes: [
            { type: "assign", value: { type: "int", value: 10 } },
            { type: "print_char" },
          ],
        },
        { type: "unstage_all" },
      ],
    },
  ],
};

export default hi;
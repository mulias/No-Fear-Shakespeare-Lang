import { Ophelia } from "../index";
import * as PossumAst from "../../possum/ast";
import * as OpheliaAst from "../ast";

describe("Ophelia - Multi-variable stage/unstage", () => {
  describe("stage with multiple variables", () => {
    it("should transform stage with one variable", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [{ type: "var", value: "romeo" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const stage = scene.directions[0] as OpheliaAst.Stage;

      expect(stage.type).toBe("stage");
      expect(stage.varIds).toEqual(["romeo"]);
    });

    it("should transform stage with two variables", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "romeo" },
                      { type: "var", value: "juliet" },
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

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const stage = scene.directions[0] as OpheliaAst.Stage;

      expect(stage.type).toBe("stage");
      expect(stage.varIds).toEqual(["romeo", "juliet"]);
    });

    it("should transform stage with three variables", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "stage" },
                    value: [
                      { type: "var", value: "romeo" },
                      { type: "var", value: "juliet" },
                      { type: "var", value: "hamlet" },
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

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const stage = scene.directions[0] as OpheliaAst.Stage;

      expect(stage.type).toBe("stage");
      expect(stage.varIds).toEqual(["romeo", "juliet", "hamlet"]);
    });
  });

  describe("unstage with multiple variables", () => {
    it("should transform unstage with one variable", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "unstage" },
                    value: [{ type: "var", value: "romeo" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const unstage = scene.directions[0] as OpheliaAst.Unstage;

      expect(unstage.type).toBe("unstage");
      expect(unstage.varIds).toEqual(["romeo"]);
    });

    it("should transform unstage with two variables", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "unstage" },
                    value: [
                      { type: "var", value: "romeo" },
                      { type: "var", value: "juliet" },
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

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const unstage = scene.directions[0] as OpheliaAst.Unstage;

      expect(unstage.type).toBe("unstage");
      expect(unstage.varIds).toEqual(["romeo", "juliet"]);
    });

    it("should transform unstage with four variables", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [
                  {
                    type: "function_call",
                    postfixed: { type: "var", value: "unstage" },
                    value: [
                      { type: "var", value: "romeo" },
                      { type: "var", value: "juliet" },
                      { type: "var", value: "hamlet" },
                      { type: "var", value: "ophelia" },
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

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const unstage = scene.directions[0] as OpheliaAst.Unstage;

      expect(unstage.type).toBe("unstage");
      expect(unstage.varIds).toEqual(["romeo", "juliet", "hamlet", "ophelia"]);
    });
  });

  describe("unstage_all", () => {
    it("should transform unstage_all correctly", () => {
      const possumAst: PossumAst.Program = {
        type: "program",
        value: [
          {
            type: "block",
            postfixed: { type: "var", value: "Act1" },
            value: [
              {
                type: "block",
                postfixed: { type: "var", value: "Scene1" },
                value: [{ type: "var", value: "unstage_all" }],
              },
            ],
          },
        ],
      };

      const ophelia = new Ophelia(possumAst);
      const ast = ophelia.run();

      const act = ast.items.find(
        (item): item is OpheliaAst.Act => item.type === "act",
      ) as OpheliaAst.Act;
      const scene = act.items.find(
        (item): item is OpheliaAst.Scene => item.type === "scene",
      ) as OpheliaAst.Scene;
      const unstageAll = scene.directions[0] as OpheliaAst.UnstageAll;

      expect(unstageAll.type).toBe("unstage_all");
    });
  });
});

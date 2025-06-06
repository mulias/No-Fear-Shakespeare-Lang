import { Yorick } from "../index";
import * as OpheliaAst from "../../ophelia/ast";
import * as HoratioAst from "../../horatio/ast";
import { templateString } from "../../test-helpers";

describe("Yorick - Multi-variable stage/unstage", () => {
  const generate = (ast: OpheliaAst.Program) => {
    const yorick = new Yorick(ast);
    return yorick.run();
  };

  describe("stage with multiple variables", () => {
    it("should generate Enter for stage with one variable", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([["romeo", templateString("a young man")]]),
        items: [
          {
            type: "act",
            actId: "Act1",
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                directions: [{ type: "stage", varIds: ["romeo"] }],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      const enter = scene.stage.directions[0] as HoratioAst.Enter;

      expect(enter.constructor.name).toBe("Enter");
      expect(enter.characters).toHaveLength(1);
      expect(enter.characters[0]?.sequence).toBeDefined();
      expect(enter.characters[0]?.sequence).not.toBe(""); // Should be a valid character name
    });

    it("should generate Enter for stage with two variables", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([
          ["romeo", templateString("a young man")],
          ["juliet", templateString("a lady")],
        ]),
        items: [
          {
            type: "act",
            actId: "Act1",
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                directions: [{ type: "stage", varIds: ["romeo", "juliet"] }],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      const enter = scene.stage.directions[0] as HoratioAst.Enter;

      expect(enter.constructor.name).toBe("Enter");
      expect(enter.characters).toHaveLength(2);
      expect(enter.characters[0]?.sequence).toBeDefined();
      expect(enter.characters[1]?.sequence).toBeDefined();
    });

    it("should generate single Enter directive for more than two variables", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([
          ["romeo", templateString("a young man")],
          ["juliet", templateString("a lady")],
          ["hamlet", templateString("a prince")],
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
                  { type: "stage", varIds: ["romeo", "juliet", "hamlet"] },
                ],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;

      // Should generate a single Enter directive with all 3 characters
      const enters = scene.stage.directions.filter(
        (d) => d.constructor.name === "Enter",
      );
      expect(enters).toHaveLength(1);

      const enter = enters[0] as HoratioAst.Enter;
      expect(enter.characters).toHaveLength(3);
      expect(enter.characters[0]?.sequence).toBeDefined();
      expect(enter.characters[1]?.sequence).toBeDefined();
      expect(enter.characters[2]?.sequence).toBeDefined();
    });
  });

  describe("unstage with multiple variables", () => {
    it("should generate Exit for unstage with one variable", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([["romeo", templateString("a young man")]]),
        items: [
          {
            type: "act",
            actId: "Act1",
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                directions: [
                  { type: "stage", varIds: ["romeo"] },
                  { type: "unstage", varIds: ["romeo"] },
                ],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      const exit = scene.stage.directions[1] as HoratioAst.Exit; // Second directive is exit

      expect(exit.constructor.name).toBe("Exit");
      expect(exit.character.sequence).toBeDefined();
    });

    it("should generate Exeunt for unstage with two variables", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([
          ["romeo", templateString("a young man")],
          ["juliet", templateString("a lady")],
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
                  { type: "stage", varIds: ["romeo", "juliet"] },
                  { type: "unstage", varIds: ["romeo", "juliet"] },
                ],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      const exeunt = scene.stage.directions[1] as HoratioAst.Exeunt; // Second directive is exeunt

      expect(exeunt.constructor.name).toBe("Exeunt");
      expect(exeunt.characters).toHaveLength(2);
      expect(exeunt.characters[0]?.sequence).toBeDefined();
      expect(exeunt.characters[1]?.sequence).toBeDefined();
    });

    it("should generate Exeunt with characters array for more than two variables", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([
          ["romeo", templateString("a young man")],
          ["juliet", templateString("a lady")],
          ["hamlet", templateString("a prince")],
          ["ophelia", templateString("a lady")],
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
                    varIds: ["romeo", "juliet", "hamlet", "ophelia"],
                  },
                  {
                    type: "unstage",
                    varIds: ["romeo", "juliet", "hamlet", "ophelia"],
                  },
                ],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      // Find the Exeunt directive (should be after the Enter directives)
      const exeunt = scene.stage.directions.find(
        (d) => d.constructor.name === "Exeunt",
      ) as HoratioAst.Exeunt;

      expect(exeunt).toBeDefined();
      expect(exeunt.constructor.name).toBe("Exeunt");
      expect(exeunt.characters).toBeDefined();
      expect(exeunt.characters).toHaveLength(4);
      expect(exeunt.characters?.[0]?.sequence).toBeDefined();
      expect(exeunt.characters?.[1]?.sequence).toBeDefined();
      expect(exeunt.characters?.[2]?.sequence).toBeDefined();
      expect(exeunt.characters?.[3]?.sequence).toBeDefined();
    });
  });

  describe("unstage_all", () => {
    it("should generate Exeunt with no characters", () => {
      const opheliaAst: OpheliaAst.Program = {
        type: "program",
        title: templateString("Test"),
        varDeclarations: new Map([
          ["romeo", templateString("a young man")],
          ["juliet", templateString("a lady")],
        ]),
        items: [
          {
            type: "act",
            actId: "Act1",
            items: [
              {
                type: "scene",
                sceneId: "Scene1",
                directions: [{ type: "unstage_all" }],
              },
            ],
          },
        ],
      };

      const horatioAst = generate(opheliaAst);
      const scene = (horatioAst.parts[0] as HoratioAst.Part)
        .subparts[0] as HoratioAst.Subpart;
      const exeunt = scene.stage.directions[0] as HoratioAst.Exeunt;

      expect(exeunt.constructor.name).toBe("Exeunt");
      expect(exeunt.characters).toHaveLength(0);
    });
  });
});

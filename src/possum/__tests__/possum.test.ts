import { Possum } from "../index";
import * as PossumAst from "../ast";

describe("Possum Parser", () => {
  describe("basic expressions", () => {
    it("should parse integer literals", async () => {
      const possum = new Possum("42");
      const ast = await possum.run();

      expect(ast.type).toBe("program");
      expect(ast.value).toHaveLength(1);
      expect(ast.value[0]).toEqual({
        type: "int",
        value: 42,
      });
    });

    it("should parse character literals", async () => {
      const possum = new Possum("'a'");
      const ast = await possum.run();

      expect(ast.value).toHaveLength(1);
      expect(ast.value[0]).toEqual({
        type: "char",
        value: "a",
      });
    });

    it("should parse variable names", async () => {
      const possum = new Possum("foo");
      const ast = await possum.run();

      expect(ast.value).toHaveLength(1);
      expect(ast.value[0]).toEqual({
        type: "var",
        value: "foo",
      });
    });
  });

  describe("arithmetic operations", () => {
    it("should parse addition", async () => {
      const possum = new Possum("1 + 2");
      const ast = await possum.run();

      expect(ast.value).toHaveLength(1);
      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("add");
      expect(expr.left).toEqual({ type: "int", value: 1 });
      expect(expr.right).toEqual({ type: "int", value: 2 });
    });

    it("should parse subtraction", async () => {
      const possum = new Possum("5 - 3");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("subtract");
    });

    it("should parse multiplication", async () => {
      const possum = new Possum("4 * 5");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("multiply");
    });

    it("should parse division", async () => {
      const possum = new Possum("10 / 2");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("divide");
    });

    it("should parse modulo", async () => {
      const possum = new Possum("7 % 3");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("modulo");
    });
  });

  describe("function calls", () => {
    it("should parse function calls with no arguments", async () => {
      const possum = new Possum("foo()");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Postfix;
      expect(expr.type).toBe("function_call");
      expect(expr.postfixed).toEqual({ type: "var", value: "foo" });
      expect(expr.value).toEqual([]);
    });

    it("should parse function calls with arguments", async () => {
      const possum = new Possum("stage(a, b)");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Postfix;
      expect(expr.type).toBe("function_call");
      expect(expr.postfixed).toEqual({ type: "var", value: "stage" });
      expect(expr.value).toHaveLength(2);
      expect(expr.value[0]).toEqual({ type: "var", value: "a" });
      expect(expr.value[1]).toEqual({ type: "var", value: "b" });
    });
  });

  describe("blocks", () => {
    it("should parse labeled blocks", async () => {
      const possum = new Possum("Main { 42 }");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Postfix;
      expect(expr.type).toBe("block");
      expect(expr.postfixed).toEqual({ type: "var", value: "Main" });
      expect(expr.value).toHaveLength(1);
      expect(expr.value[0]).toEqual({ type: "int", value: 42 });
    });

    it("should parse dialogue blocks", async () => {
      const possum = new Possum("a { @you.set(1) }");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Postfix;
      expect(expr.type).toBe("block");
      expect(expr.postfixed).toEqual({ type: "var", value: "a" });
      expect(expr.value).toHaveLength(1);
    });
  });

  describe("method access", () => {
    it("should parse method access", async () => {
      const possum = new Possum("a.print_char");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("method_access");
      expect(expr.left).toEqual({ type: "var", value: "a" });
      expect(expr.right).toEqual({ type: "var", value: "print_char" });
    });

    it("should parse chained method calls", async () => {
      const possum = new Possum("a.set(5)");
      const ast = await possum.run();

      const expr = ast.value[0] as PossumAst.Infix;
      expect(expr.type).toBe("method_access");
      expect(expr.left).toEqual({ type: "var", value: "a" });

      const methodCall = expr.right as PossumAst.Postfix;
      expect(methodCall.type).toBe("function_call");
      expect(methodCall.postfixed).toEqual({ type: "var", value: "set" });
      expect(methodCall.value).toHaveLength(1);
      expect(methodCall.value[0]).toEqual({ type: "int", value: 5 });
    });
  });

  describe("error handling", () => {
    it("should produce Malformed nodes for invalid syntax", async () => {
      const possum = new Possum("Main { @#$ }");
      const ast = await possum.run();

      const block = ast.value[0] as PossumAst.Postfix;
      expect(block.type).toBe("block");
      expect(block.value).toHaveLength(1);
      expect(block.value[0]?.type).toBe("malformed");
    });

    it("should handle empty input", async () => {
      const possum = new Possum("");
      const ast = await possum.run();

      expect(ast.type).toBe("program");
      expect(ast.value).toEqual([]);
    });
  });

  describe("complex programs", () => {
    it("should parse a simple NFSPL program", async () => {
      const code = `
        Main {
          Start {
            stage(a, b)
            b {
              @you.set(72)
              @you.print_char
            }
            unstage_all
          }
        }
      `;

      const possum = new Possum(code);
      const ast = await possum.run();

      expect(ast.type).toBe("program");
      expect(ast.value).toHaveLength(1);

      const mainBlock = ast.value[0] as PossumAst.Postfix;
      expect(mainBlock.type).toBe("block");
      expect(mainBlock.postfixed).toEqual({ type: "var", value: "Main" });

      const startBlock = mainBlock.value[0] as PossumAst.Postfix;
      expect(startBlock.type).toBe("block");
      expect(startBlock.postfixed).toEqual({ type: "var", value: "Start" });
      expect(startBlock.value).toHaveLength(3); // stage, b {...}, unstage_all
    });
  });
});

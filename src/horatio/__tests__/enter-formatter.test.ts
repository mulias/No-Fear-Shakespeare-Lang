import Formatter from "../formatter";
import * as Ast from "../ast";

describe("Enter directive formatting", () => {
  let formatter: Formatter;

  beforeEach(() => {
    formatter = new Formatter();
  });

  it("should format Enter with a single character", () => {
    const enter = new Ast.Enter([new Ast.Character("Romeo")]);
    const result = enter.visit(formatter);
    expect(result).toBe("[Enter Romeo]");
  });

  it("should format Enter with two characters", () => {
    const enter = new Ast.Enter([
      new Ast.Character("Romeo"),
      new Ast.Character("Juliet"),
    ]);
    const result = enter.visit(formatter);
    expect(result).toBe("[Enter Romeo and Juliet]");
  });

  it("should format Enter with three characters", () => {
    const enter = new Ast.Enter([
      new Ast.Character("Romeo"),
      new Ast.Character("Juliet"),
      new Ast.Character("Mercutio"),
    ]);
    const result = enter.visit(formatter);
    expect(result).toBe("[Enter Romeo, Juliet and Mercutio]");
  });

  it("should format Enter with four characters", () => {
    const enter = new Ast.Enter([
      new Ast.Character("Romeo"),
      new Ast.Character("Juliet"),
      new Ast.Character("Mercutio"),
      new Ast.Character("Benvolio"),
    ]);
    const result = enter.visit(formatter);
    expect(result).toBe("[Enter Romeo, Juliet, Mercutio and Benvolio]");
  });
});

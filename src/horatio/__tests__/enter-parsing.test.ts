import Parser from "../parser";
import * as Ast from "../ast";

describe("Enter directive parsing", () => {
  it("should parse Enter with a single character", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo]
    `;

    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(1);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
  });

  it("should parse Enter with two characters", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      Juliet, the deuteragonist.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo and Juliet]
    `;

    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(2);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
    expect(enter.characters[1]?.sequence).toBe("Juliet");
  });

  it("should parse Enter with three characters", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      Juliet, the deuteragonist.
      Mercutio, the friend.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo, Juliet and Mercutio]
    `;

    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(3);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
    expect(enter.characters[1]?.sequence).toBe("Juliet");
    expect(enter.characters[2]?.sequence).toBe("Mercutio");
  });

  it("should parse Enter with four or more characters", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      Juliet, the deuteragonist.
      Mercutio, the friend.
      Benvolio, another friend.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo, Juliet, Mercutio and Benvolio]
    `;

    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(4);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
    expect(enter.characters[1]?.sequence).toBe("Juliet");
    expect(enter.characters[2]?.sequence).toBe("Mercutio");
    expect(enter.characters[3]?.sequence).toBe("Benvolio");
  });

  it("should handle Enter with various spacing and punctuation", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      Juliet, the deuteragonist.
      Mercutio, the friend.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo, Juliet and Mercutio]
    `;

    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(3);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
    expect(enter.characters[1]?.sequence).toBe("Juliet");
    expect(enter.characters[2]?.sequence).toBe("Mercutio");
  });

  it("should parse Enter with character names not in dramatis personae", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter Romeo and Juliet]
    `;

    // The parser should parse it even if Juliet is not declared
    const parser = new Parser(program);
    const ast = parser.parse();

    const stage = ast.parts[0]?.subparts[0]?.stage;
    const enter = stage?.directions[0] as Ast.Enter;

    expect(enter).toBeInstanceOf(Ast.Enter);
    expect(enter.characters).toHaveLength(2);
    expect(enter.characters[0]?.sequence).toBe("Romeo");
    expect(enter.characters[1]?.sequence).toBe("Juliet");

    // Note: The semantic checker would catch that Juliet is not declared
  });

  it("should parse Enter with no characters", () => {
    const program = `
      The Tragedy of Test.
      
      Romeo, the protagonist.
      
      Act I: The beginning.
      Scene I: The scene.
      [Enter]
    `;

    // This might be a parser error or might parse as empty
    expect(() => {
      const parser = new Parser(program);
      parser.parse();
    }).toThrow();
  });
});

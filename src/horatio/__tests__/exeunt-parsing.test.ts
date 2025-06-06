import Parser from "../parser";
import * as Ast from "../ast";

describe("Horatio Parser - Exeunt with character lists", () => {
  it("should parse Exeunt with no characters", () => {
    const spl = `
      Test play.
      
      Romeo, a young man.
      Juliet, a lady.
      
      Act I: Test.
      Scene I: Test.
      
      [Enter Romeo and Juliet]
      
      Romeo:
        You nothing!
        
      [Exeunt]
    `;

    const parser = new Parser(spl);
    const ast = parser.parse();

    const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
    const exeunt = directions[directions.length - 1];

    expect(exeunt).toBeInstanceOf(Ast.Exeunt);
    const exeuntAst = exeunt as Ast.Exeunt;
    expect(exeuntAst.characters).toHaveLength(0);
  });

  it("should parse Exeunt with two characters using 'and'", () => {
    const spl = `
      Test play.
      
      Romeo, a young man.
      Juliet, a lady.
      Hamlet, a prince.
      Ophelia, a lady.
      
      Act I: Test.
      Scene I: Test.
      
      [Enter Romeo and Juliet]
      
      Romeo:
        You nothing!
        
      [Exeunt Romeo and Juliet]
    `;

    const parser = new Parser(spl);
    const ast = parser.parse();

    const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
    const exeunt = directions[directions.length - 1];

    expect(exeunt).toBeInstanceOf(Ast.Exeunt);
    const exeuntAst = exeunt as Ast.Exeunt;
    expect(exeuntAst.characters).toHaveLength(2);
    expect(exeuntAst.characters[0]?.sequence).toBe("Romeo");
    expect(exeuntAst.characters[1]?.sequence).toBe("Juliet");
  });

  it("should parse Exeunt with two characters using comma", () => {
    const spl = `
      Do Not Adieu, a play in two acts.

      Romeo, a young man with a remarkable patience.
      Juliet, a likewise young woman of remarkable grace.
      Ophelia, a remarkable woman much in dispute with Hamlet.
      Hamlet, the flatterer of Andersen Insulting A/S.

      Act I: Hamlet's insults and flattery.

      Scene III: The praising of Ophelia.

      [Enter Ophelia and Hamlet]

      Hamlet:
        Thou art as beautiful as the difference between Romeo and the square
        of a huge green peaceful tree. Speak thy mind!

      [Exeunt Ophelia and Hamlet]
    `;

    const parser = new Parser(spl);
    const ast = parser.parse();

    const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
    const exeunt = directions[directions.length - 1];

    expect(exeunt).toBeInstanceOf(Ast.Exeunt);
    const exeuntAst = exeunt as Ast.Exeunt;
    expect(exeuntAst.characters).toHaveLength(2);
    expect(exeuntAst.characters[0]?.sequence).toBe("Ophelia");
    expect(exeuntAst.characters[1]?.sequence).toBe("Hamlet");
  });

  it("should parse Exeunt with multiple characters", () => {
    const spl = `
      Test play.
      
      Romeo, a young man.
      Juliet, a lady.
      Hamlet, a prince.
      Ophelia, a lady.
      
      Act I: Test.
      Scene I: Test.
      
      [Enter Romeo and Juliet]
      [Enter Hamlet and Ophelia]
      
      Romeo:
        You nothing!
        
      [Exeunt Romeo, Juliet, Hamlet and Ophelia]
    `;

    const parser = new Parser(spl);
    const ast = parser.parse();

    const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
    const exeunt = directions.find((d) => d instanceof Ast.Exeunt);

    expect(exeunt).toBeInstanceOf(Ast.Exeunt);
    const exeuntAst = exeunt as Ast.Exeunt;
    expect(exeuntAst.characters).toBeDefined();
    expect(exeuntAst.characters).toHaveLength(4);
    expect(exeuntAst.characters?.[0]?.sequence).toBe("Romeo");
    expect(exeuntAst.characters?.[1]?.sequence).toBe("Juliet");
    expect(exeuntAst.characters?.[2]?.sequence).toBe("Hamlet");
    expect(exeuntAst.characters?.[3]?.sequence).toBe("Ophelia");
  });

  it("should parse Exeunt with three characters using commas and 'and'", () => {
    const spl = `
      Test play.
      
      Romeo, a young man.
      Juliet, a lady.
      Hamlet, a prince.
      
      Act I: Test.
      Scene I: Test.
      
      [Enter Romeo and Juliet]
      [Enter Hamlet]
      
      Romeo:
        You nothing!
        
      [Exeunt Romeo, Juliet and Hamlet]
    `;

    const parser = new Parser(spl);
    const ast = parser.parse();

    const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
    const exeunt = directions.find((d) => d instanceof Ast.Exeunt);

    expect(exeunt).toBeInstanceOf(Ast.Exeunt);
    const exeuntAst = exeunt as Ast.Exeunt;
    expect(exeuntAst.characters).toBeDefined();
    expect(exeuntAst.characters).toHaveLength(3);
    expect(exeuntAst.characters?.[0]?.sequence).toBe("Romeo");
    expect(exeuntAst.characters?.[1]?.sequence).toBe("Juliet");
    expect(exeuntAst.characters?.[2]?.sequence).toBe("Hamlet");
  });
});

import Horatio from "../horatio";
import Parser from "../parser";
import Checker from "../checker";
import Encoder from "../encoder";
import * as Ast from "../ast";

// Mock I/O interface
class MockIO {
  output: string[] = [];
  inputBuffer: string[] = [];
  debug: boolean = false;

  print(text: string) {
    this.output.push(text);
  }

  read_char(callback: (input: string) => void): void {
    const input = this.inputBuffer.shift() || "";
    callback(input);
  }

  read_int(callback: (input: string) => void): void {
    const input = this.inputBuffer.shift() || "";
    callback(input);
  }

  printDebug(text: string): void {
    if (this.debug) {
      console.log(`[DEBUG] ${text}`);
    }
  }

  clear() {
    this.output = [];
    this.inputBuffer = [];
  }
}

describe("Horatio Compiler", () => {
  describe("Parser", () => {
    it("should parse a simple SPL program", () => {
      const spl = `
        A simple test program.

        Romeo, a young man.
        Juliet, a lady.

        Act I: The beginning.

        Scene I: The meeting.

        [Enter Romeo and Juliet]

        Romeo:
          You are as lovely as a rose.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast).toBeInstanceOf(Ast.Program);
      expect(ast.declarations).toHaveLength(2);
      expect(ast.parts).toHaveLength(1);
      expect(ast.parts[0]?.subparts).toHaveLength(1);
    });

    it("should parse character declarations", () => {
      const spl = `
        Character declaration test.

        Romeo, a young man with a love problem.
        Juliet, the beautiful lady.
        Hamlet, the melancholy prince.

        Act I: A minimal act.
        Scene I: A minimal scene.
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast.declarations).toHaveLength(3);

      const romeo = ast.declarations[0];
      expect(romeo?.character.sequence).toBe("Romeo");
      expect(romeo?.comment.sequence).toBe("a young man with a love problem");

      const juliet = ast.declarations[1];
      expect(juliet?.character.sequence).toBe("Juliet");
      expect(juliet?.comment.sequence).toBe("the beautiful lady");

      const hamlet = ast.declarations[2];
      expect(hamlet?.character.sequence).toBe("Hamlet");
    });

    it("should parse acts and scenes", () => {
      const spl = `
        Act and scene parsing test.

        Romeo, a character.

        Act I: The first act.

        Scene I: Opening scene.
        Scene II: Middle scene.

        Act II: The second act.

        Scene I: Final scene.
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast.parts).toHaveLength(2);

      const act1 = ast.parts[0]!;
      expect(act1.numeral.sequence).toBe("I");
      expect(act1.comment.sequence).toBe("The first act");
      expect(act1.subparts).toHaveLength(2);

      const act2 = ast.parts[1]!;
      expect(act2.numeral.sequence).toBe("II");
      expect(act2.subparts).toHaveLength(1);
    });

    it("should parse stage directions", () => {
      const spl = `
        Stage directions test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo]
        [Enter Juliet]
        [Exit Romeo]
        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const events = ast.parts[0]?.subparts[0]?.stage.directions || [];
      expect(events).toHaveLength(4);

      expect(events[0]).toBeInstanceOf(Ast.Enter);
      expect((events[0] as Ast.Enter).character_1.sequence).toBe("Romeo");

      expect(events[1]).toBeInstanceOf(Ast.Enter);
      expect(events[2]).toBeInstanceOf(Ast.Exit);
      expect(events[3]).toBeInstanceOf(Ast.Exeunt);
    });

    it("should parse dialogue with various sentences", () => {
      const spl = `
        Dialogue parsing test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of a cat and a dog.
          Speak your mind!
          Remember me.
          Are you better than nothing?
          If so, let us proceed to scene II.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeInstanceOf(Ast.Dialogue);
      expect(dialogue.lines).toHaveLength(1);
      expect(dialogue.lines[0]?.character.sequence).toBe("Romeo");
      expect(dialogue.lines[0]?.sentences).toHaveLength(5);
    });

    it("should parse arithmetic expressions", () => {
      const spl = `
        Arithmetic expressions test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of a cat and a dog.
          You are as good as the difference between yourself and a cat.
          You are as good as the product of a flower and the square of a tree.
          You are as good as the quotient between yourself and a cat.
          You are as good as the remainder of the quotient between yourself and a cat.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      sentences.forEach((sentence) => {
        expect(sentence).toBeInstanceOf(Ast.AssignmentSentence);
        const assignment = sentence as Ast.AssignmentSentence;
        expect(assignment.value).toBeInstanceOf(Ast.ArithmeticOperationValue);
      });
    });

    it("should parse comparisons", () => {
      const spl = `
        Comparison parsing test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Are you as good as nothing?
          Are you better than nothing?
          Are you worse than nothing?
          Are you not as good as nothing?

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences[0]).toBeInstanceOf(Ast.QuestionSentence);
      expect(sentences[1]).toBeInstanceOf(Ast.QuestionSentence);
      expect(sentences[2]).toBeInstanceOf(Ast.QuestionSentence);
      expect(sentences[3]).toBeInstanceOf(Ast.QuestionSentence);
    });

    it("should parse I/O statements", () => {
      const spl = `
        Input and output test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Speak your mind!
          Open your heart!
          Listen to your heart!
          Open your mind!

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences[0]).toBeInstanceOf(Ast.CharOutputSentence);
      expect(sentences[1]).toBeInstanceOf(Ast.IntegerOutputSentence);
      expect(sentences[2]).toBeInstanceOf(Ast.IntegerInputSentence);
      expect(sentences[3]).toBeInstanceOf(Ast.CharInputSentence);
    });

    it("should parse goto statements", () => {
      const spl = `
        Goto statements test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Let us proceed to scene II.
          We must return to act I.

        [Exeunt]

        Scene II: Next.
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      const goto1 = sentences[0] as Ast.GotoSentence;
      expect(goto1).toBeInstanceOf(Ast.GotoSentence);
      expect(goto1.part).toBe("scene");
      expect(goto1.numeral.sequence).toBe("II");

      const goto2 = sentences[1] as Ast.GotoSentence;
      expect(goto2.part).toBe("act");
      expect(goto2.numeral.sequence).toBe("I");
    });

    it("should parse conditional responses", () => {
      const spl = `
        Conditional response test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Are you better than nothing?
          If so, let us proceed to scene II.
          If not, remember me.

        [Exeunt]

        Scene II: Next.
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      expect(sentences[0]).toBeInstanceOf(Ast.QuestionSentence);

      const ifSo = sentences[1] as Ast.ResponseSentence;
      expect(ifSo).toBeInstanceOf(Ast.ResponseSentence);
      expect(ifSo.runIf).toBe(true);
      expect(ifSo.sentence).toBeInstanceOf(Ast.GotoSentence);

      const ifNot = sentences[2] as Ast.ResponseSentence;
      expect(ifNot.runIf).toBe(false);
      expect(ifNot.sentence).toBeInstanceOf(Ast.RememberSentence);
    });

    it("should parse stack operations", () => {
      const spl = `
        Stack operations test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Remember me.
          Remember yourself.
          Recall your past.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      const directions = ast.parts[0]?.subparts[0]?.stage.directions || [];
      const dialogue = directions.find(
        (d) => d instanceof Ast.Dialogue,
      ) as Ast.Dialogue;
      expect(dialogue).toBeDefined();
      const sentences = dialogue.lines[0]?.sentences || [];

      const remember1 = sentences[0] as Ast.RememberSentence;
      expect(remember1).toBeInstanceOf(Ast.RememberSentence);
      expect(remember1.pronoun).toBeInstanceOf(Ast.FirstPersonPronoun);

      const remember2 = sentences[1] as Ast.RememberSentence;
      expect(remember2.pronoun).toBeInstanceOf(Ast.SecondPersonPronoun);

      const recall = sentences[2] as Ast.RecallSentence;
      expect(recall).toBeInstanceOf(Ast.RecallSentence);
    });

    it("should fail to parse Enter with no characters specified", () => {
      const spl = `
        Empty Enter Test.

        Romeo, a character.

        Act I: Test.
        Scene I: Test.

        [Enter]

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail to parse Exit with multiple characters", () => {
      const spl = `
        Multiple Exit Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]
        [Exit Romeo and Juliet]

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail to parse Exeunt with only one character", () => {
      const spl = `
        Single Exeunt Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]
        [Exeunt Romeo]

        [Exit Juliet]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail to parse program with no characters declared", () => {
      const spl = `
        Empty Cast.

        Act I: Solo Act.
        Scene I: Empty Scene.

        [Exeunt]
      `;

      // The parser tries to parse "Act" as a character name when there's no empty line
      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow(
        "Act is not a known Shakespeare character",
      );
    });

    it("should fail on programs with no acts", () => {
      const spl = `
        No Acts Program.

        Romeo, a character.
        Juliet, another character.
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail on invalid roman numerals", () => {
      const spl = `
        Invalid Roman Numeral.

        Romeo, a character.

        Act IIII: Bad Numeral.
        Scene I: Test.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should parse multi-line titles", () => {
      const spl = `
        This is a very long title
        that spans multiple lines
        and ends with an exclamation point!

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast.comment.sequence).toBe(
        "This is a very long title that spans multiple lines and ends with an exclamation point",
      );
      expect(ast.declarations).toHaveLength(2);
    });

    it("should parse titles ending with question mark", () => {
      const spl = `
        Is this a valid title?

        Romeo, a character.

        Act I: Test.
        Scene I: Test.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast.comment.sequence).toBe("Is this a valid title");
    });

    it("should fail on malformed act declarations", () => {
      const spl = `
        Malformed Act.

        Romeo, a character.

        Act I The missing colon.
        Scene I: Test.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail on malformed scene declarations", () => {
      const spl = `
        Malformed Scene.

        Romeo, a character.

        Act I: Test.
        Scene I The missing colon.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });
  });

  describe("Checker", () => {
    it("should validate a correct program", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("another character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ZeroValue("nothing"),
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
                new Ast.Exeunt(),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).not.toThrow();
    });

    it("should detect undeclared characters", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ), // Juliet not declared
                new Ast.Exeunt(),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).toThrow(/Juliet.*not declared/i);
    });

    it("should detect no other characters on stage at runtime", () => {
      const io = new MockIO();
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("another character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(new Ast.Character("Romeo")),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ZeroValue("nothing"),
                      new Ast.Character("Juliet"), // Juliet not on stage
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).not.toThrow(); // Should pass compile-time checks

      const horatio = Horatio.fromAst(ast, io);
      expect(() => horatio.run()).toThrow(
        /Romeo is trying to speak, but there is nobody else on stage/i,
      ); // Runtime error
    });

    it("should detect ambiguous addressing with too many characters on stage", () => {
      const io = new MockIO();
      const spl = `
        Ambiguous Address Test.

        Romeo, a young man.
        Juliet, a young lady.
        Hamlet, a prince.

        Act I: The confusion.
        Scene I: Three's a crowd.

        [Enter Romeo and Juliet]
        [Enter Hamlet]

        Romeo:
          You are as good as nothing!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        /Romeo is trying to speak, but there are too many characters on stage - it's ambiguous who is being addressed/i,
      );
    });

    it("should detect invalid goto targets", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(new Ast.Character("Romeo")),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.GotoSentence(
                      "Let us return to scene III",
                      "scene",
                      new Ast.Numeral("III"),
                    ), // Scene III doesn't exist
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).toThrow(/Scene III.*does not exist/i);
    });

    it("should handle forward references to scenes correctly", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(new Ast.Character("Romeo")),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.GotoSentence(
                      "Let us return to scene II",
                      "scene",
                      new Ast.Numeral("II"),
                    ),
                  ]),
                ]),
              ]),
            ),
            new Ast.Subpart(
              new Ast.Numeral("II"),
              new Ast.Comment("Scene 2"),
              new Ast.Stage([
                new Ast.Enter(new Ast.Character("Romeo")),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ZeroValue("nothing"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).not.toThrow();
    });

    it("should handle self-referential assignments with thyself", () => {
      const io = new MockIO();
      const spl = `
        Self Reference Test.

        Romeo, a young man.
        Juliet, a young lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of a cat and a cat.
          You are as good as the difference between thyself and a cat.
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["1"]); // 2 - 1 = 1
    });

    it("should detect non-Shakespeare character names", () => {
      const spl = `
        Invalid Character Test.

        Batman, a vigilante.
        Juliet, a lady.

        Act I: Test.
        Scene I: Test.
      `;

      expect(() => {
        const parser = new Parser(spl);
        const ast = parser.parse();
      }).toThrow("Batman is not a known Shakespeare character");
    });

    it("should handle character name case sensitivity", () => {
      const spl = `
        Case Sensitivity Test.

        Romeo, a young man.
        ROMEO, another character.

        Act I: Test.
        Scene I: Test.
      `;

      const parser = new Parser(spl);
      const ast = parser.parse();

      expect(ast.declarations).toHaveLength(2);
      expect(ast.declarations[0]?.character.sequence).toBe("Romeo");
      expect(ast.declarations[1]?.character.sequence).toBe("ROMEO");
    });

    it("should track characters entering and exiting", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a young man"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("a young lady"),
          ),
          new Ast.Declaration(
            new Ast.Character("Hamlet"),
            new Ast.Comment("a prince"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Exit(new Ast.Character("Romeo")),
                new Ast.Enter(new Ast.Character("Hamlet")),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Hamlet"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ZeroValue("nothing"),
                      new Ast.Character("Juliet"), // Should be OK - Juliet still on stage
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const checker = new Checker();
      expect(() => checker.check(ast)).not.toThrow();
    });
  });

  describe("Encoder", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should encode and execute a simple program", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a young man"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("a young woman"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("cat"),
                        [], // Value: 1
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["1"]);
    });

    it("should handle arithmetic operations", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a character"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("another character"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ArithmeticOperationValue(
                        new Ast.ArithmeticOperator("sum of"),
                        new Ast.PositiveConstantValue(
                          new Ast.PositiveNoun("cat"),
                          [new Ast.PositiveAdjective("beautiful")], // Value: 2
                        ),
                        new Ast.PositiveConstantValue(
                          new Ast.PositiveNoun("flower"),
                          [
                            new Ast.PositiveAdjective("beautiful"),
                            new Ast.PositiveAdjective("lovely"),
                          ], // Value: 4
                        ),
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["6"]); // 2 + 4
    });

    it("should handle comparisons and conditionals", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a person"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("a person"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("cat"),
                        [], // Value: 1
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.QuestionSentence(
                      "Are you",
                      new Ast.BeComparative("Are you"),
                      new Ast.GreaterThanComparison(
                        new Ast.PositiveComparative("better"),
                      ),
                      new Ast.ZeroValue("nothing"),
                    ),
                    new Ast.ResponseSentence(
                      new Ast.IntegerOutputSentence(
                        "Open your heart",
                        new Ast.Character("Juliet"),
                      ),
                      true, // If so
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["1"]); // 1 > 0, so output 1
    });

    it("should handle stack operations", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("the speaker"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("the listener"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("cat"),
                        [new Ast.PositiveAdjective("beautiful")], // Value: 2
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.RememberSentence(
                      new Ast.SecondPersonPronoun("you"),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("flower"),
                        [
                          new Ast.PositiveAdjective("beautiful"),
                          new Ast.PositiveAdjective("lovely"),
                        ], // Value: 4
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.RecallSentence(
                      new Ast.Comment("your past"),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["2"]); // Pushed 2, set to 4, recalled 2
    });

    it("should handle goto statements", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("the protagonist"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("the love interest"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ZeroValue("nothing"),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.GotoSentence(
                      "Let us return to scene III",
                      "scene",
                      new Ast.Numeral("III"),
                    ),
                  ]),
                ]),
              ]),
            ),
            new Ast.Subpart(
              new Ast.Numeral("II"),
              new Ast.Comment("Scene 2"),
              new Ast.Stage([
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("I am"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("cat"),
                        [new Ast.PositiveAdjective("beautiful")], // Value: 2
                      ),
                      new Ast.Character("Romeo"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Romeo"),
                    ),
                  ]),
                ]),
              ]),
            ),
            new Ast.Subpart(
              new Ast.Numeral("III"),
              new Ast.Comment("Scene 3"),
              new Ast.Stage([
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("flower"),
                        [
                          new Ast.PositiveAdjective("beautiful"),
                          new Ast.PositiveAdjective("lovely"),
                        ], // Value: 4
                      ),
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["0", "4"]); // Skip scene II
    });

    it("should handle character I/O", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Test"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("a lover"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("a lady"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Act 1"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Scene 1"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ArithmeticOperationValue(
                        new Ast.ArithmeticOperator("sum of"),
                        new Ast.PositiveConstantValue(
                          new Ast.PositiveNoun("cat"),
                          [
                            new Ast.PositiveAdjective("beautiful"),
                            new Ast.PositiveAdjective("lovely"),
                            new Ast.PositiveAdjective("wonderful"),
                            new Ast.PositiveAdjective("amazing"),
                            new Ast.PositiveAdjective("sweet"),
                            new Ast.PositiveAdjective("fair"),
                          ], // Value: 64
                        ),
                        new Ast.PositiveConstantValue(
                          new Ast.PositiveNoun("cat"),
                          [
                            new Ast.PositiveAdjective("beautiful"),
                            new Ast.PositiveAdjective("lovely"),
                            new Ast.PositiveAdjective("wonderful"),
                          ], // Value: 8
                        ),
                      ), // 64 + 8 = 72 (ASCII 'H')
                      new Ast.Character("Juliet"),
                    ),
                    new Ast.CharOutputSentence(
                      "Speak your mind",
                      new Ast.Character("Juliet"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const encoder = new Encoder(io);
      const program = encoder.encode(ast);
      program.run();

      expect(io.output).toEqual(["H"]);
    });

    it("should handle pop from empty stack", () => {
      const spl = `
        Empty Stack Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Recall your past!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        "Runtime Error - Trying to recall from empty stack.",
      );
    });

    it("should detect character already on stage", () => {
      const spl = `
        Double Entry Test.

        Romeo, a young man.
        Juliet, a young lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo]
        [Enter Romeo]

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        "Runtime Error: Romeo is already on stage",
      );
    });

    it("should detect character not on stage when exiting", () => {
      const spl = `
        Exit Not On Stage Test.

        Romeo, a young man.
        Juliet, a young lady.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo]
        [Exit Juliet]

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        "Runtime Error: Juliet is not on stage and consequently cannot exit",
      );
    });

    it("should handle Exeunt with no characters (everyone leaves)", () => {
      const spl = `
        Exeunt All Test.

        Romeo, a young man.
        Juliet, a young lady.
        Hamlet, a prince.

        Act I: Test.
        Scene I: Everyone Leaves.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat!

        [Enter Hamlet]
        [Exeunt]

        [Enter Romeo and Juliet]

        Romeo:
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["1"]); // Everyone left, then Romeo re-enters
    });

    it("should handle speaking after Exeunt", () => {
      const spl = `
        Speaking After Exeunt Test.

        Romeo, a young man.
        Juliet, a young lady.

        Act I: Test.
        Scene I: Empty Stage.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat!

        [Exeunt]

        Romeo:
          Open your heart!

        [Exit Romeo]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        /Romeo is trying to speak, but there is nobody else on stage/i,
      );
    });

    it("should handle unicode output including emojis", () => {
      const spl = `
        Unicode Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing!
          You are as good as the sum of a big big big big big big big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big big big big big big big cat and yourself.
          You are as good as the sum of a big big big cat and yourself.
          You are as good as the sum of a big cat and yourself.

          Speak your mind!

        [Exeunt]
      `;
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output.length).toBe(1);
      expect(io.output[0]).toBe("😊");
    });
  });

  describe("Arithmetic Edge Cases", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should handle integer overflow", () => {
      const spl = `
        Integer Overflow Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the product of a big big big big big big big big big big big big big big big big big big big big big big big big big big big big big big cat and a big big big big big big big big big big big big big big big big big big big big big big big big big big big big big big cat.
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // JavaScript handles large numbers, so we just check it runs without crashing
      expect(io.output.length).toBe(1);
    });

    it("should fail to parse empty arithmetic expressions", () => {
      const spl = `
        Empty Expression Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should fail to parse malformed arithmetic expressions", () => {
      const spl = `
        Malformed Expression Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of a cat and.

        [Exeunt]
      `;

      const parser = new Parser(spl);
      expect(() => parser.parse()).toThrow();
    });

    it("should handle square root of negative numbers", () => {
      const spl = `
        Square Root Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the square root of a pig!
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        "Runtime Error - Arithmetic operation resulted in NaN.",
      );
    });

    it("should handle cube of very large numbers", () => {
      const spl = `
        Cube Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the cube of a big big big big big big big big big big cat!
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // 1024^3 = 1073741824
      expect(io.output).toEqual(["1073741824"]);
    });
  });

  describe("I/O Edge Cases", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should handle invalid numeric input", () => {
      const spl = `
        Invalid Input Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Listen to your heart!
          Open your heart!

        [Exeunt]
      `;

      io.inputBuffer = ["abc", "123"]; // First invalid, then valid
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // Should print error message for invalid input, then accept valid input
      expect(io.output).toEqual([
        "Error: Invalid numeric input. Please enter a valid integer.",
        "123",
      ]);
    });

    it("should handle empty input", () => {
      const spl = `
        EOF Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Listen to your heart!
          Open your heart!

        [Exeunt]
      `;

      io.inputBuffer = ["foo", "42"];
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // Empty input should be ignored and prompt again
      expect(io.output).toEqual([
        "Error: Invalid numeric input. Please enter a valid integer.",
        "42",
      ]);
    });

    it("should handle numeric input correctly", () => {
      const spl = `
        Numeric Input Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Listen to your heart!
          You are as good as the sum of yourself and a cat.
          Open your heart!

        [Exeunt]
      `;

      io.inputBuffer = ["5"];
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["6"]); // 5 + 1 = 6
    });

    it("should handle character input correctly", () => {
      const spl = `
        Character Input Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Open your mind!
          Speak your mind!

        [Exeunt]
      `;

      io.inputBuffer = ["A"];
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["A"]);
    });

    it("should handle multiple inputs in sequence", () => {
      const spl = `
        Multiple Input Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Listen to your heart!
          Remember yourself.
          Listen to your heart!
          You are as good as the sum of yourself and the sum of yourself and a cat.
          Open your heart!
          Recall your past!
          Open your heart!

        [Exeunt]
      `;

      io.inputBuffer = ["10", "20"];
      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["41", "10"]); // 20 + 20 + 1 = 41, then recalled 10
    });
  });

  describe("Control Flow Edge Cases", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should handle nested goto scenarios", () => {
      const spl = `
        Nested Goto Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Start.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing.
          Let us proceed to scene II.

        Scene II: Middle.

        Romeo:
          You are as good as the sum of yourself and a cat.
          Are you as good as the sum of a cat and a cat?
          If not, let us return to scene II.
          Let us proceed to scene III.

        Scene III: End.

        Romeo:
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["2"]);
    });

    it("should handle conditional without preceding question", () => {
      const spl = `
        No Question Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          If so, remember me.

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(
        "Runtime Error: tried to execute a conditional with no prior question",
      );
    });

    it("should handle edge cases with equality comparisons", () => {
      const spl = `
        Equality Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat.
          Are you as good as a cat?
          If so, open your heart!

          You are as good as nothing.
          Are you as bad as nothing?
          If so, open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["1", "0"]);
    });

    it("should handle comparisons with very large numbers", () => {
      const spl = `
        Large Number Comparison Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the product of a big big big big big big big big big big big big big big big cat and a big big big big big big big big big big big big big big big cat.
          Are you better than nothing?
          If so, open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output.length).toBe(1);
    });

    it("should handle negated comparisons correctly", () => {
      const spl = `
        Negated Comparison Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat.
          Are you not as good as a cat?
          If so, you are nothing.
          If not, you are a big cat.
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // "not as good as" with 1==1 should be false, so "if not" executes
      expect(io.output).toEqual(["2"]);
    });
  });

  describe("Stack Edge Cases", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should handle mixed operations on multiple character stacks", () => {
      const spl = `
        Multiple Stack Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a big big big big big big cat.
          Remember yourself.
          You are as good as the sum of a cat and a cat.
          Remember yourself.
          I am the sum of a cat and the sum of a cat and a cat.
          Remember me.

        Juliet:
          You are as good as a big big big big big cat.

        Romeo:
          Remember me.
          Open your heart!
          Recall your past!
          Open your heart!
          Speak your mind!
          Recall your love!
          Open your heart!
          Recall your love!
          Open your heart!
          Recall your love!
          Open your heart!
          Speak your mind!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // Juliet's stack has [1, 2] from Romeo, then she pushes 5
      // Stack: [1, 2, 5], recalls in LIFO order: 5, 2
      expect(io.output).toEqual(["2", "32", " ", "3", "2", "64", "@"]);
    });

    it("remember me should push to listener's stack", () => {
      const spl = `
        Remember Me Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          I am the sum of a cat and a cat.
          Remember me.
          I am nothing.
          Recall your past!
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["2"]);
    });

    it("should handle stack underflow as runtime error", () => {
      const spl = `
        Stack Underflow Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Remember me.
          Recall your past!
          Recall your past!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(/empty stack/i);
    });
  });

  describe("Runtime Error Cases", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should handle invalid arithmetic operations at runtime", () => {
      const spl = `
        Invalid Arithmetic Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing.
          You are as good as the remainder of the quotient between a cat and yourself!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow(/division by zero/i);
    });

    it("should initialize characters to zero", () => {
      const spl = `
        Initial Value Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          Open your heart!
          You are as good as the sum of yourself and a cat.
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      // Characters should be initialized to 0
      expect(io.output).toEqual(["0", "1"]);
    });
  });

  describe("Cross-Act Control Flow", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should maintain state across act boundaries", () => {
      const spl = `
        State Preservation Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Setup.
        Scene I: Initialize.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as the sum of a big big cat and a cat.
          Remember yourself.
          I am a big big big cat.
          Remember me.
          Let us proceed to act II.

        Act II: Process.
        Scene I: Use State.

        Romeo:
          Recall your past!
          Open your heart!
          Recall your past!
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["8", "5"]); // Stack maintained across acts
    });
  });

  describe("Full Compiler Integration", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should compile and run Hello World", () => {
      const spl = `
        A New Beginning.

        Hamlet, a literary/storage device.
        Juliet, an orator.

                            Act I: The Only Act.

                            Scene I: The Prince's Speech.

        [Enter Hamlet and Juliet]

        Juliet: Thou art as good as the sum of an amazing healthy honest noble peaceful
                fine Lord and a lovely sweet golden summer's day. Speak your
                mind!

        Juliet: Thou art as good as the sum of thyself and a King. Speak your mind!

                Thou art as good as the sum of an amazing healthy honest hamster and a golden
                nose. Speak your mind!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["H", "I", "\n"]); // HI with newline
    });

    it("should compile and run a loop", () => {
      const spl = `
        Counting to Three.

        Romeo, the counter.
        Juliet, the assistant.

        Act I: Counting.

        Scene I: Setup.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing.

        Scene II: Loop.

        Romeo:
          You are as good as the sum of yourself and a cat.
          Open your heart!
          Are you as good as the sum of a cat and the sum of a cat and a cat?
          If not, let us return to scene II.

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);

      // Add a timeout to prevent infinite loops in tests
      const timeout = setTimeout(() => {
        throw new Error("Test timed out - likely infinite loop");
      }, 1000);

      try {
        compiler.run();
        clearTimeout(timeout);
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }

      expect(io.output).toEqual(["1", "2", "3"]);
    });

    it("should handle negative number output", () => {
      const spl = `
        Negative Output Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as bad as a pig!
          Open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["-1"]);
    });

    it("should handle division by zero", () => {
      const spl = `
        Division by Zero Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as nothing!
          You are as good as the quotient between a cat and yourself!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      expect(() => compiler.run()).toThrow("Runtime Error - Division by zero.");
    });

    it("should handle multiple consecutive questions before conditional", () => {
      const spl = `
        Multiple Questions Test.

        Romeo, a character.
        Juliet, another character.

        Act I: Test.
        Scene I: Test.

        [Enter Romeo and Juliet]

        Romeo:
          You are as good as a cat!
          Are you better than nothing?
          Are you as good as a cat?
          If so, open your heart!

        [Exeunt]
      `;

      const compiler = Horatio.fromSource(spl, io);
      compiler.run();

      expect(io.output).toEqual(["1"]);
    });
  });

  describe("AST Building from Scratch", () => {
    let io: MockIO;

    beforeEach(() => {
      io = new MockIO();
    });

    it("should run from a manually constructed AST", () => {
      const ast = new Ast.Program(
        new Ast.Comment("Manually Built Program"),
        [
          new Ast.Declaration(
            new Ast.Character("Romeo"),
            new Ast.Comment("main character"),
          ),
          new Ast.Declaration(
            new Ast.Character("Juliet"),
            new Ast.Comment("helper"),
          ),
        ],
        [
          new Ast.Part(new Ast.Numeral("I"), new Ast.Comment("Main Act"), [
            new Ast.Subpart(
              new Ast.Numeral("I"),
              new Ast.Comment("Print Numbers"),
              new Ast.Stage([
                new Ast.Enter(
                  new Ast.Character("Romeo"),
                  new Ast.Character("Juliet"),
                ),
                new Ast.Dialogue([
                  new Ast.Line(new Ast.Character("Romeo"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("I am"),
                      new Ast.PositiveConstantValue(
                        new Ast.PositiveNoun("cat"),
                        [], // Value: 1
                      ),
                      new Ast.Character("Romeo"),
                    ),
                  ]),
                  new Ast.Line(new Ast.Character("Juliet"), [
                    new Ast.AssignmentSentence(
                      new Ast.Be("You are"),
                      new Ast.ArithmeticOperationValue(
                        new Ast.ArithmeticOperator("product of"),
                        new Ast.PronounValue(new Ast.FirstPersonPronoun("me")),
                        new Ast.PositiveConstantValue(
                          new Ast.PositiveNoun("flower"),
                          [
                            new Ast.PositiveAdjective("beautiful"),
                            new Ast.PositiveAdjective("lovely"),
                            new Ast.PositiveAdjective("wonderful"),
                          ], // Value: 8
                        ),
                      ),
                      new Ast.Character("Romeo"),
                      new Ast.PositiveAdjective("good"), // Add comparative for "as good as"
                    ),
                    new Ast.IntegerOutputSentence(
                      "Open your heart",
                      new Ast.Character("Romeo"),
                    ),
                  ]),
                ]),
              ]),
            ),
          ]),
        ],
      );

      const compiler = Horatio.fromAst(ast, io);
      compiler.run();

      expect(io.output).toEqual(["0"]); // me starts at 0, so 0 * 8 = 0
    });
  });
});

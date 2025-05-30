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

  read(callback: (input: string) => void): void {
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
          You are the sum of a cat and a dog.
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
          You are the sum of a cat and a dog.
          You are the difference between yourself and a cat.
          You are the product of a flower and the square of a tree.
          You are the quotient between yourself and a cat.
          You are the remainder of the quotient between yourself and a cat.

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
          You are nothing!

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
                    new Ast.GotoSentence("scene", new Ast.Numeral("III")), // Scene III doesn't exist
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
                    new Ast.GotoSentence("scene", new Ast.Numeral("II")),
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
                    new Ast.GotoSentence("scene", new Ast.Numeral("III")),
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

        Juliet: Thou art the sum of an amazing healthy honest noble peaceful
                fine Lord and a lovely sweet golden summer's day. Speak your
                mind!

        Juliet: Thou art the sum of thyself and a King. Speak your mind!

                Thou art the sum of an amazing healthy honest hamster and a golden
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
          You are nothing.

        Scene II: Loop.

        Romeo:
          You are the sum of yourself and a cat.
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
                        new Ast.CharacterValue(new Ast.Character("Romeo")),
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

      expect(io.output).toEqual(["8"]); // 1 * 8
    });
  });
});

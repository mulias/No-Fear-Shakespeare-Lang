import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { prettyPrint as opheliaPrettyPrint } from "../ophelia/prettyPrint";
import { Yorick } from "../yorick";
import { prettyPrint } from "../horatio/prettyPrint";
import { Falstaff } from "../falstaff";
import Horatio from "../horatio/compiler";
import { IO } from "../horatio/types";

// Mock IO interface for testing
const mockIO: IO = {
  print: () => {},
  read_char: () => {},
  read_int: () => {},
  debug: false,
  printDebug: () => {},
  clear: () => {},
};

// Helper function to transpile NFSPL to SPL
async function transpileNfsplToSpl(source: string): Promise<string> {
  const possum = new Possum(source);
  const possumAst = await possum.run();

  const ophelia = new Ophelia(possumAst);
  const opheliaAst = ophelia.run();

  const yorick = new Yorick(opheliaAst);
  const horatioAst = yorick.run();

  return prettyPrint(horatioAst);
}

// Helper function to transpile SPL to NFSPL
function transpileSplToNfspl(source: string): string {
  const horatio = Horatio.fromSource(source, mockIO);
  const falstaff = new Falstaff(horatio.ast);
  const opheliaAst = falstaff.run();
  return opheliaPrettyPrint(opheliaAst);
}

describe("Blank line preservation in NFSPL to SPL translation", () => {
  it("should preserve blank lines between statements in dialogue", async () => {
    const nfsplSource = `## A Test Program
## declare {romeo}, a young man
## declare {juliet}, a fair maiden

Act1 {
  Scene1 {
    stage(romeo, juliet)
    romeo {
      @you.set(5)

      @you.print_int
      @you.print_char

      test_eq(@you, 10)

      goto(Scene1)
    }
  }
}`;

    const result = await transpileNfsplToSpl(nfsplSource);

    expect(result).toMatchSnapshot();
  });

  it("should preserve blank lines for all statement types", async () => {
    const nfsplSource = `## Test All Statement Types
## declare {speaker}, one who speaks
## declare {listener}, one who listens

Main {
  TestScene {
    stage(speaker, listener)
    speaker {
      @you.read_char

      @you.read_int
      @you.push_self

      @you.push_me
      @you.pop

      test_gt(@you, 5)
      if_true(@you.print_char)

      @you.set(@you + 1)
    }
  }
}`;

    const result = await transpileNfsplToSpl(nfsplSource);

    expect(result).toMatchSnapshot();
  });

  it("should handle mixed statements with and without blank lines", async () => {
    const nfsplSource = `## Mixed Blank Lines
## declare {actor}, an actor on stage

SingleAct {
  SingleScene {
    stage(actor, actor)
    actor {
      @you.set(1)
      @you.set(2)

      @you.set(3)


      @you.set(4)
      @you.print_int

      @you.print_char
    }
  }
}`;

    const result = await transpileNfsplToSpl(nfsplSource);

    expect(result).toMatchSnapshot();
  });
});

describe("Blank line preservation in SPL to NFSPL translation", () => {
  it("should preserve blank lines between statements in dialogue", () => {
    const splSource = `A Test Program.

Romeo, a young man.
Juliet, a fair maiden.

Act I: The first act.

Scene I: The first scene.

[Enter Romeo and Juliet]

Romeo:
  You are as lovely as a cat. Speak your mind!

  You are as lovely as the sum of a cat and a cat!


  Open your heart!

[Exeunt]`;

    const result = transpileSplToNfspl(splSource);

    expect(result).toMatchSnapshot();
  });

  it("should preserve blank lines for all statement types", () => {
    const splSource = `Test All Statement Types.

Hamlet, one who speaks.
Ophelia, one who listens.

Act I: Testing.

Scene I: Test Scene.

[Enter Hamlet and Ophelia]

Hamlet:
  Open your mind!

  Listen to your heart!
  Remember yourself.

  Remember me.
  Recall your past.

  Are you better than the sum of a cat and a cat? If so, speak your mind!

  You are as good as the sum of yourself and a cat!

[Exeunt]`;

    const result = transpileSplToNfspl(splSource);

    expect(result).toMatchSnapshot();
  });

  it("should handle mixed statements with and without blank lines", () => {
    const splSource = `Mixed Blank Lines.

Macbeth, an actor on stage.
Lady Macbeth, another character.

Act I: Single Act.

Scene I: Single Scene.

[Enter Macbeth and Lady Macbeth]

Macbeth:
  You are as good as a cat!
  You are as good as the sum of a cat and a cat!

  You are as good as the sum of the sum of a cat and a cat and a cat!


  You are as good as the sum of the sum of a cat and a cat and the sum of a cat and a cat!
  Open your heart!

  Speak your mind!

[Exit Macbeth]
[Exit Lady Macbeth]`;

    const result = transpileSplToNfspl(splSource);

    expect(result).toMatchSnapshot();
  });

  it("should preserve blank lines in complex dialogues", () => {
    const splSource = `Complex Dialogue.

Hamlet, a brave person.
Claudius, an evil person.

Act I: The confrontation.

Scene I: Meeting.

[Enter Hamlet and Claudius]

Hamlet:
  You are as bad as nothing!

  Am I better than you?
  If so, remember me.

  If not, let us proceed to scene II.

Claudius:
  You are as good as the square of the sum of a cat and a cat!


  Remember yourself.

  Recall your past.

[Exeunt]

Scene II: The Exit.

[Enter Hamlet]

Hamlet:
  Speak your mind!

[Exit Hamlet]`;

    const result = transpileSplToNfspl(splSource);

    expect(result).toMatchSnapshot();
  });
});

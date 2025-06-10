import { Possum } from "../../possum";
import { Ophelia } from "../index";
import { prettyPrint } from "../prettyPrint";

describe("NFSPL Round-trip Snapshots", () => {
  /**
   * Parse NFSPL source and pretty print it back to NFSPL
   */
  async function roundTripNfspl(source: string): Promise<string> {
    // Step 1: Parse NFSPL with Possum
    const possum = new Possum(source);
    const possumAst = await possum.run();

    // Step 2: Transform with Ophelia
    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    // Step 3: Pretty print back to NFSPL
    return prettyPrint(opheliaAst);
  }

  describe("basic programs", () => {
    it("should round-trip a hello world program", async () => {
      const source = `Main {
  PrintHi {
    stage(a, b)

    b {
      @you.set(72)
      @you.print_char
    }

    b {
      @you.set(@you + 1)
      @you.print_char
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip a program with multiple scenes", async () => {
      const source = `Main {
  Start {
    stage(n, out)

    out {
      @you.set(0)
    }
  }

  Loop {
    out {
      @you.set(@you + 1)
      test_gt(@you, 100)
      if_true(goto(End))
    }
  }

  End {
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });
  });

  describe("language features", () => {
    it("should round-trip I/O operations", async () => {
      const source = `Main {
  IOTest {
    stage(reader, writer)

    reader {
      @you.read_char
      @you.read_int
    }

    writer {
      @you.set('A')
      @you.print_char
      @you.set(42)
      @you.print_int
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip arithmetic operations", async () => {
      const source = `Main {
  ArithmeticTest {
    stage(calc, result)

    calc {
      @you.set(10 + 5)
      @you.set(20 - 7)
      @you.set(6 * 7)
      @you.set(15 / 3)
      @you.set(17 % 5)
    }

    result {
      @you.set(calc + result)
      @you.set(@you * 2)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip stack operations", async () => {
      const source = `Main {
  StackTest {
    stage(pusher, stack)

    pusher {
      @you.set(42)
      @you.push_self
      @you.push_me
    }

    stack {
      @you.pop
      @you.pop
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip control flow", async () => {
      const source = `Main {
  ControlTest {
    stage(tester, value)

    tester {
      test_eq(@you, 42)
      if_true(goto(Success))
      test_gt(@you, 0)
      if_false(goto(Failure))
    }
  }

  Success {
    stage(winner, output)

    winner {
      @you.set('W')
      @you.print_char
    }

    unstage_all
  }

  Failure {
    stage(loser, output)

    loser {
      @you.set('L')
      @you.print_char
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip all comparison operations", async () => {
      const source = `Main {
  ComparisonTest {
    stage(left, right)

    left {
      test_eq(@you, right)
      test_gt(@you, right)
      test_lt(@you, right)
      test_not_eq(@you, right)
      test_not_gt(@you, right)
      test_not_lt(@you, right)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip character literals", async () => {
      const source = `Main {
  CharTest {
    stage(char_writer, output)

    char_writer {
      @you.set('A')
      @you.set('Z')
      @you.set('0')
      @you.set('9')
      @you.set(' ')
      @you.set('!')
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip stage and unstage operations", async () => {
      const source = `Main {
  StageTest {
    stage(a)
    unstage(a)
    stage(b, c)
    unstage(b, c)
    stage(d, e)
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip nested arithmetic expressions", async () => {
      const source = `Main {
  NestedMath {
    stage(calc, temp)

    calc {
      @you.set((5 + 3) * 2)
      @you.set(@you / 4 - 1)
      @you.set((temp + @you) % 10)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip if statements with different actions", async () => {
      const source = `Main {
  IfTest {
    stage(controller, output)

    controller {
      test_eq(@you, 0)
      if_true(@you.print_char)
      if_false(@you.print_int)
      if_true(@you.push_self)
      if_false(@you.pop)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip goto statements in various contexts", async () => {
      const source = `Main {
  GotoTest {
    stage(jumper, counter)

    jumper {
      goto(NextScene)
    }
  }

  NextScene {
    stage(controller, value)

    controller {
      test_eq(@you, 0)
      if_true(goto(End))
      goto(GotoTest)
    }
  }

  End {
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip multiple acts", async () => {
      const source = `Act1 {
  Scene1 {
    stage(a, b)

    a {
      @you.set(1)
    }

    unstage_all
  }

  Scene2 {
    stage(c, d)

    c {
      @you.set(2)
    }

    unstage_all
  }
}

Act2 {
  Scene1 {
    stage(e, f)

    e {
      @you.set(3)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip multiple dialogues in one scene", async () => {
      const source = `Main {
  Dialogue {
    stage(a, b)

    a {
      @you.set('H')
      @you.print_char
    }

    b {
      @you.set('i')
      @you.print_char
    }

    a {
      @you.set('!')
      @you.print_char
    }

    b {
      @you.set(10)
      @you.print_char
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip mixed @you operations", async () => {
      const source = `Main {
  YouTest {
    stage(speaker, listener)

    speaker {
      @you.set(@you)
      @you.set(@you + 1)
      test_eq(@you, listener)
      test_gt(listener, @you)
    }

    listener {
      @you.set(speaker + @you)
      @you.push_self
      @you.push_me
      @you.pop
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });
  });

  describe("complex programs", () => {
    it("should round-trip fizzbuzz structure", async () => {
      const source = `Main {
  Start {
    stage(n, out)

    out {
      @you.set(0)
    }
  }

  Loop {
    out {
      @you.set(@you + 1)
    }

    out {
      test_gt(@you, 100)
      if_true(goto(End))
    }

    out {
      test_eq(@you % 15, 0)
      if_true(goto(Fizzbuzz))
    }

    out {
      test_eq(@you % 3, 0)
      if_true(goto(Fizz))
    }

    out {
      test_eq(@you % 5, 0)
      if_true(goto(Buzz))
    }

    n {
      @you.set(out)
      @you.print_int
      @you.set(10)
      @you.print_char
      goto(Loop)
    }
  }

  Fizzbuzz {
    n {
      @you.set('f')
      @you.print_char
      @you.set('i')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set('b')
      @you.print_char
      @you.set('u')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set(10)
      @you.print_char
      goto(Loop)
    }
  }

  Fizz {
    n {
      @you.set('f')
      @you.print_char
      @you.set('i')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set(10)
      @you.print_char
      goto(Loop)
    }
  }

  Buzz {
    n {
      @you.set('b')
      @you.print_char
      @you.set('u')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set('z')
      @you.print_char
      @you.set(10)
      @you.print_char
      goto(Loop)
    }
  }

  End {
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip reverse program structure", async () => {
      const source = `Main {
  Init {
    stage(stack, count)

    stack {
      @you.set(0)
    }
  }

  GetInput {
    count {
      @you.read_char
      @you.push_self
    }

    stack {
      @you.set(@you + 1)
      test_gt(@you, 0)
    }

    count {
      if_true(goto(GetInput))
      @you.pop
    }
  }

  PrintReversed {
    count {
      @you.pop
      @you.print_char
    }

    stack {
      @you.set(@you - 1)
      test_gt(@you, 0)
    }

    count {
      if_true(goto(PrintReversed))
    }
  }

  End {
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });
  });

  describe("formatting fixes", () => {
    it("should fix inconsistent indentation", async () => {
      const source = `Main{
Start{
stage(a,b)

   a{
@you.set(72)
      @you.print_char
}

        b{
    @you.set(@you+1)
  @you.print_char
          }

unstage_all
}
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should fix missing spaces around operators", async () => {
      const source = `Main {
  Math {
    stage(calc,temp)

    calc {
      @you.set(5+3*2)
      @you.set(@you/4-1)
      @you.set((temp+@you)%10)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should fix spacing in function calls", async () => {
      const source = `Main {
  TestSpacing {
    stage(tester,value)

    tester {
      test_eq(@you,42)
      if_true(goto(End))
      test_gt( @you , 0 )
      if_false( goto(Start) )
    }
  }

  End {
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should fix spacing in stage/unstage calls", async () => {
      const source = `Main {
  StageSpacing {
    stage(a,b)
    unstage( a , b )
    stage( c )
    unstage(c)
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });
  });

  describe("edge cases", () => {
    it("should round-trip empty scenes", async () => {
      const source = `Main {
  EmptyScene {
  }

  AnotherEmpty {
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip scenes with only stage directions", async () => {
      const source = `Main {
  StageOnly {
    stage(a, b)
    unstage(a)
    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip minimal dialogue blocks", async () => {
      const source = `Main {
  MinimalDialogue {
    stage(speaker)

    speaker {
      @you.set(42)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });

    it("should round-trip single character variables", async () => {
      const source = `Main {
  SingleChar {
    stage(a, b)

    a {
      @you.set(b)
    }

    b {
      @you.set(a + 1)
    }

    unstage_all
  }
}`;

      const result = await roundTripNfspl(source);
      expect(result).toMatchSnapshot();
    });
  });
});

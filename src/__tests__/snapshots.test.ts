import { Possum } from "../possum";
import { Ophelia } from "../ophelia";
import { Yorick } from "../yorick";
import { prettyPrint } from "../horatio/prettyPrint";
import Horatio from "../horatio/compiler";
import { IO } from "../horatio/types";

describe("NFSPL to SPL Snapshots", () => {
  // Mock IO interface for testing
  const mockIO: IO = {
    print: () => {},
    read: () => {},
    debug: false,
    printDebug: () => {},
    clear: () => {},
  };

  /**
   * Transpile NFSPL source to SPL and create snapshots
   */
  async function transpileNfspl(source: string): Promise<string> {
    // Step 1: Parse NFSPL with Possum
    const possum = new Possum(source);
    const possumAst = await possum.run();

    // Step 2: Transform with Ophelia
    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();

    // Step 3: Transpile with Yorick
    const yorick = new Yorick(opheliaAst);
    const yorickAst = yorick.run();

    // Step 4: Format to SPL
    return prettyPrint(yorickAst);
  }

  /**
   * Verify that generated SPL can be parsed back
   */
  function validateSpl(splSource: string): void {
    try {
      const horatio = Horatio.fromSource(splSource, mockIO);
      expect(horatio.ast).toBeTruthy();
    } catch (e) {
      throw new Error(`Generated SPL is invalid: ${e}`);
    }
  }

  describe("example programs", () => {
    it("should transpile hi.nfspl to SPL", async () => {
      const nfsplSource = `Main {
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

    b {
      @you.set(10)
      @you.print_char
    }

    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);

      // Verify the generated SPL is valid by parsing it back
      validateSpl(spl);

      expect(spl).toMatchSnapshot();
    });

    it("should transpile fizzbuzz.nfspl to SPL", async () => {
      const nfsplSource = `## To Fizz, Perchance To Buzz
## declare {n}, a counter of loops
## declare {out}, a poet and orator

Main {
  Start {
    stage(n, out)

    out {
      @you.set(0)
    }
  }

  Loop {
    out { @you.set(@you + 1) }

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
      @you.set(n)
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

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile simplified reverse program", async () => {
      const nfsplSource = `Main {
  Init {
    stage(stack, count)
    stack { @you.set(0) }
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
    count { if_true(goto(PrintReversed)) }
  }

  End {
    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });
  });

  describe("language features", () => {
    it("should transpile basic I/O operations", async () => {
      const nfsplSource = `Main {
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

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile arithmetic operations", async () => {
      const nfsplSource = `Main {
  ArithmeticTest {
    stage(calc, result)

    calc {
      @you.set(10 + 5)
      @you.set(20 - 7)
      @you.set(6 * 7)
      @you.set(15 / 3)
      @you.set(17 % 5)
    }

    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile stack operations", async () => {
      const nfsplSource = `Main {
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

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile control flow", async () => {
      const nfsplSource = `Main {
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
    winner { @you.set('W') }
    unstage_all
  }

  Failure {
    stage(loser, output)
    loser { @you.set('L') }
    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile comparison operations", async () => {
      const nfsplSource = `Main {
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

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile variable references", async () => {
      const nfsplSource = `Main {
  VariableTest {
    stage(a, b)

    a {
      @you.set(10)
    }

    b {
      @you.set(a + 5)
      @you.set(a * b)
    }

    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile character literals", async () => {
      const nfsplSource = `Main {
  CharTest {
    stage(char_writer, output)

    char_writer {
      @you.set('A')
      @you.set('Z')
      @you.set('0')
      @you.set('9')
    }

    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile positive numbers", async () => {
      const nfsplSource = `Main {
  NumberTest {
    stage(numbers, output)

    numbers {
      @you.set(0)
      @you.set(1)
      @you.set(42)
      @you.set(100)
    }

    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });

    it("should transpile multiple acts and scenes", async () => {
      const nfsplSource = `Act1 {
  Scene1 {
    stage(a, b)
    a { @you.set(1) }
    unstage_all
  }

  Scene2 {
    stage(c, d)
    c { @you.set(2) }
    unstage_all
  }
}

Act2 {
  Scene1 {
    stage(e, f)
    e { @you.set(3) }
    unstage_all
  }
}`;

      const spl = await transpileNfspl(nfsplSource);
      expect(spl).toMatchSnapshot();
    });
  });
});

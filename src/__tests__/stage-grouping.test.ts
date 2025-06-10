import { prettyPrint } from "../ophelia/prettyPrint";
import { Ophelia } from "../ophelia";
import { Possum } from "../possum";

describe("Stage Grouping Formatting", () => {
  test("should group stage/unstage commands and add spacing with dialogue blocks", async () => {
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
    unstage(a)


    unstage(b)
  }
}`;

    const expected = `Main {
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

    unstage(a)
    unstage(b)
  }
}`;

    const possum = new Possum(source);
    const possumAst = await possum.run();
    const ophelia = new Ophelia(possumAst);
    const opheliaAst = ophelia.run();
    const formatted = prettyPrint(opheliaAst);

    expect(formatted).toBe(expected);
  });
});

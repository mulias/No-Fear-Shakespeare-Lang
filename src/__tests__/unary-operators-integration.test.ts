import { Ophelia, prettyPrint as prettyPrintNFSPL } from "../ophelia";
import { Yorick } from "../yorick";
import Horatio from "../horatio/horatio";
import { Falstaff } from "../falstaff";
import { Possum } from "../possum";
import type { IO } from "../horatio/types";

// Mock IO for testing
class MockIO implements IO {
  debug = false;
  output: string[] = [];

  print(text: string): void {
    this.output.push(text);
  }

  read_char(callback: (input: string) => void): void {
    callback("");
  }

  read_int(callback: (input: string) => void): void {
    callback("0");
  }

  printDebug(text: string): void {
    // No-op for testing
  }

  clear(): void {
    this.output = [];
  }
}

describe("Unary Operators Integration Tests", () => {
  describe("NFSPL to SPL to NFSPL round-trip", () => {
    it("should handle all unary operators in a round-trip conversion", async () => {
      const nfsplSource = `
## title: Unary Operators Test
## var a: the first number
## var b: the second number

Act1 {
  Scene1 {
    stage(a, b)

    a {
      # Test square
      @you.set(square(4))
      @you.print_int
      @you.print_char

      # Test cube
      @you.set(cube(3))
      @you.print_int
      @you.print_char

      # Test square root
      @you.set(square_root(16))
      @you.print_int
      @you.print_char

      # Test factorial
      @you.set(factorial(5))
      @you.print_int
      @you.print_char

      # Test nested
      @you.set(square(square_root(a)))
      @you.print_int

      # Test with arithmetic
      @you.set(square(2) + cube(2))
      @you.print_int
    }

    unstage_all
  }
}`;

      // Parse NFSPL
      const possum = new Possum(nfsplSource);
      const possumAst = await possum.run();

      // Convert to Ophelia AST
      const ophelia = new Ophelia(possumAst);
      const opheliaAst = ophelia.run();

      // Convert to SPL
      const yorick = new Yorick(opheliaAst);
      const splAst = yorick.run();

      const falstaff = new Falstaff(splAst);
      const opheliaAstFromSpl = falstaff.run();
      const nfsplFromSpl = prettyPrintNFSPL(opheliaAstFromSpl);

      // Check that all unary operators are preserved
      expect(nfsplFromSpl).toContain("square(4)");
      expect(nfsplFromSpl).toContain("cube(1 + 2)");
      expect(nfsplFromSpl).toContain("square_root(16)");
      expect(nfsplFromSpl).toContain("factorial(1 + 4)");
      expect(nfsplFromSpl).toContain("square(square_root(");
      expect(nfsplFromSpl).toContain("square(2) + cube(2)");
    });
  });

  describe("SPL execution with unary operators", () => {
    it("should correctly compute unary operations", async () => {
      const nfsplSource = `
## title: Unary Computation Test
## var x: the computer
## var y: the printer

Act1 {
  Scene1 {
    stage(x, y)

    x {
      # square(4) = 16
      @you.set(square(4))
      @you.print_int

      # cube(3) = 27
      @you.set(cube(3))
      @you.print_int

      # square_root(16) = 4
      @you.set(square_root(16))
      @you.print_int

      # factorial(5) = 120
      @you.set(factorial(5))
      @you.print_int
    }

    unstage_all
  }
}`;

      // Parse NFSPL
      const possum = new Possum(nfsplSource);
      const possumAst = await possum.run();

      // Convert to Ophelia AST
      const ophelia = new Ophelia(possumAst);
      const opheliaAst = ophelia.run();

      // Convert to SPL
      const yorick = new Yorick(opheliaAst);
      const splAst = yorick.run();

      // Execute SPL
      const io = new MockIO();
      const horatio = Horatio.fromAst(splAst, io);
      horatio.run();

      // Check outputs
      expect(io.output).toEqual(["16", "27", "4", "120"]);
    });

    it("should handle nested and mixed operations", async () => {
      const nfsplSource = `
## title: Complex Unary Test
## var x: the computer
## var y: the printer

Act1 {
  Scene1 {
    stage(x, y)

    x {
      # square(square_root(16)) = square(4) = 16
      @you.set(square(square_root(16)))
      @you.print_int

      # factorial(3) + square(2) = 6 + 4 = 10
      @you.set(factorial(3) + square(2))
      @you.print_int

      # cube(2) * 2 = 8 * 2 = 16
      @you.set(cube(2) * 2)
      @you.print_int
    }

    unstage_all
  }
}`;

      // Parse NFSPL
      const possum = new Possum(nfsplSource);
      const possumAst = await possum.run();

      // Convert to Ophelia AST
      const ophelia = new Ophelia(possumAst);
      const opheliaAst = ophelia.run();

      // Convert to SPL
      const yorick = new Yorick(opheliaAst);
      const splAst = yorick.run();

      // Execute SPL
      const io = new MockIO();
      const horatio = Horatio.fromAst(splAst, io);
      horatio.run();

      // Check outputs
      expect(io.output).toEqual(["16", "10", "16"]);
    });
  });
});

# No Fear Shakespeare Programming Language (NFSPL) Specification

## Overview

The No Fear Shakespeare Programming Language (NFSPL) is a modern, C-like syntax that transpiles to the Shakespeare Programming Language (SPL). It maintains the theatrical semantics of SPL while providing a more readable and familiar syntax.

## Program Structure

An NFSPL program consists of:

1. Optional comments (lines starting with `#`)
2. Optional frontmatter section to customize the generated Shakespeare code (e.g., `## declare {varname}, description`)
3. One or more labeled Act blocks, each containing one or more labeled Scene blocks.
4. Statements within each scene.

```
## Fromtmatter title
## declare {var_name}, character description

Act1 {
  Scene1 {
    # Act 1, Scene 1 statements
  }

  Scene2 {
    # Act 1, Scene 2 statements
  }
}

Act2 {
  Scene1 {
    # Act 2, Scene 1 statements
  }
}
```

Acts and scenes serve as labeled jump points for goto statements.

## Values and Expressions

In NFSPL all values are integers. Non-negative integers can be interpreted as
unicode code point, which are a superset of ASCII.

- Integer literals: `72`, `-1`, `100`
- Character literals: `'a'` (97), `'z'` (122), `'\n'` (110)
- Other code point literals: `'🤠'` (129312), `'🎭'` (127917)
- Variable references: The current value of a variable
- Special reference: `@you`, value of the listener/addressee variable in dialog
- Expressions: `n + 1`, `@you % 15`, `'?' - 30`, etc.

## Variables

Variables in NFSPL are lower-case and may contain underscores. All variables are assigned a number value, initialized as 0, and maintain a stack, which is initialized as empty.

## Stage Management

Before you can operate on variables they must be staged, which activates them
within the global state of the program.

- `stage(var1)` or `stage(var1, var2)` - Activate one or two variables
- `unstage(var1)` or `unstage(var1, var2)` - Deactive variables
- `unstage_all` - unstage all variables

Any number of variables can be active at a time, but there needs two be exactly
two active variables in order to execute dialogue blocks. Variables stay active
between acts and scenes.

## Dialogue Blocks

When two variables are on stage, one can operate on the other using dialogue blocks:

```
speaker {
  // statements addressing the other staged variable
}
```

Within a dialogue block:

- The **speaker** or **addressor** can be referenced by their variable name
- The **listener** or **addressee** (the other character on stage) is always referenced as `@you`

Example:

```
stage(n, out)
n {
  @you.set(n)        # out = n
  @you.print_int     # print the value of out
}
```

The addressee is always implicit, so in this example referencing `out` directly would be invalid.

## Dialogue Statements

Within a dialogue block, the following statements are available:

### Assignment

- `@you.set(value)` - Sets the addressed variable to a value
  - Maps to SPL: "You are as [adjective] as [value]"

### Arithmetic Operations

Values can be expressions using:

- `+` (addition) - "the sum of X and Y"
- `-` (subtraction) - "the difference between X and Y"
- `*` (multiplication) - "the product of X and Y"
- `/` (division) - "the quotient between X and Y"
- `%` (modulo) - "the remainder of the quotient between X and Y"

### I/O Operations

- `@you.print_char` - Outputs variable's value as ASCII character
  - Maps to SPL: "Speak your mind"
- `@you.print_int` - Outputs variable's value as number
  - Maps to SPL: "Open your heart"
- `@you.read_char` - Reads ASCII character into variable
  - Maps to SPL: "Open your mind"
- `@you.read_int` - Reads integer into variable
  - Maps to SPL: "Listen to your heart"

### Stack Operations

- `@you.push_self` - Pushes the variable's current value onto its own stack
  - Maps to SPL: "Remember yourself"
- `@you.push_me` - Pushes speaker's value onto addressed variable's stack
  - Maps to SPL: "Remember me"
- `@you.pop` - Pops value from addressed variable's stack, assigns value to the variable
  - Maps to SPL: "Recall [anything]"

### Control Flow

#### Comparisons

- `test_eq(left, right)` - Tests if left equals right
- `test_gt(left, right)` - Tests if left > right
- `test_lt(left, right)` - Tests if left < right
- `test_not_eq(left, right)` - Tests if left != right
- `test_not_gt(left, right)` - Tests if left <= right
- `test_not_lt(left, right)` - Tests if left >= right

#### Conditionals

- `if_true(statement)` - Executes statement if last comparison was true
  - Maps to SPL: "If so, [statement]"
- `if_false(statement)` - Executes statement if last comparison was false
  - Maps to SPL: "If not, [statement]"

#### Gotos

- `goto(ActName)` - Jumps to named step within the current section
  - Maps to SPL: "Let us return to [scene]" or "Let us proceed to [scene]"
  - Can only jump to steps within the same section
- `goto(SceneName)` - Jumps to the beginning of a named section
  - Maps to SPL: "Let us return to [act]" or "Let us proceed to [act]"

## Example Programs

### Hello World (hi.nfspl)

```
## Greating The World
## declare {writer}, a studious scribe
## declate {greater}, an oaf

Main {
  PrintHi {
    stage(writer, greater)

    writer {
      @you.set('H')
      @you.print_char
    }

    writer {
      @you.set(@you + 1)   # 'I' (73)
      @you.print_char
    }

    writer {
      @you.set('\n')
      @you.print_char
    }

    unstage_all
  }
}
```

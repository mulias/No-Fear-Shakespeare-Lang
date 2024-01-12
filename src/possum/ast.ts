export type Program = { type: "program"; nodes: Act[] };

export type Act = { type: "act"; labelId: LabelId; nodes: ActPart[] };

export type ActPart = StageDirection | Block;

export type StageDirection = Stage | Unstage | UnstageAll;

export type Block = {
  type: "block";
  speakerVarId: VarId;
  subjectVarId: VarId;
  nodes: Statement[];
};

export type Statement = Assign | Print | Read | Test | If | Goto | Push | Pop;

export type Assign = { type: "assign"; value: Expression };

export type Expression = Arithmetic | Const | Var;

export type Arithmetic = {
  type: "arithmetic";
  left: Expression;
  op: ArithmeticOp;
  right: Expression;
};

export type ArithmeticOp = "+" | "-" | "/" | "*" | "%";

export type Const = Int | Char;

export type Int = { type: "int"; value: number };

export type Char = { type: "char"; value: number };

export type Print = PrintChar | PrintInt;

export type PrintChar = { type: "print_char" };

export type PrintInt = { type: "print_int" };

export type Read = ReadChar | ReadInt;

export type ReadChar = { type: "read_char" };

export type ReadInt = { type: "read_int" };

export type Test = {
  type: "test";
  is: boolean;
  left: Expression;
  op: TestOp;
  right: Expression;
};

export type TestOp = "==" | ">" | "<";

export type If = { type: "if"; is: boolean; then: Statement };

export type Goto = { kind: "goto"; labelId: LabelId };

export type Push = { kind: "push"; val: Expression };

export type Pop = { kind: "pop" };

export type Stage = { type: "stage"; varId1: VarId; varId2: VarId | null };

export type Unstage = { type: "unstage"; varId1: VarId; varId2: VarId | null };

export type UnstageAll = { type: "unstage_all" };

export type Var = { type: "var"; id: VarId };

export type VarId = string;

export type LabelId = string;

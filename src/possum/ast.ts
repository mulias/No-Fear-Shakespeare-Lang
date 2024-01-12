export type Program = { type: "program"; nodes: Act[] };

export type Act = { type: "act"; labelId: LabelId; nodes: ActPart[] };

export type ActPart = StageDirection | Block;

export type StageDirection = Stage | Unstage | UnstageAll;

export type Block = { type: "block"; varId: VarId; nodes: Statement[] };

export type Statement = Assign | Print | Test | If | Goto;

export type Assign = { type: "assign"; varId: VarId; value: Expression };

export type Expression = Arithmetic | Const | Var;

export type Arithmetic = {
  type: "arithmetic";
  left: Expression;
  op: ArithmeticOp;
  right: Expression;
};

export type ArithmeticOp = "+" | "-" | "/" | "*" | "%";

export type Const = Int | Char;

export type Int = { type: "integer"; value: number };

export type Char = { type: "character"; value: number };

export type Print = PrintChar | PrintInt;

export type PrintChar = { type: "print_char"; varId: VarId };

export type PrintInt = { type: "print_int"; varId: VarId };

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

export type Stage = { type: "stage"; varIds: VarId[] };

export type Unstage = { type: "stage"; varIds: VarId[] };

export type UnstageAll = { type: "unstage_all" };

export type Var = { type: "var"; id: VarId };

export type VarId = string;

export type LabelId = string;

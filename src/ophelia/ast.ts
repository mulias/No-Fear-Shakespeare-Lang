export type Program = { type: "program"; acts: Act[] };

export type Act = { type: "act"; actId: LabelId; scenes: Scene[] };

export type Scene = {
  type: "scene";
  sceneId: LabelId;
  directions: Direction[];
};

export type Direction = Dialogue | Presence;

export type Dialogue = {
  type: "dialogue";
  speakerVarId: VarId;
  lines: Statement[];
};

export type Presence = Stage | Unstage | UnstageAll;

export type Statement = Set | Print | Read | Test | If | Goto | Push | Pop;

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

export type Char = { type: "char"; value: string };

export type Set = { type: ".set"; varId: VarId; value: Expression };

export type Print = PrintChar | PrintInt;

export type PrintChar = { type: ".print_char"; varId: VarId };

export type PrintInt = { type: ".print_int"; varId: VarId };

export type Read = ReadChar | ReadInt;

export type ReadChar = { type: ".read_char"; varId: VarId };

export type ReadInt = { type: ".read_int"; varId: VarId };

export type Test = {
  type:
    | "test_eq"
    | "test_gt"
    | "test_lt"
    | "test_not_eq"
    | "test_not_gt"
    | "test_not_lt";
  left: Expression;
  right: Expression;
};

export type If = { type: "if"; is: boolean; then: Statement };

export type Goto = { type: "goto"; labelId: LabelId };

export type Push = { type: ".push"; varId: VarId };

export type Pop = { type: ".pop"; varId: VarId };

export type Stage = { type: "stage"; varId1: VarId; varId2: VarId | null };

export type Unstage = { type: "unstage"; varId1: VarId; varId2: VarId | null };

export type UnstageAll = { type: "unstage_all" };

export type Var = { type: "var"; id: VarId };

export type VarId = string;

export type LabelId = string;

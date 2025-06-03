import * as PossumAst from "../possum/ast";

export type TemplateString = PossumAst.TemplateString;

export type Program = {
  type: "program";
  title?: TemplateString;
  varDeclarations: Map<VarId, TemplateString>;
  items: ProgramItem[];
};

export type ProgramItem = Act | Comment;

export type Act = {
  type: "act";
  actId: LabelId;
  description?: TemplateString;
  items: ActItem[];
};

export type ActItem = Scene | Comment;

export type Scene = {
  type: "scene";
  sceneId: LabelId;
  description?: TemplateString;
  directions: Direction[];
};

export type Direction = Dialogue | Presence | Comment;

export type Dialogue = {
  type: "dialogue";
  speakerVarId: VarId;
  lines: StatementOrComment[];
};

export type StatementOrComment = Statement | Comment;

export type Presence = Stage | Unstage | UnstageAll;

export type Comment = { type: "comment"; content: string };

export type Statement =
  | Set
  | Print
  | Read
  | Test
  | If
  | Goto
  | PushSelf
  | PushMe
  | Pop;

export type Expression = Arithmetic | Unary | Const | Var | You;

export type Arithmetic = {
  type: "arithmetic";
  left: Expression;
  op: ArithmeticOp;
  right: Expression;
};

export type ArithmeticOp = "+" | "-" | "/" | "*" | "%";

export type Unary = {
  type: "unary";
  op: UnaryOp;
  operand: Expression;
};

export type UnaryOp = "square" | "cube" | "square_root" | "factorial";

export type Const = Int | Char;

export type Int = { type: "int"; value: number };

export type Char = { type: "char"; value: string };

export type Set = { type: ".set"; value: Expression };

export type Print = PrintChar | PrintInt;

export type PrintChar = { type: ".print_char" };

export type PrintInt = { type: ".print_int" };

export type Read = ReadChar | ReadInt;

export type ReadChar = { type: ".read_char" };

export type ReadInt = { type: ".read_int" };

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

export type PushSelf = { type: ".push_self" };

export type PushMe = { type: ".push_me" };

export type Pop = { type: ".pop" };

export type Stage = { type: "stage"; varId1: VarId; varId2: VarId | null };

export type Unstage = { type: "unstage"; varId1: VarId; varId2: VarId | null };

export type UnstageAll = { type: "unstage_all" };

export type Var = { type: "var"; id: VarId };

export type You = { type: "you" };

export type VarId = string;

export type LabelId = string;

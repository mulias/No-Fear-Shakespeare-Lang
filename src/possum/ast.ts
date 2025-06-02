export type Program = { type: "program"; value: (Node | Malformed)[] };

export type Node = Operand | Prefix | Infix | Postfix;

export type Operand = Number | Character | Var | Comment | DocComment;

export type Prefix = {
  type: "negate";
  prefixed: Node;
};

export type Infix = {
  type: "method_access" | "modulo" | "multiply" | "divide" | "add" | "subtract";
  left: Node;
  right: Node;
};

export type Postfix = {
  type: "function_call" | "block";
  value: (Node | Malformed)[];
  postfixed: Node;
};

export type Number = Integer | InvalidNumber;

export type Integer = { type: "int"; value: number };

export type InvalidNumber = { type: "invalid_number"; value: number };

export type Character = { type: "char"; value: string };

export type Var = { type: "var"; value: string };

export type Comment = { type: "comment"; value: string };

export type DocComment = {
  type: "doc_comment";
  value: [key: string, value: string];
};

export type Malformed = { type: "malformed"; value: string };

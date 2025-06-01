export type Program = { type: "program"; value: (Expr | Malformed)[] };

export type Expr = Operand | Prefix | Infix | Postfix;

export type Operand = Number | Character | Var;

export type Prefix = {
  type: "negate";
  prefixed: Expr;
};

export type Infix = {
  type: "method_access" | "modulo" | "multiply" | "divide" | "add" | "subtract";
  left: Expr;
  right: Expr;
};

export type Postfix = {
  type: "function_call" | "block";
  value: (Expr | Malformed)[];
  postfixed: Expr;
};

export type Number = Integer | InvalidNumber;

export type Integer = { type: "int"; value: number };

export type InvalidNumber = { type: "invalid_number"; value: number };

export type Character = { type: "char"; value: string };

export type Var = { type: "var"; value: string };

export type Malformed = { type: "malformed"; value: string };

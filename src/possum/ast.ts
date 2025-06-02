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
  value: [key: DocCommentKey, value: TemplateString];
};

export type DocCommentKey = DocCommentVar | DocCommentProperty;

export type DocCommentVar = {
  type: "doc_comment_var";
  value: string;
};

export type DocCommentProperty = {
  type: "doc_comment_property";
  value: string;
};

export type TemplateString = {
  type: "template_string";
  value: (TemplateVarSegment | TemplateStringSegment)[];
};

export type TemplateVarSegment = {
  type: "template_var_segment";
  value: string;
};

export type TemplateStringSegment = {
  type: "template_string_segment";
  value: string;
};

export type Malformed = { type: "malformed"; value: string };

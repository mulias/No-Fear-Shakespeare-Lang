import * as Ast from "./ast";
import Formatter, { Part, Subpart, Line } from "./formatter";

export const prettyPrint = (ast: Ast.Program): string => {
  const formatter = new Formatter();
  const { title, declarations, parts } = ast.visit(formatter);

  let output = title;

  if (declarations.length > 0) {
    output += "\n\n" + declarations.join("\n");
  }

  if (parts.length > 0) {
    output += "\n\n" + parts.map(prettyPrintPart).join("\n\n");
  }

  return output;
};

const prettyPrintPart = ({ heading, subparts }: Part): string => {
  return [indent(heading, 20), ...subparts.map(prettyPrintSubpart)].join(
    "\n\n",
  );
};

const prettyPrintSubpart = ({ heading, body }: Subpart): string => {
  return [indent(heading, 20), ...body.map(prettyPrintLine)].join("\n\n");
};

const prettyPrintLine = (line: Line | string): string => {
  if (typeof line === "string") {
    return line;
  } else {
    return [line.name, indent(wrap(line.text, 71), 1)].join("\n");
  }
};

const indent = (text: string, spaces: number): string => {
  const indentation = " ".repeat(spaces);

  return text
    .split("\n")
    .map((line) => indentation + line)
    .join("\n");
};

const wrap = (text: string, maxLength: number): string => {
  // Split by paragraph breaks first
  const paragraphs = text.split("\n\n");

  return paragraphs
    .map((paragraph) => {
      // Handle each paragraph separately
      const words = paragraph.split(" ");
      let lines: string[] = [];
      let line = "";

      words.forEach((word) => {
        if (line === "") {
          line = word;
        } else if (line.length + word.length + 1 < maxLength) {
          line = line + " " + word;
        } else {
          lines.push(line);
          line = word;
        }
      });

      if (line) {
        lines.push(line);
      }

      return lines.join("\n");
    })
    .join("\n\n"); // Rejoin paragraphs with double newlines
};

import { TemplateString } from "./possum/ast";

/**
 * Helper function to create a simple template string from a plain string
 */
export function templateString(text: string): TemplateString {
  return {
    type: "template_string",
    value: [
      {
        type: "template_string_segment",
        value: text,
      },
    ],
  };
}

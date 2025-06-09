import * as HoratioAst from "../horatio/ast";
import * as OpheliaAst from "../ophelia/ast";
import { AssertNeverError } from "../util";

export class Reverser {
  private characterNameMap: Map<string, string> = new Map();
  private actCounter = 0;
  private sceneCounter = 0;

  reverseProgram(program: HoratioAst.Program): OpheliaAst.Program {
    // Convert title
    const title = this.convertTitle(program.comment);

    // Convert character declarations
    const varDeclarations = this.convertDeclarations(program.declarations);

    // Convert acts
    const items = this.convertParts(program.parts);

    return {
      type: "program",
      title,
      varDeclarations,
      items,
    };
  }

  private convertTitle(
    comment: HoratioAst.Comment,
  ): OpheliaAst.TemplateString | undefined {
    if (!comment.sequence) return undefined;

    return {
      type: "template_string",
      value: [
        {
          type: "template_string_segment",
          value: comment.sequence,
        },
      ],
    };
  }

  private convertDeclarations(
    declarations: HoratioAst.Declaration[],
  ): Map<string, OpheliaAst.TemplateString> {
    const varDeclarations = new Map<string, OpheliaAst.TemplateString>();

    for (const decl of declarations) {
      const originalName = decl.character.sequence;
      const varName = this.convertCharacterName(originalName);

      // Store mapping for later use
      this.characterNameMap.set(originalName, varName);

      const description: OpheliaAst.TemplateString = {
        type: "template_string",
        value: [
          {
            type: "template_string_segment",
            value: decl.comment.sequence,
          },
        ],
      };

      varDeclarations.set(varName, description);
    }

    return varDeclarations;
  }

  private convertCharacterName(name: string): string {
    // Convert to lowercase and replace spaces with underscores
    return name.toLowerCase().replace(/\s+/g, "_");
  }

  private convertParts(parts: HoratioAst.Part[]): OpheliaAst.ProgramItem[] {
    const items: OpheliaAst.ProgramItem[] = [];

    for (const part of parts) {
      this.actCounter++;
      const act = this.convertPart(part);
      items.push(act);
    }

    return items;
  }

  private convertPart(part: HoratioAst.Part): OpheliaAst.Act {
    const actId = `Act${this.actCounter}`;
    const description = this.convertDescription(part.comment);

    // Reset scene counter for each act
    this.sceneCounter = 0;
    const items = this.convertSubparts(part.subparts);

    return {
      type: "act",
      actId,
      description,
      items,
    };
  }

  private romanToNumber(roman: string): number {
    const romanNumerals: Record<string, number> = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
      XIII: 13,
      XIV: 14,
      XV: 15,
    };
    return romanNumerals[roman] || 1;
  }

  private convertDescription(
    comment: HoratioAst.Comment,
  ): OpheliaAst.TemplateString | undefined {
    if (!comment.sequence) return undefined;

    // Replace character names with template variables
    let description = comment.sequence;

    // For each character in our map, replace their name with a template variable
    for (const [originalName, varName] of this.characterNameMap) {
      const regex = new RegExp(`\\b${originalName}\\b`, "gi");
      description = description.replace(regex, `{${varName}}`);
    }

    // Parse into template string
    const segments: OpheliaAst.TemplateString["value"][number][] = [];
    const parts = description.split(/(\{[^}]+\})/);

    for (const part of parts) {
      if (part.startsWith("{") && part.endsWith("}")) {
        segments.push({
          type: "template_var_segment",
          value: part.slice(1, -1),
        });
      } else if (part) {
        segments.push({
          type: "template_string_segment",
          value: part,
        });
      }
    }

    return {
      type: "template_string",
      value: segments,
    };
  }

  private convertSubparts(
    subparts: HoratioAst.Subpart[],
  ): OpheliaAst.ActItem[] {
    const items: OpheliaAst.ActItem[] = [];

    for (const subpart of subparts) {
      this.sceneCounter++;
      const scene = this.convertSubpart(subpart);
      items.push(scene);
    }

    return items;
  }

  private convertSubpart(subpart: HoratioAst.Subpart): OpheliaAst.Scene {
    const sceneId = `Scene${this.sceneCounter}`;
    const description = this.convertDescription(subpart.comment);
    const directions = this.convertStage(subpart.stage);

    return {
      type: "scene",
      sceneId,
      description,
      directions,
    };
  }

  private convertStage(stage: HoratioAst.Stage): OpheliaAst.Direction[] {
    const directions: OpheliaAst.Direction[] = [];

    for (const direction of stage.directions) {
      const converted = this.convertDirection(direction);
      if (converted) {
        if (Array.isArray(converted)) {
          directions.push(...converted);
        } else {
          directions.push(converted);
        }
      }
    }

    return directions;
  }

  private convertDirection(
    direction: HoratioAst.Dialogue | HoratioAst.Presence,
  ): OpheliaAst.Direction | OpheliaAst.Direction[] | null {
    if (direction instanceof HoratioAst.Enter) {
      return this.convertEnter(direction);
    } else if (direction instanceof HoratioAst.Exit) {
      return this.convertExit(direction);
    } else if (direction instanceof HoratioAst.Exeunt) {
      return this.convertExeunt(direction);
    } else if (direction instanceof HoratioAst.Dialogue) {
      return this.convertDialogue(direction);
    }

    return null;
  }

  private convertEnter(enter: HoratioAst.Enter): OpheliaAst.Stage {
    const varIds: string[] = [];

    // Add all characters
    for (const character of enter.characters) {
      varIds.push(
        this.characterNameMap.get(character.sequence) ||
          this.convertCharacterName(character.sequence),
      );
    }

    return {
      type: "stage",
      varIds,
    };
  }

  private convertExit(exit: HoratioAst.Exit): OpheliaAst.Unstage {
    const character =
      this.characterNameMap.get(exit.character.sequence) ||
      this.convertCharacterName(exit.character.sequence);

    return {
      type: "unstage",
      varIds: [character],
    };
  }

  private convertExeunt(
    exeunt: HoratioAst.Exeunt,
  ): OpheliaAst.UnstageAll | OpheliaAst.Unstage {
    if (exeunt.characters.length === 0) {
      // Everyone exits
      return { type: "unstage_all" };
    } else {
      const varIds = exeunt.characters.map(
        (char) =>
          this.characterNameMap.get(char.sequence) ||
          this.convertCharacterName(char.sequence),
      );

      return {
        type: "unstage",
        varIds,
      };
    }
  }

  private convertDialogue(
    dialogue: HoratioAst.Dialogue,
  ): OpheliaAst.Dialogue[] {
    // A Dialogue contains multiple Lines, each spoken by a character
    // Convert each line to a separate dialogue
    const dialogues: OpheliaAst.Dialogue[] = [];

    for (const line of dialogue.lines) {
      const speakerName = line.character.sequence;
      const speakerVarId =
        this.characterNameMap.get(speakerName) ||
        this.convertCharacterName(speakerName);

      const statements = this.convertSentences(line.sentences, speakerVarId);

      if (statements.length > 0) {
        dialogues.push({
          type: "dialogue",
          speakerVarId,
          lines: statements,
        });
      }
    }

    return dialogues;
  }

  private convertSentences(
    sentences: HoratioAst.Sentence[],
    speaker: string,
  ): OpheliaAst.StatementOrComment[] {
    const lines: OpheliaAst.StatementOrComment[] = [];

    for (const sentence of sentences) {
      const statement = this.convertSentence(sentence, speaker);
      if (statement) {
        lines.push(statement);
      }
    }

    return lines;
  }

  private convertSentence(
    sentence: HoratioAst.Sentence,
    speaker: string,
  ): OpheliaAst.Statement {
    if (sentence instanceof HoratioAst.AssignmentSentence) {
      return this.convertAssignment(sentence, speaker);
    } else if (sentence instanceof HoratioAst.CharOutputSentence) {
      return {
        type: ".print_char",
        followedByBlankLine: !!sentence.followedByBlankLine,
      };
    } else if (sentence instanceof HoratioAst.IntegerOutputSentence) {
      return {
        type: ".print_int",
        followedByBlankLine: !!sentence.followedByBlankLine,
      };
    } else if (sentence instanceof HoratioAst.CharInputSentence) {
      return {
        type: ".read_char",
        followedByBlankLine: !!sentence.followedByBlankLine,
      };
    } else if (sentence instanceof HoratioAst.IntegerInputSentence) {
      return {
        type: ".read_int",
        followedByBlankLine: !!sentence.followedByBlankLine,
      };
    } else if (sentence instanceof HoratioAst.RememberSentence) {
      return this.convertRemember(sentence);
    } else if (sentence instanceof HoratioAst.RecallSentence) {
      return {
        type: ".pop",
        followedByBlankLine: !!sentence.followedByBlankLine,
      };
    } else if (sentence instanceof HoratioAst.QuestionSentence) {
      return this.convertQuestion(sentence, speaker);
    } else if (sentence instanceof HoratioAst.ResponseSentence) {
      return this.convertResponse(sentence, speaker);
    } else if (sentence instanceof HoratioAst.GotoSentence) {
      return this.convertGoto(sentence);
    } else {
      throw new AssertNeverError(sentence);
    }
  }

  private convertAssignment(
    assignment: HoratioAst.AssignmentSentence,
    speaker: string,
  ): OpheliaAst.Set {
    const value = this.convertValue(assignment.value, speaker);

    return {
      type: ".set",
      value,
      followedByBlankLine: !!assignment.followedByBlankLine,
    };
  }

  private convertValue(
    value: HoratioAst.Value,
    speaker: string,
  ): OpheliaAst.Expression {
    if (value instanceof HoratioAst.PositiveConstantValue) {
      // Calculate the numeric value
      const baseValue = 1; // Positive nouns have value 1
      const multiplier = Math.pow(2, value.adjectives.length);
      return { type: "int", value: baseValue * multiplier };
    } else if (value instanceof HoratioAst.NegativeConstantValue) {
      // Calculate the numeric value
      const baseValue = -1; // Negative nouns have value -1
      const multiplier = Math.pow(2, value.adjectives.length);
      return { type: "int", value: baseValue * multiplier };
    } else if (value instanceof HoratioAst.ZeroValue) {
      return { type: "int", value: 0 };
    } else if (value instanceof HoratioAst.CharacterValue) {
      const varName =
        this.characterNameMap.get(value.character.sequence) ||
        this.convertCharacterName(value.character.sequence);
      return { type: "var", id: varName };
    } else if (value instanceof HoratioAst.PronounValue) {
      if (value.pronoun instanceof HoratioAst.SecondPersonPronoun) {
        return { type: "you" };
      } else {
        // First person pronoun refers to the speaker
        return { type: "var", id: speaker };
      }
    } else if (value instanceof HoratioAst.ArithmeticOperationValue) {
      return this.convertArithmetic(value, speaker);
    } else if (value instanceof HoratioAst.UnaryOperationValue) {
      return this.convertUnary(value, speaker);
    }

    // Default fallback
    return { type: "int", value: 0 };
  }

  private convertArithmetic(
    arith: HoratioAst.ArithmeticOperationValue,
    speaker: string,
  ): OpheliaAst.Arithmetic {
    const left = this.convertValue(arith.value_1, speaker);
    const right = this.convertValue(arith.value_2, speaker);
    const op = this.convertArithmeticOperator(arith.operator);

    return {
      type: "arithmetic",
      left,
      op,
      right,
    };
  }

  private convertArithmeticOperator(
    operator: HoratioAst.ArithmeticOperator,
  ): OpheliaAst.ArithmeticOp {
    const opMap: Record<string, OpheliaAst.ArithmeticOp> = {
      sum: "+",
      "sum of": "+",
      difference: "-",
      "difference between": "-",
      product: "*",
      "product of": "*",
      quotient: "/",
      "quotient between": "/",
      remainder: "%",
      "remainder of the quotient between": "%",
    };

    const op = opMap[operator.sequence];
    if (!op) {
      throw new Error(`Unknown arithmetic operator: ${operator.sequence}`);
    }
    return op;
  }

  private convertUnary(
    unary: HoratioAst.UnaryOperationValue,
    speaker: string,
  ): OpheliaAst.Unary | OpheliaAst.Arithmetic {
    // Special case: "twice" should convert to "2 * X"
    if (unary.operator.sequence === "twice") {
      const operand = this.convertValue(unary.value, speaker);
      return {
        type: "arithmetic",
        left: { type: "int", value: 2 },
        op: "*",
        right: operand,
      };
    }

    const operand = this.convertValue(unary.value, speaker);
    const op = this.convertUnaryOperator(unary.operator);

    return {
      type: "unary",
      op,
      operand,
    };
  }

  private convertUnaryOperator(
    operator: HoratioAst.UnaryOperator,
  ): OpheliaAst.UnaryOp {
    const opMap: Record<string, OpheliaAst.UnaryOp> = {
      "square of": "square",
      "cube of": "cube",
      "square root of": "square_root",
      "factorial of": "factorial",
    };

    const op = opMap[operator.sequence];
    if (!op) {
      throw new Error(`Unknown unary operator: ${operator.sequence}`);
    }
    return op;
  }

  private convertRemember(
    remember: HoratioAst.RememberSentence,
  ): OpheliaAst.PushSelf | OpheliaAst.PushMe {
    if (remember.pronoun instanceof HoratioAst.FirstPersonPronoun) {
      return {
        type: ".push_me",
        followedByBlankLine: !!remember.followedByBlankLine,
      };
    } else {
      return {
        type: ".push_self",
        followedByBlankLine: !!remember.followedByBlankLine,
      };
    }
  }

  private convertQuestion(
    question: HoratioAst.QuestionSentence,
    speaker: string,
  ): OpheliaAst.Test {
    // Determine who is being compared based on the prefix
    // "Am I" -> speaker vs addressee
    // "Are you", "Art thou" -> addressee vs speaker
    // "Is X" -> X vs something

    let leftValue: OpheliaAst.Expression;
    let rightValue: OpheliaAst.Expression;

    // Check if value1 is a BeComparative (indicates the subject is implicit)
    if (question.value1 instanceof HoratioAst.BeComparative) {
      // The subject is determined by the prefix
      if (question.prefix.toLowerCase().includes("i")) {
        // "Am I" - speaker is the left side
        leftValue = { type: "var", id: speaker };
      } else {
        // "Are you", "Art thou" - addressee is the left side
        leftValue = { type: "you" };
      }
      rightValue = this.convertValue(question.value2, speaker);
    } else {
      // value1 is explicit
      leftValue = this.convertValue(question.value1, speaker);
      rightValue = this.convertValue(question.value2, speaker);
    }

    // Convert the comparison type
    const testType = this.convertComparison(question.comparison);

    return {
      type: testType,
      left: leftValue,
      right: rightValue,
      followedByBlankLine: !!question.followedByBlankLine,
    };
  }

  private convertComparison(
    comparison: HoratioAst.Comparison,
  ): OpheliaAst.Test["type"] {
    if (comparison instanceof HoratioAst.EqualToComparison) {
      return "test_eq";
    } else if (comparison instanceof HoratioAst.GreaterThanComparison) {
      return "test_gt";
    } else if (comparison instanceof HoratioAst.LesserThanComparison) {
      return "test_lt";
    } else if (comparison instanceof HoratioAst.InverseComparison) {
      // Get the inner comparison and invert it
      const innerType = this.convertComparison(comparison.comparison);
      switch (innerType) {
        case "test_eq":
          return "test_not_eq";
        case "test_gt":
          return "test_not_gt";
        case "test_lt":
          return "test_not_lt";
        default:
          return "test_eq";
      }
    }
    return "test_eq";
  }

  private convertResponse(
    response: HoratioAst.ResponseSentence,
    speaker: string,
  ): OpheliaAst.If {
    const thenStatement = this.convertSentence(response.sentence, speaker);

    return {
      type: "if",
      is: response.runIf,
      then: thenStatement,
      followedByBlankLine: !!response.followedByBlankLine,
    };
  }

  private convertGoto(goto: HoratioAst.GotoSentence): OpheliaAst.Goto {
    const number = this.romanToNumber(goto.numeral.sequence);
    const labelId = goto.part === "act" ? `Act${number}` : `Scene${number}`;

    return {
      type: "goto",
      labelId,
      followedByBlankLine: !!goto.followedByBlankLine,
    };
  }
}

import Wordlists from "./wordlists";
import Token from "./token";

/**
 * SPL Tokenizer
 * @memberof Horatio
 * @param {string} input - An input SPL program
 */
export default class Tokenizer {
  tokens: Token[];
  dictionary: { [key: string]: number };

  constructor(input: string) {
    this.tokens = [];
    this.dictionary = {};
    this.buildDictionary();
    this.tokenize(input);
  }

  /**
   * Get the next token
   * @returns {Token|number} - The next token from the input program, or -1 if no remaining tokens.
   */
  nextToken(): Token | number {
    if (this.tokens.length > 0) {
      return this.tokens.shift()!!!;
    } else {
      return -1;
    }
  }

  /**
   * Scan and tokenize an input SPL program
   * @param {string} input - The input SPL program
   */
  tokenize(input: string): void {
    // strip all newlines/extra whitespace
    input = input.trim().replace(/[\s\n]+/g, " ");

    // replace terminals
    input = input.replace(/[:,.!?\[\]]/g, function (match: string): string {
      switch (match) {
        case ":":
          return " COLON"; //break;
        case ",":
          return " COMMA"; //break;
        case ".":
          return " PERIOD"; //break;
        case "!":
          return " EXCLAMATION_POINT"; //break;
        case "?":
          return " QUESTION_MARK"; //break;
        case "[":
          return "LEFT_BRACKET "; //break;
        case "]":
          return " RIGHT_BRACKET"; //break;
        default:
          return match;
      }
    });

    // Split into array by spaces
    let input_array = input.split(" ");

    // tokenize
    while (input_array.length > 0) {
      let current = input_array.shift()!!!;
      let currentLower = current.toLowerCase();

      if (current && this.dictionary[currentLower]) {
        let check_next = current + " " + (input_array[0] || "");
        let check_next_lower = check_next.toLowerCase();

        if (this.dictionary[check_next_lower]) {
          current = check_next;
          this.tokens.push(
            new Token(this.dictionary[check_next_lower]!!!, current),
          );
          input_array.splice(0, 1);
        } else {
          this.tokens.push(
            new Token(this.dictionary[currentLower]!!!, current),
          );
        }
      } else {
        // check if further appends will find match
        let br = 0;
        let orig = current;
        let currentLower = current.toLowerCase();

        while (
          !this.dictionary[currentLower] &&
          br < 6 &&
          br < input_array.length
        ) {
          current = current + " " + input_array[br];
          currentLower = current.toLowerCase();

          if (this.dictionary[currentLower]) {
            this.tokens.push(
              new Token(this.dictionary[currentLower]!!!, current),
            );
            input_array.splice(0, br + 1);
            break;
          }
          br += 1;
        }

        // comment - use proper COMMENT token instead of hardcoded 43
        if (br === 6 || (br < 6 && !this.dictionary[currentLower])) {
          this.tokens.push(new Token(Token.COMMENT, orig));
        }
      }
    }
  }

  /**
   * Builds a hash of words -> byte codes for scanning
   */
  buildDictionary() {
    let self = this;
    let wl = Wordlists;

    wl.characters.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 10;
    });
    wl.articles.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 11;
    });
    wl.be.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 12;
    });
    wl.act.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 13;
    });
    wl.scene.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 14;
    });
    wl.enter.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 15;
    });
    wl.exit.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 16;
    });
    wl.exeunt.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 17;
    });

    //wl.input                 .forEach(function(w) { self.dictionary[w] = 20; });
    wl.input_integer.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 21;
    });
    wl.input_char.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 22;
    });
    //wl.output                .forEach(function(w) { self.dictionary[w] = 23; });
    wl.output_integer.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 24;
    });
    wl.output_char.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 25;
    });

    wl.imperatives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 30;
    });
    wl.to.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 31;
    });
    wl.proceed.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 32;
    });

    wl.positive_comparatives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 40;
    });
    wl.negative_comparatives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 41;
    });
    wl.as.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 42;
    });
    wl.not.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 43;
    });
    wl.than.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 44;
    });
    wl.if_so.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 45;
    });
    wl.be_comparatives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 46;
    });
    wl.is.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 47;
    });
    wl.if_not.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 48;
    });

    wl.unary_operators.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 50;
    });
    wl.arithmetic_operators.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 51;
    });

    wl.remember.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 60;
    });
    wl.recall.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 61;
    });

    wl.first_person_pronouns.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 70;
    });
    wl.second_person_pronouns.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 71;
    });
    wl.positive_adjectives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 72;
    });
    wl.neutral_adjectives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 73;
    });
    wl.negative_adjectives.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 74;
    });
    wl.positive_nouns.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 75;
    });
    wl.neutral_nouns.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 76;
    });
    wl.negative_nouns.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 77;
    });
    wl.roman_numerals.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 78;
    });
    wl.nothing.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 79;
    });

    wl.first_person_possessive.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 80;
    });
    wl.second_person_possessive.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 81;
    });
    wl.third_person_possessive.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 82;
    });

    wl.colon.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 90;
    });
    wl.comma.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 91;
    });
    wl.period.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 92;
    });
    wl.exclamation_point.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 93;
    });
    wl.question_mark.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 94;
    });
    wl.ampersand.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 95;
    });
    wl.and.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 96;
    });
    wl.left_bracket.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 97;
    });
    wl.right_bracket.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 98;
    });
  }
}

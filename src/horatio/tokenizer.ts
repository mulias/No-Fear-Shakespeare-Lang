import Wordlists from "./wordlists";
import Token from "./token";

/**
 * SPL Tokenizer
 * @memberof Horatio
 * @param {string} input - An input SPL program
 */
export default class Tokenizer {
  input: string;
  startPos: number;
  currentPos: number;
  tokens: Token[];
  dictionary: { [key: string]: number };

  constructor(input: string) {
    this.input = input;
    this.startPos = 0;
    this.currentPos = 0;
    this.tokens = [];
    this.dictionary = {};
    this.buildDictionary();
    this.tokenize();
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

  addToken(tokenType: number, literal?: string): void {
    const lit = literal ?? this.input.slice(this.startPos, this.currentPos);
    const t = new Token(tokenType, lit);
    this.tokens.push(t);
    this.commit();
  }

  commit(): void {
    this.startPos = this.currentPos;
  }

  nextChar(): string | undefined {
    const char = this.input[this.currentPos];
    if (char) {
      this.currentPos += 1;
    }

    return char;
  }

  peekChar(): string | undefined {
    return this.input[this.currentPos];
  }

  nextWord(): string | undefined {
    // skip leading whitespace
    while (true) {
      const char = this.input[this.currentPos];
      if (!char || !isWhitespace(char)) break;
      this.currentPos += 1;
    }

    const start = this.currentPos;

    // take chars until whitespace
    while (true) {
      const char = this.input[this.currentPos];
      if (!char || char.match(/\s|[\[\]:,&.!?]/)) break;
      this.currentPos += 1;
    }

    const word = this.input.slice(start, this.currentPos) || undefined;
    return word;
  }

  tokenize(): void {
    while (true) {
      let char = this.peekChar();

      if (!char) break;

      let newlineCount = 0;
      while (true) {
        if (!char || !isWhitespace(char)) break;
        if (char === "\n") newlineCount += 1;
        this.nextChar();
        char = this.peekChar();
      }

      if (newlineCount >= 2) {
        this.addToken(Token.WHITESPACE);
      }

      this.commit();

      switch (char) {
        case ":":
          this.nextChar();
          this.addToken(Token.COLON);
          continue;
        case ",":
          this.nextChar();
          this.addToken(Token.COMMA);
          continue;
        case "&":
          this.nextChar();
          this.addToken(Token.AMPERSAND);
          continue;
        case ".":
          this.nextChar();
          this.addToken(Token.PERIOD);
          continue;
        case "!":
          this.nextChar();
          this.addToken(Token.EXCLAMATION_POINT);
          continue;
        case "?":
          this.nextChar();
          this.addToken(Token.QUESTION_MARK);
          continue;
        case "[":
          this.nextChar();
          this.addToken(Token.LEFT_BRACKET);
          continue;
        case "]":
          this.nextChar();
          this.addToken(Token.RIGHT_BRACKET);
          continue;
      }

      // Single or multi word phrase tokens
      const phraseStartPos = this.currentPos;
      let longestMatch = "";
      let longestMatchEndPos = this.currentPos;
      let tokenType: number | undefined = undefined;
      let words: string[] = [];

      while (true) {
        const word = this.nextWord();

        if (!word) break;

        words.push(word);
        const phrase = words.join(" ");
        const phraseLower = phrase.toLowerCase();

        if (this.dictionary[phraseLower]) {
          longestMatch = phrase;
          longestMatchEndPos = this.currentPos;
          tokenType = this.dictionary[phraseLower]!;
        }

        if (!this.couldExtendToMatch(phraseLower)) {
          break;
        }
      }

      if (tokenType && longestMatch) {
        this.currentPos = longestMatchEndPos;
        this.addToken(tokenType, longestMatch);
        continue;
      }

      // Failed to fine a phrase in the dictionary
      this.currentPos = phraseStartPos;
      const commentWord = this.nextWord();
      if (commentWord) {
        this.addToken(Token.COMMENT, commentWord);
        continue;
      } else {
        break;
      }
    }
  }

  /**
   * Check if a phrase could be extended to match a dictionary entry
   */
  couldExtendToMatch(phrase: string): boolean {
    for (const key in this.dictionary) {
      if (key.startsWith(phrase + " ")) {
        return true;
      }
    }
    return false;
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
    wl.you.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 18;
    });

    wl.input_integer.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 21;
    });
    wl.input_char.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 22;
    });
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

    wl.and.forEach(function (w) {
      self.dictionary[w.toLowerCase()] = 96;
    });
  }
}

function isWhitespace(c: string) {
  return (
    c === " " ||
    c === "\n" ||
    c === "\t" ||
    c === "\r" ||
    c === "\f" ||
    c === "\v" ||
    c === "\u00a0" ||
    c === "\u1680" ||
    c === "\u2000" ||
    c === "\u200a" ||
    c === "\u2028" ||
    c === "\u2029" ||
    c === "\u202f" ||
    c === "\u205f" ||
    c === "\u3000" ||
    c === "\ufeff"
  );
}

import wordlists from "../horatio/wordlists";

type Category =
  | "characters"
  | "positive_adjectives"
  | "negative_adjectives"
  | "neutral_adjectives"
  | "positive_nouns"
  | "negative_nouns"
  | "neutral_nouns"
  | "roman_numerals"
  | "first_person_pronouns"
  | "second_person_pronouns"
  | "input_char"
  | "input_integer"
  | "output_char"
  | "output_integer"
  | "be_first_person"
  | "be_second_person"
  | "nothing"
  | "be_comparatives_first_person"
  | "be_comparatives_second_person"
  | "positive_comparatives"
  | "negative_comparatives";

type Wordlists = Record<Category, string[]>;

export class Generator {
  wordlists: Wordlists;

  constructor() {
    this.wordlists = wordlists;
  }

  random(category: Category): string {
    const entries = this.wordlists[category];
    const index = randomIndex(entries);
    return entries[index] as string;
  }

  randomAdjective(): string {
    const categories: Category[] = [
      "positive_adjectives",
      "negative_adjectives",
      "neutral_adjectives",
    ];
    const category = categories[randomIndex(categories)] as Category;
    return this.random(category);
  }

  randomNoun(): string {
    const categories: Category[] = [
      "positive_nouns",
      "negative_nouns",
      "neutral_nouns",
    ];
    const category = categories[randomIndex(categories)] as Category;
    return this.random(category);
  }

  randomBoolean() {
    return Math.floor(Math.random() * 100) % 2 === 0;
  }

  reserveRandom(category: Category): string {
    const entries = this.wordlists[category];
    const index = randomIndex(entries);
    const entry = entries[index] as string;

    this.wordlists[category].splice(index, 1);

    return entry;
  }

  romanNumeral(n: number): string {
    const rn = this.wordlists.roman_numerals[n - 1];
    if (rn) {
      return rn;
    } else {
      throw new Error(`No roman numeral for ${n}`);
    }
  }

  arithmeticOperator(
    key: "add" | "subtract" | "multiply" | "divide" | "modulo",
  ): string {
    return (this.wordlists as any).arithmetic_operators_map[key];
  }
}

function randomIndex(elems: unknown[]): number {
  return Math.floor(Math.random() * elems.length);
}

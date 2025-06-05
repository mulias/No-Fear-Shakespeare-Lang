export enum UsageContext {
  ASSIGNMENT = "assignment", // "You are X"
  DIRECT_ASSIGNMENT = "direct", // "You X!" (no article)
  ARITHMETIC_OPERAND = "arithmetic", // "sum of X and Y"
  COMPARISON = "comparison", // "as good as X"
  WITH_ADJECTIVES = "with_adj", // "pretty little X"
}

export type ArticleType = "a" | "an" | "the" | "none" | "required";
export type Disposition = "positive" | "negative" | "neutral";

export type NounProperties = {
  word: string;
  disposition: Disposition;
  articleUsage: {
    standalone: ArticleType; // "You are [article] [noun]"
    inArithmetic: ArticleType; // "sum of [article] [noun]"
    withAdjectives: ArticleType; // When modified by adjectives
  };
  nounType: "proper" | "abstract" | "concrete" | "title";
  countable: boolean;
};

// Helper function to determine indefinite article
function getArticle(word: string): "a" | "an" {
  const firstLetter = word[0]?.toLowerCase();
  if (!firstLetter) return "a";
  const vowels = ["a", "e", "i", "o", "u"];
  return vowels.includes(firstLetter) ? "an" : "a";
}

// Create noun database with all nouns from wordlists
export const nounDatabase: Map<string, NounProperties> = new Map([
  // Positive nouns - Proper nouns
  [
    "Heaven",
    {
      word: "Heaven",
      disposition: "positive",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "none",
      },
      nounType: "proper",
      countable: false,
    },
  ],

  // Positive nouns - Titles
  [
    "King",
    {
      word: "King",
      disposition: "positive",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "title",
      countable: false,
    },
  ],
  [
    "Lord",
    {
      word: "Lord",
      disposition: "positive",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "title",
      countable: false,
    },
  ],

  // Positive nouns - Abstract
  [
    "happiness",
    {
      word: "happiness",
      disposition: "positive",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "joy",
    {
      word: "joy",
      disposition: "positive",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],

  // Positive nouns - Concrete countable
  [
    "angel",
    {
      word: "angel",
      disposition: "positive",
      articleUsage: {
        standalone: getArticle("angel"),
        inArithmetic: getArticle("angel"),
        withAdjectives: getArticle("angel"),
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "flower",
    {
      word: "flower",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "plum",
    {
      word: "plum",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "summer's day",
    {
      word: "summer's day",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "hero",
    {
      word: "hero",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "rose",
    {
      word: "rose",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "kingdom",
    {
      word: "kingdom",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "pony",
    {
      word: "pony",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "cat",
    {
      word: "cat",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "town",
    {
      word: "town",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "purse",
    {
      word: "purse",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "sky",
    {
      word: "sky",
      disposition: "positive",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "concrete",
      countable: false,
    },
  ],
  [
    "hamster",
    {
      word: "hamster",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "nose",
    {
      word: "nose",
      disposition: "positive",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],

  // Negative nouns - Proper
  [
    "Hell",
    {
      word: "Hell",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "none",
      },
      nounType: "proper",
      countable: false,
    },
  ],
  [
    "Microsoft",
    {
      word: "Microsoft",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "none",
      },
      nounType: "proper",
      countable: false,
    },
  ],

  // Negative nouns - Abstract
  [
    "death",
    {
      word: "death",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "hate",
    {
      word: "hate",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "war",
    {
      word: "war",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "plague",
    {
      word: "plague",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "famine",
    {
      word: "famine",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "none",
        withAdjectives: "a",
      },
      nounType: "abstract",
      countable: true,
    },
  ],
  [
    "starvation",
    {
      word: "starvation",
      disposition: "negative",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "curse",
    {
      word: "curse",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "lie",
    {
      word: "lie",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],

  // Negative nouns - Concrete countable
  [
    "bastard",
    {
      word: "bastard",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "beggar",
    {
      word: "beggar",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "blister",
    {
      word: "blister",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "codpiece",
    {
      word: "codpiece",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "coward",
    {
      word: "coward",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "devil",
    {
      word: "devil",
      disposition: "negative",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "concrete",
      countable: false,
    },
  ],
  [
    "draught",
    {
      word: "draught",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "flirt-gill",
    {
      word: "flirt-gill",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "goat",
    {
      word: "goat",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "hog",
    {
      word: "hog",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "hound",
    {
      word: "hound",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "leech",
    {
      word: "leech",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "pig",
    {
      word: "pig",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "toad",
    {
      word: "toad",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "wolf",
    {
      word: "wolf",
      disposition: "negative",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],

  // Neutral nouns - mostly concrete countable
  [
    "animal",
    {
      word: "animal",
      disposition: "neutral",
      articleUsage: {
        standalone: getArticle("animal"),
        inArithmetic: getArticle("animal"),
        withAdjectives: getArticle("animal"),
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "aunt",
    {
      word: "aunt",
      disposition: "neutral",
      articleUsage: {
        standalone: getArticle("aunt"),
        inArithmetic: getArticle("aunt"),
        withAdjectives: getArticle("aunt"),
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "brother",
    {
      word: "brother",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "chihuahua",
    {
      word: "chihuahua",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "cousin",
    {
      word: "cousin",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "cow",
    {
      word: "cow",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "daughter",
    {
      word: "daughter",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "dog",
    {
      word: "dog",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "door",
    {
      word: "door",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "face",
    {
      word: "face",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "father",
    {
      word: "father",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "fellow",
    {
      word: "fellow",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "granddaughter",
    {
      word: "granddaughter",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "grandfather",
    {
      word: "grandfather",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "grandmother",
    {
      word: "grandmother",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "grandson",
    {
      word: "grandson",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "hair",
    {
      word: "hair",
      disposition: "neutral",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "horse",
    {
      word: "horse",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "lamp",
    {
      word: "lamp",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "lantern",
    {
      word: "lantern",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "mistletoe",
    {
      word: "mistletoe",
      disposition: "neutral",
      articleUsage: {
        standalone: "none",
        inArithmetic: "none",
        withAdjectives: "required",
      },
      nounType: "abstract",
      countable: false,
    },
  ],
  [
    "moon",
    {
      word: "moon",
      disposition: "neutral",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "concrete",
      countable: false,
    },
  ],
  [
    "morning",
    {
      word: "morning",
      disposition: "neutral",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "concrete",
      countable: false,
    },
  ],
  [
    "mother",
    {
      word: "mother",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "nephew",
    {
      word: "nephew",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "niece",
    {
      word: "niece",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "road",
    {
      word: "road",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "roman",
    {
      word: "roman",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "sister",
    {
      word: "sister",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "son",
    {
      word: "son",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "squirrel",
    {
      word: "squirrel",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "stone wall",
    {
      word: "stone wall",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "thing",
    {
      word: "thing",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "tree",
    {
      word: "tree",
      disposition: "neutral",
      articleUsage: {
        standalone: "a",
        inArithmetic: "a",
        withAdjectives: "a",
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "uncle",
    {
      word: "uncle",
      disposition: "neutral",
      articleUsage: {
        standalone: getArticle("uncle"),
        inArithmetic: getArticle("uncle"),
        withAdjectives: getArticle("uncle"),
      },
      nounType: "concrete",
      countable: true,
    },
  ],
  [
    "wind",
    {
      word: "wind",
      disposition: "neutral",
      articleUsage: {
        standalone: "the",
        inArithmetic: "the",
        withAdjectives: "the",
      },
      nounType: "concrete",
      countable: false,
    },
  ],
]);

// Generate noun lists by filtering by disposition
export const positive_nouns = Array.from(nounDatabase.entries())
  .filter(([_, props]) => props.disposition === "positive")
  .map(([noun, _]) => noun);

export const negative_nouns = Array.from(nounDatabase.entries())
  .filter(([_, props]) => props.disposition === "negative")
  .map(([noun, _]) => noun);

export const neutral_nouns = Array.from(nounDatabase.entries())
  .filter(([_, props]) => props.disposition === "neutral")
  .map(([noun, _]) => noun);

// Export helper function to get article for a given noun and context
export function getArticleForNoun(
  noun: string,
  context: UsageContext,
  hasAdjectives: boolean,
  firstWord?: string,
): string | undefined {
  const nounInfo = nounDatabase.get(noun);

  if (!nounInfo) {
    // Default behavior for unknown nouns
    if (context === UsageContext.DIRECT_ASSIGNMENT) {
      return undefined; // No article for direct assignments
    }
    return hasAdjectives || context === UsageContext.ASSIGNMENT
      ? getArticle(firstWord || noun)
      : undefined;
  }

  let articleType: ArticleType;

  if (hasAdjectives && nounInfo.articleUsage.withAdjectives === "required") {
    // Abstract nouns need articles when modified by adjectives
    return getArticle(firstWord || noun);
  }

  switch (context) {
    case UsageContext.ARITHMETIC_OPERAND:
      articleType = nounInfo.articleUsage.inArithmetic;
      break;
    case UsageContext.WITH_ADJECTIVES:
      articleType = nounInfo.articleUsage.withAdjectives;
      break;
    case UsageContext.DIRECT_ASSIGNMENT:
      return undefined; // Never use articles in direct assignments
    case UsageContext.ASSIGNMENT:
    case UsageContext.COMPARISON:
    default:
      articleType = nounInfo.articleUsage.standalone;
  }

  if (articleType === "none") {
    return undefined;
  } else if (articleType === "required") {
    return getArticle(firstWord || noun);
  } else if (articleType === "a" || articleType === "an") {
    // For concrete nouns, determine 'a' vs 'an' based on the first word
    return getArticle(firstWord || noun);
  } else {
    return articleType; // 'the'
  }
}

export enum UsageContext {
  ASSIGNMENT = "assignment", // "You are X"
  ARITHMETIC_OPERAND = "arithmetic", // "sum of X and Y"
  COMPARISON = "comparison", // "as good as X"
  WITH_ADJECTIVES = "with_adj", // "pretty little X"
}

export type ArticleType = "a" | "an" | "the" | "none" | "required";

export type NounProperties = {
  word: string;
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
      articleUsage: {
        standalone: "the",
        inArithmetic: "none",
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
      articleUsage: {
        standalone: "the",
        inArithmetic: "none",
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

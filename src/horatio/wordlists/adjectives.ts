export type Disposition = "positive" | "negative" | "neutral";

export enum RelationalCategory {
  OPINION = 1,
  SIZE = 2,
  PHYSICAL_QUALITY = 3,
  SHAPE = 4,
  AGE = 5,
  COLOUR = 6,
  ORIGIN = 7,
  MATERIAL = 8,
  TYPE = 9,
  PURPOSE = 10,
}

export type AdjectiveProperties = {
  word: string;
  disposition: Disposition;
  relationalCategory: RelationalCategory;
};

// Helper function to get category order for sorting
export function getCategoryOrder(category: RelationalCategory): number {
  return category; // The enum values are already numbered 1-10
}

// Create adjective database with all adjectives from wordlists
export const adjectiveDatabase: Map<string, AdjectiveProperties> = new Map([
  // Positive adjectives
  [
    "amazing",
    {
      word: "amazing",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "beautiful",
    {
      word: "beautiful",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "blossoming",
    {
      word: "blossoming",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "bold",
    {
      word: "bold",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "brave",
    {
      word: "brave",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "charming",
    {
      word: "charming",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "clearest",
    {
      word: "clearest",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "cunning",
    {
      word: "cunning",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "cute",
    {
      word: "cute",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "delicious",
    {
      word: "delicious",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "embroidered",
    {
      word: "embroidered",
      disposition: "positive",
      relationalCategory: RelationalCategory.MATERIAL,
    },
  ],
  [
    "fair",
    {
      word: "fair",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "fine",
    {
      word: "fine",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "gentle",
    {
      word: "gentle",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "golden",
    {
      word: "golden",
      disposition: "positive",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "good",
    {
      word: "good",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "handsome",
    {
      word: "handsome",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "happy",
    {
      word: "happy",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "healthy",
    {
      word: "healthy",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "honest",
    {
      word: "honest",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "little",
    {
      word: "little",
      disposition: "positive",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "lovely",
    {
      word: "lovely",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "loving",
    {
      word: "loving",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "mighty",
    {
      word: "mighty",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "noble",
    {
      word: "noble",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "old",
    {
      word: "old",
      disposition: "positive",
      relationalCategory: RelationalCategory.AGE,
    },
  ],
  [
    "peaceful",
    {
      word: "peaceful",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "pretty",
    {
      word: "pretty",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "prompt",
    {
      word: "prompt",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "proud",
    {
      word: "proud",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "reddest",
    {
      word: "reddest",
      disposition: "positive",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "rich",
    {
      word: "rich",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "rural",
    {
      word: "rural",
      disposition: "positive",
      relationalCategory: RelationalCategory.ORIGIN,
    },
  ],
  [
    "smooth",
    {
      word: "smooth",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "sunny",
    {
      word: "sunny",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "sweet",
    {
      word: "sweet",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "sweetest",
    {
      word: "sweetest",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "trustworthy",
    {
      word: "trustworthy",
      disposition: "positive",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "tiny",
    {
      word: "tiny",
      disposition: "positive",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "warm",
    {
      word: "warm",
      disposition: "positive",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "white",
    {
      word: "white",
      disposition: "positive",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],

  // Negative adjectives
  [
    "bad",
    {
      word: "bad",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "big",
    {
      word: "big",
      disposition: "negative",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "cowardly",
    {
      word: "cowardly",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "cursed",
    {
      word: "cursed",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "damned",
    {
      word: "damned",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "dirty",
    {
      word: "dirty",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "disgusting",
    {
      word: "disgusting",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "distasteful",
    {
      word: "distasteful",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "dusty",
    {
      word: "dusty",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "evil",
    {
      word: "evil",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "fat",
    {
      word: "fat",
      disposition: "negative",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "fat-kidneyed",
    {
      word: "fat-kidneyed",
      disposition: "negative",
      relationalCategory: RelationalCategory.SHAPE,
    },
  ],
  [
    "fatherless",
    {
      word: "fatherless",
      disposition: "negative",
      relationalCategory: RelationalCategory.TYPE,
    },
  ],
  [
    "foul",
    {
      word: "foul",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "hairy",
    {
      word: "hairy",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "half-witted",
    {
      word: "half-witted",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "horrible",
    {
      word: "horrible",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "horrid",
    {
      word: "horrid",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "infected",
    {
      word: "infected",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "lying",
    {
      word: "lying",
      disposition: "negative",
      relationalCategory: RelationalCategory.PURPOSE,
    },
  ],
  [
    "miserable",
    {
      word: "miserable",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "misused",
    {
      word: "misused",
      disposition: "negative",
      relationalCategory: RelationalCategory.TYPE,
    },
  ],
  [
    "oozing",
    {
      word: "oozing",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "rotten",
    {
      word: "rotten",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "smelly",
    {
      word: "smelly",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "snotty",
    {
      word: "snotty",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "sorry",
    {
      word: "sorry",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "stinking",
    {
      word: "stinking",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "stuffed",
    {
      word: "stuffed",
      disposition: "negative",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "stupid",
    {
      word: "stupid",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "vile",
    {
      word: "vile",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "villainous",
    {
      word: "villainous",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "worried",
    {
      word: "worried",
      disposition: "negative",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],

  // Neutral adjectives
  [
    "black",
    {
      word: "black",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "blue",
    {
      word: "blue",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "bluest",
    {
      word: "bluest",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "bottomless",
    {
      word: "bottomless",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "furry",
    {
      word: "furry",
      disposition: "neutral",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "green",
    {
      word: "green",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "hard",
    {
      word: "hard",
      disposition: "neutral",
      relationalCategory: RelationalCategory.PHYSICAL_QUALITY,
    },
  ],
  [
    "huge",
    {
      word: "huge",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "large",
    {
      word: "large",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "little",
    {
      word: "little",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "normal",
    {
      word: "normal",
      disposition: "neutral",
      relationalCategory: RelationalCategory.OPINION,
    },
  ],
  [
    "old",
    {
      word: "old",
      disposition: "neutral",
      relationalCategory: RelationalCategory.AGE,
    },
  ],
  [
    "purple",
    {
      word: "purple",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "red",
    {
      word: "red",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
  [
    "small",
    {
      word: "small",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "tiny",
    {
      word: "tiny",
      disposition: "neutral",
      relationalCategory: RelationalCategory.SIZE,
    },
  ],
  [
    "yellow",
    {
      word: "yellow",
      disposition: "neutral",
      relationalCategory: RelationalCategory.COLOUR,
    },
  ],
]);

// Generate adjective lists by filtering by disposition
export const positive_adjectives = Array.from(adjectiveDatabase.entries())
  .filter(([_, props]) => props.disposition === "positive")
  .map(([adj, _]) => adj);

export const negative_adjectives = Array.from(adjectiveDatabase.entries())
  .filter(([_, props]) => props.disposition === "negative")
  .map(([adj, _]) => adj);

export const neutral_adjectives = Array.from(adjectiveDatabase.entries())
  .filter(([_, props]) => props.disposition === "neutral")
  .map(([adj, _]) => adj);

// Function to sort adjectives by their relational category
export function sortAdjectivesByCategory(adjectives: string[]): string[] {
  return adjectives.sort((a, b) => {
    const aProps = adjectiveDatabase.get(a);
    const bProps = adjectiveDatabase.get(b);

    if (!aProps || !bProps) return 0;

    const categoryDiff =
      getCategoryOrder(aProps.relationalCategory) -
      getCategoryOrder(bProps.relationalCategory);

    // If same category, sort alphabetically
    if (categoryDiff === 0) {
      return a.localeCompare(b);
    }

    return categoryDiff;
  });
}

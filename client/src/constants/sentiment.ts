// Mirrors config.SentimentOptions in jobs/news-ingest/internal/config/config.go — keep in sync.
export const SENTIMENT_OPTIONS = [
  "Optimistic",
  "Positive",
  "Stable",
  "Pessimistic",
  "Negative",
  "Inconsistent",
  "Cautious",
  "Neutral",
] as const;

export type Sentiment = (typeof SENTIMENT_OPTIONS)[number];

export type SentimentCategory = "Positive" | "Negative" | "Neutral";

// Maps each user-facing category to every underlying Gemini sentiment value it covers, so
// filtering by "Positive" also matches articles scored as Optimistic/Stable, etc.
export const SENTIMENT_CATEGORY_MEMBERS: Record<SentimentCategory, Sentiment[]> = {
  Positive: ["Optimistic", "Positive", "Stable"],
  Negative: ["Pessimistic", "Negative", "Inconsistent", "Cautious"],
  Neutral: ["Neutral"],
};

export const SENTIMENT_CATEGORIES = Object.keys(SENTIMENT_CATEGORY_MEMBERS) as SentimentCategory[];

export const getSentimentCategory = (sentiment: string): SentimentCategory =>
  SENTIMENT_CATEGORIES.find((category) =>
    SENTIMENT_CATEGORY_MEMBERS[category].includes(sentiment as Sentiment),
  ) ?? "Neutral";

export const getSentimentBadgeVariant = (sentiment: string): "positive" | "negative" | "neutral" =>
  getSentimentCategory(sentiment).toLowerCase() as "positive" | "negative" | "neutral";

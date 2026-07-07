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

const POSITIVE_SENTIMENTS: Sentiment[] = ["Optimistic", "Positive", "Stable"];
const NEGATIVE_SENTIMENTS: Sentiment[] = ["Pessimistic", "Negative", "Inconsistent", "Cautious"];

export const getSentimentBadgeVariant = (sentiment: string): "positive" | "negative" | "neutral" => {
  if (POSITIVE_SENTIMENTS.includes(sentiment as Sentiment)) return "positive";
  if (NEGATIVE_SENTIMENTS.includes(sentiment as Sentiment)) return "negative";
  return "neutral";
};

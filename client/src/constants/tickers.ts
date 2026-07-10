export const FALLBACK_TICKERS = [
  "AAPL",
  "NVDA",
  "MSFT",
  "AMZN",
  "GOOGL",
  "TSLA",
  "META",
  "NFLX",
  "JPM",
  "AMD",
  "V",
  "PYPL",
  "QCOM",
  "AVGO",
  "MU",
];

export const sanitizeTickers = (
  value: readonly string[] | undefined,
  fallback: readonly string[] = FALLBACK_TICKERS,
): string[] => {
  if (!value) {
    return [...fallback];
  }

  const tickers = Array.from(
    new Set(
      value
        .map((ticker) => ticker.trim().toUpperCase())
        .filter(Boolean),
    ),
  );

  return tickers.length > 0 ? tickers : [...fallback];
};

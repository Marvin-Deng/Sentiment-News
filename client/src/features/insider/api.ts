import { InsiderSentiment, InsiderTransaction } from "@/src/features/insider/types";
import { fetchJson } from "@/src/utils/fetchJson";
import { getCached, setCached } from "@/src/utils/sessionCache";

const INSIDER_TTL_SECONDS = 86400;

export const fetchInsiderSentiment = async (
  symbol: string,
  from: string,
  to: string,
): Promise<InsiderSentiment[]> => {
  const cacheKey = `insider-sentiment:${symbol}:${from}:${to}`;
  const cached = getCached<InsiderSentiment[]>(cacheKey);
  if (cached) return cached;

  const { insider_sentiment } = await fetchJson<{ insider_sentiment: InsiderSentiment[] }>(
    `/api/stock/insider_sentiment?symbol=${symbol}&from=${from}&to=${to}`,
    undefined,
    "fetchInsiderSentiment",
  );
  setCached(cacheKey, insider_sentiment, INSIDER_TTL_SECONDS);
  return insider_sentiment;
};

export const fetchInsiderTransactions = async (
  symbol: string,
  from?: string,
  to?: string,
): Promise<InsiderTransaction[]> => {
  const cacheKey = `insider-transactions:${symbol}:${from ?? ""}:${to ?? ""}`;
  const cached = getCached<InsiderTransaction[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ symbol });
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { insider_transactions } = await fetchJson<{ insider_transactions: InsiderTransaction[] }>(
    `/api/stock/insider_transactions?${params.toString()}`,
    undefined,
    "fetchInsiderTransactions",
  );
  setCached(cacheKey, insider_transactions, INSIDER_TTL_SECONDS);
  return insider_transactions;
};

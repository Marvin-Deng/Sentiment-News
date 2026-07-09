import { InsiderSentiment, InsiderTransaction } from "@/src/features/insider/types";
import { getCached, setCached } from "@/src/utils/sessionCache";

const INSIDER_TTL_SECONDS = 3600;

export const fetchInsiderSentiment = async (
  symbol: string,
  from: string,
  to: string,
): Promise<InsiderSentiment[]> => {
  const cacheKey = `insider-sentiment:${symbol}:${from}:${to}`;
  const cached = getCached<InsiderSentiment[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `/api/stock/insider_sentiment?symbol=${symbol}&from=${from}&to=${to}`,
  );
  if (!res.ok) throw new Error(`fetchInsiderSentiment failed: ${res.status}`);
  const { insider_sentiment } = await res.json();
  setCached(cacheKey, insider_sentiment, INSIDER_TTL_SECONDS);
  return insider_sentiment as InsiderSentiment[];
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

  const res = await fetch(`/api/stock/insider_transactions?${params.toString()}`);
  if (!res.ok) throw new Error(`fetchInsiderTransactions failed: ${res.status}`);
  const { insider_transactions } = await res.json();
  setCached(cacheKey, insider_transactions, INSIDER_TTL_SECONDS);
  return insider_transactions as InsiderTransaction[];
};

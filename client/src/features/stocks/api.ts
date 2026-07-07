import { PriceData } from "@/src/features/stocks/types";

export type QuoteInfo = {
  ticker: string;
  current: number;
  change: number;
  percent: number;
};

export const fetchEodData = async (ticker: string, startDate: Date): Promise<PriceData[]> => {
  const params = new URLSearchParams({ ticker, start_date: startDate.toISOString() });
  const res = await fetch(`/api/stock/eod?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchEodData failed: ${res.status}`);
  const { eod_data } = await res.json();
  return eod_data as PriceData[];
};

export const fetchQuoteInfo = async (ticker: string): Promise<QuoteInfo> => {
  const res = await fetch(`/api/stock/quote?ticker=${ticker}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchQuoteInfo failed: ${res.status}`);
  const { quoteInfo } = await res.json();
  return quoteInfo as QuoteInfo;
};

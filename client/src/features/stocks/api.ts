"use server";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type EodDataPoint = {
  date: Date;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  adjOpen: number;
  adjHigh: number;
  adjLow: number;
  adjClose: number;
  adjVolume: number;
  divCash: number;
  splitFactor: number;
};

export type QuoteInfo = {
  ticker: string;
  current: number;
  change: number;
  percent: number;
};

export const fetchEodData = async (ticker: string, startDate: Date): Promise<EodDataPoint[]> => {
  const params = new URLSearchParams({ ticker, start_date: startDate.toISOString() });
  const res = await fetch(`${base}/api/stock/eod?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchEodData failed: ${res.status}`);
  const { eod_data } = await res.json();
  return eod_data as EodDataPoint[];
};

export const fetchQuoteInfo = async (ticker: string): Promise<QuoteInfo> => {
  const res = await fetch(`${base}/api/stock/quote?ticker=${ticker}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchQuoteInfo failed: ${res.status}`);
  const { quoteInfo } = await res.json();
  return quoteInfo as QuoteInfo;
};

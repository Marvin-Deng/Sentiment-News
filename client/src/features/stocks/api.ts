import { CompanyProfile, PriceData } from "@/src/features/stocks/types";
import { getCached, setCached } from "@/src/utils/sessionCache";

export type QuoteInfo = {
  ticker: string;
  current: number;
  change: number;
  percent: number;
};

const PROFILE_TTL_SECONDS = 3600;

export const fetchCompanyProfile = async (ticker: string): Promise<CompanyProfile> => {
  const cacheKey = `stock-profile:${ticker}`;
  const cached = getCached<CompanyProfile>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/stock/company_profile?ticker=${ticker}`);
  if (!res.ok) throw new Error(`fetchCompanyProfile failed: ${res.status}`);
  const { company_profile } = await res.json();
  setCached(cacheKey, company_profile, PROFILE_TTL_SECONDS);
  return company_profile as CompanyProfile;
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

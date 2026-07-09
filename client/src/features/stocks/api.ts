import { BasicFinancials, CompanyProfile, EpsSurprise, PriceData, QuoteInfo } from "@/src/features/stocks/types";
import { getCached, setCached } from "@/src/utils/sessionCache";

const PROFILE_TTL_SECONDS = 3600;
const FINANCIALS_TTL_SECONDS = 86400;
const EPS_SURPRISES_TTL_SECONDS = 86400;
const EOD_TTL_SECONDS = 7200;
const EOD_MAX_LOOKBACK_YEARS = 5;

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

export const fetchBasicFinancials = async (ticker: string): Promise<BasicFinancials> => {
  const cacheKey = `stock-basic-financials:${ticker}`;
  const cached = getCached<BasicFinancials>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/stock/basic_financials?ticker=${ticker}`);
  if (!res.ok) throw new Error(`fetchBasicFinancials failed: ${res.status}`);
  const { basic_financials } = await res.json();
  setCached(cacheKey, basic_financials, FINANCIALS_TTL_SECONDS);
  return basic_financials as BasicFinancials;
};

export const fetchEpsSurprises = async (ticker: string): Promise<EpsSurprise[]> => {
  const cacheKey = `stock-eps-surprises:${ticker}`;
  const cached = getCached<EpsSurprise[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/stock/eps_surprises?ticker=${ticker}`);
  if (!res.ok) throw new Error(`fetchEpsSurprises failed: ${res.status}`);
  const { eps_surprises } = await res.json();
  setCached(cacheKey, eps_surprises, EPS_SURPRISES_TTL_SECONDS);
  return eps_surprises as EpsSurprise[];
};

const filterFromDate = (eodData: PriceData[], startDate: Date): PriceData[] =>
  eodData.filter((point) => new Date(point.date) >= startDate);

export const fetchEodData = async (ticker: string, startDate: Date): Promise<PriceData[]> => {
  const cacheKey = `stock-eod:${ticker}`;
  const cached = getCached<PriceData[]>(cacheKey);
  if (cached && new Date(cached[0]?.date ?? 0) <= startDate) return filterFromDate(cached, startDate);

  const fetchFromDate = new Date();
  fetchFromDate.setFullYear(fetchFromDate.getFullYear() - EOD_MAX_LOOKBACK_YEARS);
  const params = new URLSearchParams({ ticker, start_date: fetchFromDate.toISOString() });
  const res = await fetch(`/api/stock/eod?${params}`);
  if (!res.ok) throw new Error(`fetchEodData failed: ${res.status}`);
  const { eod_data } = await res.json();
  setCached(cacheKey, eod_data, EOD_TTL_SECONDS);
  return filterFromDate(eod_data as PriceData[], startDate);
};

export const fetchQuoteInfo = async (ticker: string): Promise<QuoteInfo> => {
  const res = await fetch(`/api/stock/quote?ticker=${ticker}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchQuoteInfo failed: ${res.status}`);
  const { quoteInfo } = await res.json();
  return quoteInfo as QuoteInfo;
};

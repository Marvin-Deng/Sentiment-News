import { BasicFinancials, CompanyProfile, EpsSurprise, PriceData, QuoteInfo } from "@/src/features/stocks/types";
import { fetchJson } from "@/src/utils/fetchJson";
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

  const { company_profile } = await fetchJson<{ company_profile: CompanyProfile }>(
    `/api/stock/company_profile?ticker=${ticker}`,
    undefined,
    "fetchCompanyProfile",
  );
  setCached(cacheKey, company_profile, PROFILE_TTL_SECONDS);
  return company_profile;
};

export const fetchBasicFinancials = async (ticker: string): Promise<BasicFinancials> => {
  const cacheKey = `stock-basic-financials:${ticker}`;
  const cached = getCached<BasicFinancials>(cacheKey);
  if (cached) return cached;

  const { basic_financials } = await fetchJson<{ basic_financials: BasicFinancials }>(
    `/api/stock/basic_financials?ticker=${ticker}`,
    undefined,
    "fetchBasicFinancials",
  );
  setCached(cacheKey, basic_financials, FINANCIALS_TTL_SECONDS);
  return basic_financials;
};

export const fetchEpsSurprises = async (ticker: string): Promise<EpsSurprise[]> => {
  const cacheKey = `stock-eps-surprises:${ticker}`;
  const cached = getCached<EpsSurprise[]>(cacheKey);
  if (cached) return cached;

  const { eps_surprises } = await fetchJson<{ eps_surprises: EpsSurprise[] }>(
    `/api/stock/eps_surprises?ticker=${ticker}`,
    undefined,
    "fetchEpsSurprises",
  );
  setCached(cacheKey, eps_surprises, EPS_SURPRISES_TTL_SECONDS);
  return eps_surprises;
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
  const { eod_data } = await fetchJson<{ eod_data: PriceData[] }>(
    `/api/stock/eod?${params}`,
    undefined,
    "fetchEodData",
  );
  setCached(cacheKey, eod_data, EOD_TTL_SECONDS);
  return filterFromDate(eod_data, startDate);
};

export const fetchQuoteInfo = async (ticker: string): Promise<QuoteInfo> => {
  const { quoteInfo } = await fetchJson<{ quoteInfo: QuoteInfo }>(
    `/api/stock/quote?ticker=${ticker}`,
    { cache: "no-store" },
    "fetchQuoteInfo",
  );
  return quoteInfo;
};

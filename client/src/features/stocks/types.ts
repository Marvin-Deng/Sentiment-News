export type StockInfo = {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
};

export type PriceData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjOpen: number;
  adjHigh: number;
  adjLow: number;
  adjClose: number;
  adjVolume: number;
  divCash: number;
  splitFactor: number;
};

export type CompanyProfile = {
  country: string;
  currency: string;
  exchange: string;
  name: string;
  ticker: string;
  weburl: string;
  logo: string;
};

export type BasicFinancials = {
  "10DayAverageTradingVolume"?: number;
  "52WeekHigh"?: number;
  "52WeekLow"?: number;
  "52WeekLowDate"?: string;
  "52WeekHighDate"?: string;
  beta?: number;
  marketCapitalization?: number;
  peBasicExclExtraTTM?: number;
  epsBasicExclExtraItemsTTM?: number;
  netMarginTTM?: number;
  grossMarginTTM?: number;
  operatingMarginTTM?: number;
  roeTTM?: number;
  roaTTM?: number;
  dividendYieldIndicatedAnnual?: number;
  currentRatioAnnual?: number;
  [key: string]: number | string | undefined;
};

export type EpsSurprise = {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
};

export type FinnhubNewsItem = {
  headline: string;
  url: string;
  image: string;
  summary: string;
  source: string;
  datetime: number;
};

export type QuoteInfo = {
  ticker: string;
  current: number;
  change: number;
  percent: number;
};

export const DEFAULT_PRICE_DATA: PriceData = {
  date: "",
  open: 0,
  high: 0,
  low: 0,
  close: 0,
  volume: 0,
  adjOpen: 0,
  adjHigh: 0,
  adjLow: 0,
  adjClose: 0,
  adjVolume: 0,
  divCash: 0,
  splitFactor: 0,
};

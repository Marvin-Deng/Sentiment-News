export interface StockInfo {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  name: string;
  ticker: string;
  weburl: string;
  logo: string;
}

export interface QuoteInfo {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export type InsiderSentiment = {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
};

export type InsiderTransaction = {
  symbol: string;
  name: string;
  share: number;
  change: number;
  filingDate: string;
  transactionDate: string;
  transactionCode: string;
  transactionPrice?: number;
};

export type SentimentChartPoint = InsiderSentiment & { label: string };

export type ChartPoint = {
  date: Date | string;
  close: number;
  open?: number;
  low?: number;
  high?: number;
  volume?: number;
  adjOpen?: number;
  adjHigh?: number;
  adjLow?: number;
  adjClose?: number;
  adjVolume?: number;
  divCash?: number;
  splitFactor?: number;
  tradeInfo?: {
    netChange: number;
    buyChange: number;
    sellChange: number;
    buyCount: number;
    sellCount: number;
    transactionDate: Date;
    trades: Array<{
      name: string;
      change: number;
      isBuy: boolean;
      tradePrice?: number;
    }>;
  };
};

export type ChangeSort = "default" | "asc" | "desc";

export const TRANSACTION_CODE_LABELS: Record<string, string> = {
  P: "Purchase",
  S: "Sale",
  A: "Grant",
  M: "Exercise",
  G: "Gift",
  F: "Tax payment",
  C: "Conversion",
  X: "Other",
};

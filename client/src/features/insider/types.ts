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

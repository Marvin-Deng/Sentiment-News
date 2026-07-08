export type IpoEvent = {
  date: string;
  exchange: string;
  name: string;
  numberOfShares: number;
  price: string;
  status: "expected" | "priced" | "withdrawn" | "filed";
  symbol: string;
  totalSharesValue: number;
};

export type EarningsEvent = {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: "bmo" | "amc" | "dmh" | "";
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
};

export type DayEvents = {
  date: string;
  ipos: IpoEvent[];
  earnings: EarningsEvent[];
};

export const HOUR_LABELS: Record<string, string> = {
  bmo: "Before Market Open",
  amc: "After Market Close",
  dmh: "During Market Hours",
};

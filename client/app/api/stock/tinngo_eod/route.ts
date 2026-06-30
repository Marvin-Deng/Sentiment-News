import { NextResponse } from "next/server";
import { EodDataPoint } from "@/src/features/stocks/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "AAPL";
  const startDate = new Date(searchParams.get("start_date") ?? Date.now());

  // TODO: replace with real Tiingo API call using env var TIINGO_API_KEY
  // const res = await fetch(`https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=...&token=${process.env.TIINGO_API_KEY}`)
  const eod_data: EodDataPoint[] = Array.from({ length: 12 }).map((_, i) => ({
    date: new Date(startDate.getTime() + i * 86400000 * 30),
    open: 100 + i,
    close: 100 + i + (i % 2 === 0 ? 2 : -1),
    low: 95 + i,
    high: 105 + i,
    volume: 1000000 + i * 1000,
    adjOpen: 100 + i,
    adjHigh: 105 + i,
    adjLow: 95 + i,
    adjClose: 100 + i + (i % 2 === 0 ? 2 : -1),
    adjVolume: 1000000 + i * 1000,
    divCash: 0,
    splitFactor: 1,
  }));

  return NextResponse.json({ ticker, eod_data });
}

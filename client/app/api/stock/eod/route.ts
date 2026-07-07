import { NextResponse } from "next/server";
import { EodDataPoint } from "@/src/features/stocks/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "AAPL";
  const startDate = new Date(searchParams.get("start_date") ?? Date.now());

  try {
    const params = new URLSearchParams({
      startDate: startDate.toISOString().slice(0, 10),
      token: process.env.TIINGO_TOKEN ?? "",
    });
    const url = `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(ticker)}/prices?${params}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Tiingo eod request failed: ${res.status}`);

    const records = await res.json();
    const eod_data: EodDataPoint[] = records.map((record: Record<string, unknown>) => ({
      date: record.date,
      open: record.open,
      close: record.close,
      low: record.low,
      high: record.high,
      volume: record.volume,
      adjOpen: record.adjOpen,
      adjHigh: record.adjHigh,
      adjLow: record.adjLow,
      adjClose: record.adjClose,
      adjVolume: record.adjVolume,
      divCash: record.divCash,
      splitFactor: record.splitFactor,
    }));

    return NextResponse.json({ ticker, eod_data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

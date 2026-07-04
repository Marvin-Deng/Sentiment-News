import { NextResponse } from "next/server";
import { QuoteInfo } from "@/src/features/stocks/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "AAPL";

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Finnhub quote request failed: ${res.status}`);
    const data = await res.json();
    const quoteInfo: QuoteInfo = {
      ticker,
      current: data.c,
      change: parseFloat((data.c - data.o).toFixed(2)),
      percent: parseFloat((((data.c - data.o) / data.o) * 100).toFixed(2)),
    };
    return NextResponse.json({ quoteInfo });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

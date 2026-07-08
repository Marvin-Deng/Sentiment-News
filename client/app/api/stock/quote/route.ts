import { NextResponse } from "next/server";
import { QuoteInfo } from "@/src/features/stocks/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "AAPL";

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Finnhub quote request for ${ticker} failed: ${res.status} ${body}`);
    }
    const data = await res.json();
    const quoteInfo: QuoteInfo = {
      ticker,
      current: data.c,
      change: parseFloat(data.d?.toFixed(2) ?? "0"),
      percent: parseFloat(data.dp?.toFixed(2) ?? "0"),
    };
    return NextResponse.json({ quoteInfo });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

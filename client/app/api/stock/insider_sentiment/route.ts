import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!symbol || !from || !to) {
    return NextResponse.json({ error: "symbol, from, and to are required" }, { status: 400 });
  }

  try {
    const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${from}&to=${to}&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Finnhub insider sentiment request failed: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ insider_sentiment: data.data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

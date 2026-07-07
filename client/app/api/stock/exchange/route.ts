import { NextResponse } from "next/server";

// Finnhub's US symbol list is ~7MB, which exceeds Next.js's built-in fetch data-cache size limit
// (2MB) and causes the cached fetch itself to fail. Cache the parsed result in memory instead.
const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { stocks: unknown[]; expiresAt: number } | null = null;

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json({ stocks: cache.stocks });
  }

  try {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Finnhub exchange request failed: ${res.status}`);
    const data = await res.json();
    const stocks = data
      .filter((stock: { type: string }) => stock.type === "Common Stock")
      .sort((a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol));

    cache = { stocks, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json({ stocks });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

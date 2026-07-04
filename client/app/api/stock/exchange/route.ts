import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Finnhub exchange request failed: ${res.status}`);
    const data = await res.json();
    const stocks = data
      .filter((stock: { type: string }) => stock.type === "Common Stock")
      .sort((a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol));
    return NextResponse.json({ stocks });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ symbol, token: process.env.FINNHUB_KEY! });
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const url = `https://finnhub.io/api/v1/stock/insider-transactions?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Finnhub insider transactions request failed: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ insider_transactions: data.data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

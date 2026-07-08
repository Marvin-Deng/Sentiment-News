import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  try {
    const url = `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${process.env.FINNHUB_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Finnhub basic financials request failed: ${res.status}`);
    const data = await res.json();
    if (!data.metric) {
      throw new Error(`Finnhub has no basic financials data for ${ticker}`);
    }
    return NextResponse.json({ basic_financials: data.metric });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

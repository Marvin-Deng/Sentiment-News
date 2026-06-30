import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  try {
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY_1}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Finnhub company profile request failed: ${res.status}`);
    const company_profile = await res.json();
    return NextResponse.json({ company_profile });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

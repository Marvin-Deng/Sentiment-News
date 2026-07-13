import { NextResponse } from "next/server";

const RESULT_LIMIT = 5;

const mentionsCompany = (item: { headline?: string; summary?: string }, ticker: string, companyName: string) => {
  const text = `${item.headline ?? ""} ${item.summary ?? ""}`.toLowerCase();
  const tickerMatch = text.includes(ticker.toLowerCase());
  const nameMatch = companyName.length > 0 && text.includes(companyName.toLowerCase());
  return tickerMatch || nameMatch;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  try {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 14);
    const toStr = to.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);

    const [newsRes, profileRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromStr}&to=${toStr}&token=${process.env.FINNHUB_KEY}`,
        { next: { revalidate: 3600 } },
      ),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.FINNHUB_KEY}`, {
        next: { revalidate: 86400 },
      }),
    ]);
    if (!newsRes.ok) throw new Error(`Finnhub company news request failed: ${newsRes.status}`);
    const data = await newsRes.json();
    const profile = profileRes.ok ? await profileRes.json() : null;
    const companyName = profile?.name ?? "";

    const news = (Array.isArray(data) ? data : [])
      .filter((item) => item.source !== "chartmill")
      .filter((item) => mentionsCompany(item, ticker ?? "", companyName))
      .slice(0, RESULT_LIMIT);
    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Article } from "@/src/features/news/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "0");

  // TODO: replace with real DB query using searchParams (search_query, tickers, sentiment, price_action, end_date)
  const articles: Article[] = Array.from({ length: 10 }).map((_, idx) => {
    const i = page * 10 + idx + 1;
    return {
      title: `Mock Article ${i}`,
      publication_datetime: new Date().toISOString(),
      summary: `This is a mocked summary for article ${i}.`,
      ticker: ["AAPL", "MSFT", "GOOG"][i % 3],
      sentiment: ["Positive", "Negative", "Neutral"][i % 3],
      image_url:
        "https://s.yimg.com/lo/mysterio/api/a0bf0366bc1945d2666a528c8aabfe2d2722a58e367a943abaf3785d2f910373/lightyear_networkapi/resizefill_w1200;quality_80;format_webp/https:%2F%2Fd29szjachogqwa.cloudfront.net%2Fimages%2F2026-06%2F0c647efe-d902-44fc-9828-4dfd3eeb8552",
      article_url: "https://sg.news.yahoo.com/geopolitics-ai-spotlight-chinas-summer-024018490.html",
      market_date: new Date().toISOString().split("T")[0],
      open_price: 100 + i,
      close_price: 100 + i + (i % 2 === 0 ? 2 : -1),
    };
  });

  return NextResponse.json({ articles });
}

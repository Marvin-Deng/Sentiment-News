import { NextResponse } from "next/server";
import { Article } from "@/src/features/news/api";
import { getFirestore } from "@/lib/firestore";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "0");
  const searchQuery = searchParams.get("search_query")?.trim() ?? "";
  const tickersParam = searchParams.get("tickers") ?? "";
  const sentiment = searchParams.get("sentiment")?.trim() ?? "";
  const endDate = searchParams.get("end_date")?.trim() ?? "";

  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const db = getFirestore();
  let query: FirebaseFirestore.Query = db.collection("articles");

  if (tickers.length > 0 && tickers.length <= 10) {
    query = query.where("ticker", "in", tickers);
  }
  if (sentiment) {
    query = query.where("sentiment", "==", sentiment);
  }
  if (endDate) {
    query = query.where("publicationDatetime", "<=", endDate);
  }

  query = query
    .orderBy("publicationDatetime", "desc")
    .offset(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  const snapshot = await query.get();

  const tickerDocIds = Array.from(
    new Set(snapshot.docs.map((doc) => doc.get("tickerDocId")).filter(Boolean)),
  );
  const tickerDocs = await Promise.all(
    tickerDocIds.map((docId) => db.collection("tickers").doc(docId).get()),
  );
  const tickerById = new Map(tickerDocs.map((doc) => [doc.id, doc.data()]));

  let articles: Article[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    const tickerData = tickerById.get(data.tickerDocId) ?? {};
    return {
      title: data.title,
      publication_datetime: data.publicationDatetime,
      summary: data.summary,
      ticker: tickerData.ticker ?? data.ticker ?? "",
      sentiment: data.sentiment,
      image_url: data.imageUrl,
      article_url: data.articleUrl,
      market_date: tickerData.marketDate ?? "",
      open_price: tickerData.openPrice ?? null,
      close_price: tickerData.closePrice ?? null,
    };
  });

  if (searchQuery) {
    const lowered = searchQuery.toLowerCase();
    articles = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowered) ||
        article.summary.toLowerCase().includes(lowered),
    );
  }

  return NextResponse.json({ articles });
}

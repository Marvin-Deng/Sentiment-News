import { Firestore } from "@google-cloud/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST is not set — refusing to seed a real Firestore project.");
  process.exit(1);
}

const db = new Firestore({ projectId: "news-ingest-emulator" });

const tickers = [
  { docId: "AAPL_2026-07-01", ticker: "AAPL", marketDate: "2026-07-01", openPrice: 210.5, closePrice: 214.2 },
  { docId: "TSLA_2026-07-01", ticker: "TSLA", marketDate: "2026-07-01", openPrice: 245.0, closePrice: 238.75 },
  { docId: "NVDA_2026-07-01", ticker: "NVDA", marketDate: "2026-07-01", openPrice: 128.3, closePrice: 131.9 },
];

const articles = [
  {
    docId: "1001",
    articleId: 1001,
    title: "Apple unveils new product lineup",
    imageUrl: "https://placehold.co/600x400",
    articleUrl: "https://example.com/articles/1001",
    summary: "Apple announced a refreshed lineup at its summer event.",
    publicationDatetime: "2026-07-01 09:30:00",
    sentiment: "Positive",
    tickerDocId: "AAPL_2026-07-01",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    docId: "1002",
    articleId: 1002,
    title: "Tesla deliveries miss estimates",
    imageUrl: "https://placehold.co/600x400",
    articleUrl: "https://example.com/articles/1002",
    summary: "Tesla reported quarterly deliveries below analyst expectations.",
    publicationDatetime: "2026-07-01 10:15:00",
    sentiment: "Negative",
    tickerDocId: "TSLA_2026-07-01",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    docId: "1003",
    articleId: 1003,
    title: "Nvidia holds steady amid market volatility",
    imageUrl: "https://placehold.co/600x400",
    articleUrl: "https://example.com/articles/1003",
    summary: "Nvidia shares were flat as broader markets fluctuated.",
    publicationDatetime: "2026-07-01 11:00:00",
    sentiment: "Neutral",
    tickerDocId: "NVDA_2026-07-01",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

for (const { docId, ...data } of tickers) {
  await db.collection("tickers").doc(docId).set(data);
}

for (const { docId, ...data } of articles) {
  await db.collection("articles").doc(docId).set(data);
}

console.log(`Seeded ${tickers.length} tickers and ${articles.length} articles into the Firestore emulator.`);

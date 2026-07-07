"use server";

import { Sentiment } from "@/src/constants/sentiment";

export type Article = {
  title: string;
  publication_datetime: string;
  summary: string;
  ticker: string;
  sentiment: Sentiment;
  image_url: string;
  article_url: string;
  market_date: string;
  open_price: number;
  close_price: number;
};

export const fetchArticles = async (
  page: number,
  searchQuery: string,
  selectedTickers: string[],
  sentiment: string,
  priceAction: string,
  endDate: string,
): Promise<Article[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    search_query: searchQuery,
    tickers: selectedTickers.join(","),
    sentiment,
    price_action: priceAction,
    end_date: endDate,
  });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/article/news?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchArticles failed: ${res.status}`);
  const { articles } = await res.json();
  return articles as Article[];
};

import { fetchJson } from "@/src/utils/fetchJson";
import { Article } from "./types";

export const fetchArticles = async (
  page: number,
  searchQuery: string,
  selectedTickers: string[],
  sentiment: string,
  publicationDate: string,
  source: string,
): Promise<Article[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    search_query: searchQuery,
    tickers: selectedTickers.join(","),
    sentiment,
  });
  if (publicationDate) {
    params.set("publication_date", publicationDate);
  }
  if (source) {
    params.set("source", source);
  }
  const { articles } = await fetchJson<{ articles: Article[] }>(
    `/api/article/news?${params}`,
    { cache: "no-store" },
    "fetchArticles",
  );
  return articles;
};

export const fetchArticleSources = async (): Promise<string[]> => {
  const { sources } = await fetchJson<{ sources: string[] }>(
    "/api/article/sources",
    { cache: "no-store" },
    "fetchArticleSources",
  );
  return sources;
};

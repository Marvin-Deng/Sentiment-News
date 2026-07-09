import { fetchJson } from "@/src/utils/fetchJson";
import { Article } from "./types";

export const fetchArticles = async (
  page: number,
  searchQuery: string,
  selectedTickers: string[],
  sentiment: string,
  publicationDate: string,
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
  const { articles } = await fetchJson<{ articles: Article[] }>(
    `/api/article/news?${params}`,
    { cache: "no-store" },
    "fetchArticles",
  );
  return articles;
};

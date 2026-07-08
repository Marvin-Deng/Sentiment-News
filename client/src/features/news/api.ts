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
  const res = await fetch(`/api/article/news?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchArticles failed: ${res.status}`);
  const { articles } = await res.json();
  return articles as Article[];
};

import { Article, fetchArticles } from "./api";

export type NewsFilterParams = {
  page: number;
  searchQuery: string;
  selectedTickers: string[];
  sentiment: string;
  priceAction: string;
  endDate: string;
};

export const loadArticles = async ({
  page,
  searchQuery,
  selectedTickers,
  sentiment,
  priceAction,
  endDate,
}: NewsFilterParams): Promise<Article[]> => {
  return fetchArticles(page, searchQuery, selectedTickers, sentiment, priceAction, endDate);
};

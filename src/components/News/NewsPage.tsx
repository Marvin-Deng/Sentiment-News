"use client";
import { useState, useEffect, useContext } from "react";

import NewsCard from "@/src/components/News/NewsCard";
import Loader from "@/src/components/units/Loader";
import MultiSelectDropdown from "@/src/components/Dropdown/Multiselect";
import SingleSelectDropdown from "@/src/components/Dropdown/Singleselect";
import NextButton from "@/src/components/units/NextButton";

import { Article } from "@/src/types/Article";
import { SearchContext, SearchContextProps } from "@/src/providers/SearchProvider";
import { getDateDaysBefore } from "@/src/utils/dateUtils";
import { fetchTickerList } from "@/src/queries/stockQueries";
import { fetchArticles } from "@/src/queries/newsQueries";
import { useQueryNoRefetch } from "@/src/queries/queryHook";

const NewsDisplay = () => {
  // Page and loading info
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Selected filter options
  const { searchQuery } = useContext(SearchContext) as SearchContextProps;
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [selectedPriceAction, setSelectedPriceAction] = useState<number | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<number | null>(null);

  // Filter options
  const { data: tickerOptions } = useQueryNoRefetch("tickerList", fetchTickerList);
  const sentimentOptions = new Map<number, string>([
    [0, "Positive"],
    [1, "Negative"],
    [2, "Neutral"],
  ]);
  const priceActionOptions = new Map<number, string>([
    [0, "Positive"],
    [1, "Negative"],
    [2, "NA"],
  ]);
  const dateRangeOptions = new Map<number, string>([
    [0, "24 hours ago"],
    [1, "3 days ago"],
    [2, "1 week ago"],
  ]);
  const dateRanges = new Map<number, string>([
    [0, getDateDaysBefore(1)],
    [1, getDateDaysBefore(2)],
    [2, getDateDaysBefore(6)],
  ]);

  const getPageArticles = async (curr_page: number) => {
    const sentiment =
      selectedSentiment != null ? sentimentOptions.get(selectedSentiment) || "" : "";
    const priceAction =
      selectedPriceAction != null ? priceActionOptions.get(selectedPriceAction) || "" : "";
    const endDate = selectedDateRange != null ? dateRanges.get(selectedDateRange) || "" : "";

    const articles = await fetchArticles(
      curr_page,
      searchQuery,
      selectedTickers,
      sentiment,
      priceAction,
      endDate
    );

    return articles;
  };

  const getNewlyFilteredArticles = async () => {
    setLoading(true);
    setPage(0);
    const articles = await getPageArticles(0);
    setArticles(articles);
    setLoading(false);
  };

  const loadNextPageArticles = async () => {
    setLoadingMore(true);
    const articles = await getPageArticles(page + 1);
    setArticles((prevArticles) => [...prevArticles, ...articles]);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  useEffect(() => {
    getNewlyFilteredArticles();
  }, [selectedSentiment, selectedPriceAction, searchQuery, selectedDateRange]);

  return (
    <div className="max-w-screen-lg mx-auto mt-3 mb-20">
      <div className="mx-10">
        <div className="font-bold text-4xl sm:text-5xl mb-2">News</div>
        <div className="mt-3 text-xl">View the latest financial news</div>
        <div className="border-b border-gray-400 mb-8 mt-6" />
        <div className="flex flex-row items-center space-x-3">
          <MultiSelectDropdown
            selectName={"Stocks"}
            originalOptions={tickerOptions}
            selectedOptions={selectedTickers}
            setSelectedOptions={setSelectedTickers}
            handleSubmit={getNewlyFilteredArticles}
          />
          <SingleSelectDropdown
            placeholder={"Sentiment"}
            originalOptions={sentimentOptions}
            selectedOption={selectedSentiment}
            setSelectedOption={setSelectedSentiment}
          />
          <SingleSelectDropdown
            placeholder={"Price Action"}
            originalOptions={priceActionOptions}
            selectedOption={selectedPriceAction}
            setSelectedOption={setSelectedPriceAction}
          />
          <SingleSelectDropdown
            placeholder={"Date"}
            originalOptions={dateRangeOptions}
            selectedOption={selectedDateRange}
            setSelectedOption={setSelectedDateRange}
          />
        </div>

        {loading ? (
          <div className="fixed top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
              {articles &&
                articles.map((article: Article, index: number) => (
                  <NewsCard
                    key={index}
                    title={article.title}
                    publication_datetime={article.publication_datetime}
                    summary={article.summary}
                    ticker={article.ticker}
                    sentiment={article.sentiment}
                    image_url={article.image_url}
                    article_url={article.article_url}
                    market_date={article.market_date}
                    open_price={article.open_price}
                    close_price={article.close_price}
                  />
                ))}
            </div>

            <div className="flex justify-center mt-10">
              {loadingMore ? (
                <Loader />
              ) : articles && articles.length != 0 ? (
                <NextButton onClick={loadNextPageArticles} />
              ) : (
                <div>No Articles Available</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsDisplay;

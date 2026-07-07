"use client";
import { useState, useEffect, useContext } from "react";
import { SimpleGrid, Center, Text } from "@chakra-ui/react";

import NewsCard from "./NewsCard";
import Loader from "@/src/components/ui/loader";
import SearchBar from "@/src/components/Navbar/SearchBar";
import MultiSelectDropdown from "@/src/features/stocks/components/Multiselect";
import SingleSelectDropdown from "@/src/features/stocks/components/Singleselect";
import NextButton from "@/src/components/ui/next-button";
import PageLayout from "@/src/components/layout/PageLayout";

import { Article, fetchArticles } from "../api";
import { SearchContext, SearchContextProps } from "@/src/providers/SearchProvider";
import { getDateDaysBefore } from "@/src/utils/dateUtils";
import { SENTIMENT_OPTIONS } from "@/src/constants/sentiment";

interface NewsDisplayProps {
  initialTickerList: string[];
}

const NewsDisplay = ({ initialTickerList }: NewsDisplayProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { searchQuery } = useContext(SearchContext) as SearchContextProps;
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [selectedPriceAction, setSelectedPriceAction] = useState<number | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<number | null>(null);

  const sentimentOptions = new Map<number, string>(
    SENTIMENT_OPTIONS.map((option, index) => [index, option]),
  );
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
    return fetchArticles(curr_page, searchQuery, selectedTickers, sentiment, priceAction, endDate);
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

  const filters = (
    <>
      <MultiSelectDropdown
        selectName="Stocks"
        originalOptions={initialTickerList}
        selectedOptions={selectedTickers}
        setSelectedOptions={setSelectedTickers}
        handleSubmit={getNewlyFilteredArticles}
      />
      <SingleSelectDropdown
        placeholder="Sentiment"
        originalOptions={sentimentOptions}
        selectedOption={selectedSentiment}
        setSelectedOption={setSelectedSentiment}
      />
      <SingleSelectDropdown
        placeholder="Price Action"
        originalOptions={priceActionOptions}
        selectedOption={selectedPriceAction}
        setSelectedOption={setSelectedPriceAction}
      />
      <SingleSelectDropdown
        placeholder="Date"
        originalOptions={dateRangeOptions}
        selectedOption={selectedDateRange}
        setSelectedOption={setSelectedDateRange}
      />
    </>
  );

  return (
    <PageLayout
      title="News"
      subtitle="View the latest financial news"
      searchBar={<SearchBar />}
      filters={filters}
    >
      {loading ? (
        <Center position="fixed" top="66%" left="50%" transform="translate(-50%, -50%)">
          <Loader />
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} mt={8}>
            {articles.map((article: Article, index: number) => (
              <NewsCard key={index} {...article} />
            ))}
          </SimpleGrid>
          <Center mt={10}>
            {loadingMore ? (
              <Loader />
            ) : articles.length !== 0 ? (
              <NextButton onClick={loadNextPageArticles} />
            ) : (
              <Text>No Articles Available</Text>
            )}
          </Center>
        </>
      )}
    </PageLayout>
  );
};

export default NewsDisplay;

"use client";
import { useState, useEffect } from "react";
import { SimpleGrid, Button, Center, Text } from "@chakra-ui/react";

import NewsCard from "./NewsCard";
import Loader from "@/src/components/ui/loader";
import SearchBar from "@/src/components/Navbar/SearchBar";
import MultiSelectDropdown from "@/src/features/stocks/components/Multiselect";
import SingleSelectDropdown from "@/src/features/stocks/components/Singleselect";
import PageLayout from "@/src/components/layout/PageLayout";

import { fetchArticles } from "../api";
import { Article } from "../types";
import { useSearch } from "@/src/providers/SearchProvider";
import { getDateDaysBefore } from "@/src/utils/dateUtils";
import { SENTIMENT_CATEGORIES } from "@/src/constants/sentiment";

const SENTIMENT_OPTIONS = new Map(
  SENTIMENT_CATEGORIES.map((option, index) => [index, option]),
);

const DATE_RANGE_OPTIONS = new Map<number, string>([
  [0, "24 hours ago"],
  [1, "3 days ago"],
  [2, "1 week ago"],
]);

const DATE_RANGE_DAYS = new Map<number, number>([
  [0, 1],
  [1, 2],
  [2, 6],
]);

interface NewsPageProps {
  initialTickerList: string[];
}

const NewsPage = ({ initialTickerList }: NewsPageProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { searchQuery } = useSearch();
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<number | null>(null);

  const getPageArticles = async (currPage: number) => {
    const sentiment =
      selectedSentiment != null ? SENTIMENT_OPTIONS.get(selectedSentiment) || "" : "";
    const endDate =
      selectedDateRange != null
        ? getDateDaysBefore(DATE_RANGE_DAYS.get(selectedDateRange) ?? 0)
        : "";
    return fetchArticles(currPage, searchQuery, selectedTickers, sentiment, endDate);
  };

  const getNewlyFilteredArticles = async () => {
    setLoading(true);
    setPage(0);
    const nextArticles = await getPageArticles(0);
    setArticles(nextArticles);
    setLoading(false);
  };

  const loadNextPageArticles = async () => {
    setLoadingMore(true);
    const nextArticles = await getPageArticles(page + 1);
    setArticles((prevArticles) => [...prevArticles, ...nextArticles]);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  useEffect(() => {
    getNewlyFilteredArticles();
  }, [selectedTickers, selectedSentiment, searchQuery, selectedDateRange]);

  const filters = (
    <>
      <MultiSelectDropdown
        selectName="Stocks"
        originalOptions={initialTickerList}
        selectedOptions={selectedTickers}
        setSelectedOptions={setSelectedTickers}
      />
      <SingleSelectDropdown
        placeholder="Sentiment"
        originalOptions={SENTIMENT_OPTIONS}
        selectedOption={selectedSentiment}
        setSelectedOption={setSelectedSentiment}
      />
      <SingleSelectDropdown
        placeholder="Date"
        originalOptions={DATE_RANGE_OPTIONS}
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
            {articles.map((article) => (
              <NewsCard key={`${article.article_url}-${article.publication_datetime}`} {...article} />
            ))}
          </SimpleGrid>
          <Center mt={10}>
            {loadingMore ? (
              <Loader />
            ) : articles.length !== 0 ? (
              <Button onClick={loadNextPageArticles} colorPalette="gray" variant="solid">
                Load More
              </Button>
            ) : (
              <Text>No Articles Available</Text>
            )}
          </Center>
        </>
      )}
    </PageLayout>
  );
};

export default NewsPage;

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Center } from "@chakra-ui/react";

import TickerCard from "@/src/features/stocks/components/TickerCard";
import Loader from "@/src/components/ui/Loader";
import LoadMoreButton from "@/src/components/ui/LoadMoreButton";
import PageLayout from "@/src/components/layout/PageLayout";
import StockSearchBar from "@/src/components/navbar/StockSearchBar";

import { StockInfo } from "@/src/features/stocks/types";
import { sortStocksBySearch } from "@/src/features/stocks/stockSearchRank";
import { useSearch } from "@/src/providers/SearchProvider";

const PAGE_SIZE = 10;

interface StocksPageProps {
  defaultTickers: string[];
}

const StocksPage = ({ defaultTickers }: StocksPageProps) => {
  const router = useRouter();
  const [stockInfo, setStockInfo] = useState<StockInfo[] | null>(null);
  const [page, setPage] = useState(1);

  const { searchQuery, updateSearchQuery } = useSearch();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/stock/exchange");
        const data = await res.json();
        setStockInfo(data.stocks);
      } catch {
        setStockInfo(null);
      }
    };
    fetchStocks();
  }, []);

  const filteredStockInfo = useMemo(() => {
    if (!stockInfo) return null;

    if (!searchQuery.trim()) {
      const defaultStocks = defaultTickers.map((ticker) =>
        stockInfo.find((stock) => stock.symbol === ticker),
      ).filter((stock): stock is StockInfo => stock != null);
      return defaultStocks;
    }

    return sortStocksBySearch(stockInfo, searchQuery);
  }, [stockInfo, searchQuery, defaultTickers]);

  const loadNextPageStocks = () => {
    setPage((prev) => prev + 1);
  };

  const handleOpenModal = (ticker: string) => {
    router.push(`/stocks/${ticker}`);
  };

  return (
    <PageLayout
      title="Stocks"
      subtitle="View the latest prices for 15,000+ stocks"
      searchBar={
        <StockSearchBar
          value={searchQuery}
          stocks={stockInfo}
          onQueryChange={(query) => {
            updateSearchQuery(query);
            setPage(1);
          }}
          onSymbolSelect={handleOpenModal}
        />
      }
    >
      {filteredStockInfo && (
        <Box mt={8}>
          {filteredStockInfo.slice(0, page * PAGE_SIZE).map((stock) => (
            <TickerCard
              key={stock.symbol}
              ticker={stock.symbol}
              onClick={() => handleOpenModal(stock.symbol)}
            />
          ))}
        </Box>
      )}
      <Center mt={10}>
        {stockInfo === null ? (
          <Loader />
        ) : (
          <LoadMoreButton onClick={loadNextPageStocks} />
        )}
      </Center>
    </PageLayout>
  );
};

export default StocksPage;

"use client";
import React, { useState, useEffect, useContext } from "react";
import { Box, Center } from "@chakra-ui/react";

import TickerCard from "@/src/features/stocks/components/TickerCard";
import StockModal from "@/src/features/stocks/components/StockModal";
import MultiSelectDropdown from "@/src/features/stocks/components/Multiselect";
import Loader from "@/src/components/ui/loader";
import NextButton from "@/src/components/ui/next-button";
import PageLayout from "@/src/components/layout/PageLayout";

import { StockInfo } from "@/src/features/stocks/types";
import { fetchTickerList } from "@/src/features/stocks/api";
import { SearchContext, SearchContextProps } from "@/src/providers/SearchProvider";

const PAGE_SIZE = 10;

const StocksPage = () => {
  const [stockInfo, setStockInfo] = useState<StockInfo[] | null>(null);
  const [filteredStockInfo, setFilteredStockInfo] = useState<StockInfo[] | null>(null);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerOptions, setTickerOptions] = useState<string[]>([]);
  const [currCompany, setCurrCompany] = useState("");
  const [currTicker, setCurrTicker] = useState("");

  const { searchQuery } = useContext(SearchContext) as SearchContextProps;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/stock/exchange");
        const data = await res.json();
        setStockInfo(data.stocks);
        setFilteredStockInfo(data.stocks);
      } catch (error) {
        console.error("Error fetching stocks from exchange:", error);
        setStockInfo(null);
      }
    };
    fetchStocks();

    fetchTickerList().then(setTickerOptions).catch(console.error);
  }, []);

  useEffect(() => {
    if (stockInfo) setIsLoading(false);
    else setIsLoading(true);
  }, [stockInfo]);

  useEffect(() => {
    if (!stockInfo) return;
    setIsLoading(true);
    const searchTerms = searchQuery.split(" ");
    const filtered = stockInfo.filter((stock) =>
      searchTerms.some(
        (term) =>
          stock.displaySymbol.toLowerCase().includes(term) ||
          stock.description
            .toLowerCase()
            .split(" ")
            .some((descWord) => descWord.includes(term))
      )
    );
    setFilteredStockInfo(filtered);
    setIsLoading(false);
  }, [searchQuery]);

  const getFilteredTickers = () => {
    if (!stockInfo) return;
    if (!selectedTickers || selectedTickers.length === 0) {
      setFilteredStockInfo(stockInfo);
    } else {
      setFilteredStockInfo(stockInfo.filter((stock) => selectedTickers.includes(stock.symbol)));
    }
  };

  const loadNextPageStocks = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 2000);
  };

  const handleOpenModal = (company: string, ticker: string) => {
    setIsOpen(true);
    setCurrCompany(company);
    setCurrTicker(ticker);
  };

  const filters = (
    <MultiSelectDropdown
      selectName="Stocks"
      originalOptions={tickerOptions}
      selectedOptions={selectedTickers}
      setSelectedOptions={setSelectedTickers}
      handleSubmit={getFilteredTickers}
    />
  );

  return (
    <>
      <PageLayout title="Stocks" subtitle="View the latest prices for 15,000+ stocks" filters={filters}>
        {filteredStockInfo && Array.isArray(filteredStockInfo) && (
          <>
            {filteredStockInfo.slice(0, page * PAGE_SIZE).map((stock) => (
              <Box
                key={stock.symbol}
                onClick={() => handleOpenModal(stock.description, stock.symbol)}
                cursor="pointer"
              >
                <TickerCard ticker={stock.symbol} />
              </Box>
            ))}
          </>
        )}
        <Center mt={10}>
          {isLoading ? <Loader /> : <NextButton onClick={loadNextPageStocks} />}
        </Center>
      </PageLayout>
      <StockModal
        company={currCompany}
        ticker={currTicker}
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default StocksPage;

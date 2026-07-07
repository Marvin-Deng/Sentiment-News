"use client";
import { useState, useEffect, useMemo } from "react";
import { Box, Center } from "@chakra-ui/react";

import TickerCard from "@/src/features/stocks/components/TickerCard";
import StockModal from "@/src/features/stocks/components/StockModal";
import MultiSelectDropdown from "@/src/features/stocks/components/Multiselect";
import SingleSelectDropdown from "@/src/features/stocks/components/Singleselect";
import Loader from "@/src/components/ui/Loader";
import LoadMoreButton from "@/src/components/ui/LoadMoreButton";
import PageLayout from "@/src/components/layout/PageLayout";
import SearchBar from "@/src/components/Navbar/SearchBar";

import { StockInfo } from "@/src/features/stocks/types";
import { useSearch } from "@/src/providers/SearchProvider";
import { DEFAULT_TICKERS } from "@/src/constants/tickers";
import { formatExchangeLabel } from "@/src/constants/exchanges";

const PAGE_SIZE = 10;

const StocksPage = () => {
  const [stockInfo, setStockInfo] = useState<StockInfo[] | null>(null);
  const [page, setPage] = useState(1);
  const [selectedStock, setSelectedStock] = useState<{ company: string; ticker: string } | null>(null);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<number | null>(null);

  const { searchQuery } = useSearch();

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

  const exchangeMics = useMemo(() => {
    if (!stockInfo) return [];
    return Array.from(new Set(stockInfo.map((stock) => stock.mic))).sort();
  }, [stockInfo]);

  const exchangeOptions = useMemo(
    () => new Map(exchangeMics.map((mic, index) => [index, formatExchangeLabel(mic)])),
    [exchangeMics],
  );

  const filteredStockInfo = useMemo(() => {
    if (!stockInfo) return null;

    const searchTerms = searchQuery.split(" ");
    const selectedMic = selectedExchange != null ? exchangeMics[selectedExchange] : null;

    return stockInfo.filter((stock) => {
      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.some(
          (term) =>
            stock.displaySymbol.toLowerCase().includes(term) ||
            stock.description
              .toLowerCase()
              .split(" ")
              .some((descWord) => descWord.includes(term))
        );
      const matchesTickers = selectedTickers.length === 0 || selectedTickers.includes(stock.symbol);
      const matchesExchange = !selectedMic || stock.mic === selectedMic;

      return matchesSearch && matchesTickers && matchesExchange;
    });
  }, [stockInfo, searchQuery, selectedTickers, selectedExchange, exchangeMics]);

  const loadNextPageStocks = () => {
    setPage((prev) => prev + 1);
  };

  const handleOpenModal = (company: string, ticker: string) => {
    setSelectedStock({ company, ticker });
  };

  const filters = (
    <>
      <MultiSelectDropdown
        selectName="Stocks"
        originalOptions={DEFAULT_TICKERS}
        selectedOptions={selectedTickers}
        setSelectedOptions={setSelectedTickers}
      />
      <SingleSelectDropdown
        placeholder="Exchange"
        originalOptions={exchangeOptions}
        selectedOption={selectedExchange}
        setSelectedOption={setSelectedExchange}
      />
    </>
  );

  return (
    <>
      <PageLayout
        title="Stocks"
        subtitle="View the latest prices for 15,000+ stocks"
        searchBar={<SearchBar />}
        filters={filters}
      >
        {filteredStockInfo && (
          <Box mt={8}>
            {filteredStockInfo.slice(0, page * PAGE_SIZE).map((stock) => (
              <TickerCard
                key={stock.symbol}
                ticker={stock.symbol}
                onClick={() => handleOpenModal(stock.description, stock.symbol)}
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
      <StockModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
    </>
  );
};

export default StocksPage;

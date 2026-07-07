"use client";
import { useState, useEffect, useMemo, useContext } from "react";
import { Box, Center } from "@chakra-ui/react";

import TickerCard from "@/src/features/stocks/components/TickerCard";
import StockModal from "@/src/features/stocks/components/StockModal";
import MultiSelectDropdown from "@/src/features/stocks/components/Multiselect";
import SingleSelectDropdown from "@/src/features/stocks/components/Singleselect";
import Loader from "@/src/components/ui/loader";
import NextButton from "@/src/components/ui/next-button";
import PageLayout from "@/src/components/layout/PageLayout";
import SearchBar from "@/src/components/Navbar/SearchBar";

import { StockInfo } from "@/src/features/stocks/types";
import { SearchContext, SearchContextProps } from "@/src/providers/SearchProvider";
import { DEFAULT_TICKERS } from "@/src/constants/tickers";
import { formatExchangeLabel } from "@/src/constants/exchanges";

const PAGE_SIZE = 10;

const StocksPage = () => {
  const [stockInfo, setStockInfo] = useState<StockInfo[] | null>(null);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<number | null>(null);
  const [currCompany, setCurrCompany] = useState("");
  const [currTicker, setCurrTicker] = useState("");

  const { searchQuery } = useContext(SearchContext) as SearchContextProps;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/stock/exchange");
        const data = await res.json();
        setStockInfo(data.stocks);
      } catch (error) {
        console.error("Error fetching stocks from exchange:", error);
        setStockInfo(null);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    setIsLoading(!stockInfo);
  }, [stockInfo]);

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
        {filteredStockInfo && Array.isArray(filteredStockInfo) && (
          <Box mt={8}>
            {filteredStockInfo.slice(0, page * PAGE_SIZE).map((stock) => (
              <Box
                key={stock.symbol}
                onClick={() => handleOpenModal(stock.description, stock.symbol)}
                cursor="pointer"
              >
                <TickerCard ticker={stock.symbol} />
              </Box>
            ))}
          </Box>
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

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Card, IconButton, Input, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

import { StockInfo } from "@/src/features/stocks/types";
import { rankStockSuggestions } from "@/src/features/stocks/stockSearchRank";

const MAX_SUGGESTIONS = 8;

interface StockSearchBarBaseProps {
  placeholder?: string;
  stocks?: StockInfo[] | null;
}

interface StockSearchBarSelectProps extends StockSearchBarBaseProps {
  selectOnly: true;
  value: string;
  onSymbolSelect: (symbol: string) => void;
}

interface StockSearchBarFilterProps extends StockSearchBarBaseProps {
  selectOnly?: false;
  value: string;
  onQueryChange: (query: string) => void;
  onSymbolSelect: (symbol: string) => void;
}

type StockSearchBarProps = StockSearchBarSelectProps | StockSearchBarFilterProps;

const StockSearchBar = (props: StockSearchBarProps) => {
  const {
    value,
    onSymbolSelect,
    selectOnly = false,
    placeholder = "Search ticker (e.g. AAPL, Tesla)",
    stocks: stocksProp,
  } = props;
  const onQueryChange = "onQueryChange" in props ? props.onQueryChange : undefined;

  const [fetchedStocks, setFetchedStocks] = useState<StockInfo[] | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stocks = stocksProp ?? fetchedStocks;

  useEffect(() => {
    if (stocksProp != null) return;
    fetch("/api/stock/exchange")
      .then((res) => res.json())
      .then((data) => setFetchedStocks(data.stocks ?? []))
      .catch(() => setFetchedStocks([]));
  }, [stocksProp]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        if (selectOnly) setInputValue(value);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, selectOnly, value]);

  const suggestions = useMemo(() => {
    if (!stocks || !inputValue.trim()) return [];
    return rankStockSuggestions(stocks, inputValue, MAX_SUGGESTIONS);
  }, [stocks, inputValue]);

  const selectSymbol = (symbol: string) => {
    onSymbolSelect(symbol);
    setInputValue(symbol);
    setOpen(false);
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    setOpen(true);
    onQueryChange?.(nextValue);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const upperQuery = query.toUpperCase();
    const exact = stocks?.find(
      (stock) =>
        stock.symbol.toUpperCase() === upperQuery || stock.displaySymbol.toUpperCase() === upperQuery,
    );

    if (exact) {
      selectSymbol(exact.symbol);
      return;
    }

    if (selectOnly && suggestions.length > 0) {
      selectSymbol(suggestions[0].symbol);
      return;
    }

    onQueryChange?.(query);
    setOpen(false);
  };

  return (
    <Box ref={containerRef} position="relative" w="full">
      <form style={{ position: "relative", width: "100%" }} onSubmit={handleSubmit}>
        <Input
          type="search"
          placeholder={placeholder}
          value={inputValue}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setOpen(true)}
          pr={10}
          size="sm"
          h="8"
          borderWidth="1px"
          borderRadius="md"
          borderColor="border.control"
          autoComplete="off"
        />
        <IconButton
          type="submit"
          aria-label="Search"
          variant="ghost"
          size="sm"
          position="absolute"
          right={1}
          top="50%"
          transform="translateY(-50%)"
          color="fg.muted"
          _hover={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
        >
          <LuSearch size={16} strokeWidth={1.75} />
        </IconButton>
      </form>

      {open && suggestions.length > 0 && (
        <Card.Root
          position="absolute"
          mt={1}
          w="full"
          zIndex={50}
          p={1}
          borderWidth="1px"
          borderColor="border.control"
          maxH="64"
          overflowY="auto"
        >
          {suggestions.map((stock) => (
            <Box
              key={stock.symbol}
              px={3}
              py={2}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: "gray.100", _dark: { bg: "whiteAlpha.200" } }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSymbol(stock.symbol)}
            >
              <Text fontWeight="semibold" fontSize="sm">
                {stock.displaySymbol}
              </Text>
              <Text fontSize="xs" color="fg.muted" truncate>
                {stock.description}
              </Text>
            </Box>
          ))}
        </Card.Root>
      )}
    </Box>
  );
};

export default StockSearchBar;

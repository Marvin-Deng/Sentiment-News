"use client";
import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { Box, Flex, Text, Link } from "@chakra-ui/react";

import { fetchQuoteInfo, QuoteInfo } from "@/src/features/stocks/api";
import { getCached, setCached } from "@/src/utils/sessionCache";
import { DEFAULT_TICKERS } from "@/src/constants/tickers";

const QUOTE_TTL_SECONDS = 120;
const REFRESH_INTERVAL_MS = 60_000;
const SCROLL_RESUME_DELAY_MS = 2000;

type QuoteState = Pick<QuoteInfo, "current" | "change" | "percent">;

const TickerTape = () => {
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), SCROLL_RESUME_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchQuotes = async () => {
      const results = await Promise.all(
        DEFAULT_TICKERS.map(async (ticker) => {
          const cacheKey = `stock-quote:${ticker}`;
          const cached = getCached<QuoteState>(cacheKey);
          if (cached) return [ticker, cached] as const;

          try {
            const data = await fetchQuoteInfo(ticker);
            const quote: QuoteState = {
              current: data.current,
              change: data.change,
              percent: Number.isFinite(data.percent) ? data.percent : 0,
            };
            setCached(cacheKey, quote, QUOTE_TTL_SECONDS);
            return [ticker, quote] as const;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) return;
      setQuotes(
        Object.fromEntries(results.filter((entry): entry is readonly [string, QuoteState] => entry !== null)),
      );
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const tickers = DEFAULT_TICKERS.filter((ticker) => quotes[ticker]);
  if (tickers.length === 0) return null;

  const renderItems = (keyPrefix: string) =>
    tickers.map((ticker) => {
      const quote = quotes[ticker];
      const isPositive = quote.change >= 0;
      return (
        <Flex key={`${keyPrefix}-${ticker}`} align="center" gap={2} flexShrink={0} px={4}>
          <Link asChild fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
            <NextLink href={`/stocks/${ticker}`}>{ticker}</NextLink>
          </Link>
          <Text>{quote.current.toFixed(2)}</Text>
          <Text color={isPositive ? "green.500" : "red.500"}>
            {isPositive ? "▲" : "▼"} {Math.abs(quote.percent).toFixed(2)}%
          </Text>
        </Flex>
      );
    });

  return (
    <Box
      w="full"
      overflowX="auto"
      overflowY="hidden"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      py={2}
      fontSize="sm"
      css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      onWheel={handleScroll}
      onTouchStart={handleScroll}
      onScroll={handleScroll}
    >
      <Flex
        w="max-content"
        animation={isPaused ? "none" : "marquee 40s linear infinite"}
        css={{
          "@keyframes marquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
        }}
      >
        {renderItems("a")}
        {renderItems("b")}
      </Flex>
    </Box>
  );
};

export default TickerTape;

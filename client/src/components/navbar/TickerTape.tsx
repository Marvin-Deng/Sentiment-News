"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { Box, Flex, Text, Link } from "@chakra-ui/react";

import { fetchQuoteInfo } from "@/src/features/stocks/api";
import { QuoteInfo } from "@/src/features/stocks/types";
import { getCached, setCached } from "@/src/utils/sessionCache";
import { DEFAULT_TICKERS } from "@/src/constants/tickers";

const QUOTE_TTL_SECONDS = 24 * 60 * 60;
const AUTO_SCROLL_PX_PER_SEC = 20;

type QuoteState = Pick<QuoteInfo, "current" | "change" | "percent">;

const TickerTape = () => {
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const segmentWidthRef = useRef(0);
  const hasInitializedScrollRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  const normalizePosition = useCallback((position: number) => {
    const segmentWidth = segmentWidthRef.current;
    if (!segmentWidth) return position;

    if (position >= segmentWidth * 2) return position - segmentWidth;
    if (position <= 0) return position + segmentWidth;
    return position;
  }, []);

  const updateSegmentWidth = useCallback(() => {
    const segment = segmentRef.current;
    if (!segment) return 0;

    const segmentWidth = segment.offsetWidth;
    if (!segmentWidth) return 0;

    segmentWidthRef.current = segmentWidth;
    return segmentWidth;
  }, []);

  const initializeScroll = useCallback(() => {
    const container = scrollRef.current;
    const segmentWidth = updateSegmentWidth();
    if (!container || !segmentWidth || hasInitializedScrollRef.current) return;

    isProgrammaticScrollRef.current = true;
    scrollPositionRef.current = segmentWidth;
    container.scrollLeft = segmentWidth;
    hasInitializedScrollRef.current = true;
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
    });
  }, [updateSegmentWidth]);

  const handleUserScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const container = scrollRef.current;
    if (!container) return;

    const normalized = normalizePosition(container.scrollLeft);
    if (normalized !== container.scrollLeft) container.scrollLeft = normalized;
    scrollPositionRef.current = normalized;
  }, [normalizePosition]);

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
    return () => {
      cancelled = true;
    };
  }, []);

  const tickers = DEFAULT_TICKERS.filter((ticker) => quotes[ticker]);

  useEffect(() => {
    if (tickers.length === 0) return;

    hasInitializedScrollRef.current = false;
    const frame = requestAnimationFrame(initializeScroll);
    const segment = segmentRef.current;
    if (!segment) return () => cancelAnimationFrame(frame);

    const resizeObserver = new ResizeObserver(() => {
      updateSegmentWidth();
    });
    resizeObserver.observe(segment);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [tickers, quotes, initializeScroll, updateSegmentWidth]);

  useEffect(() => {
    const step = (timestamp: number) => {
      const container = scrollRef.current;
      const segmentWidth = segmentWidthRef.current;

      if (container && segmentWidth > 0) {
        if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
        const delta = Math.min(timestamp - lastTimestampRef.current, 50);
        lastTimestampRef.current = timestamp;

        isProgrammaticScrollRef.current = true;
        scrollPositionRef.current = normalizePosition(
          scrollPositionRef.current + (AUTO_SCROLL_PX_PER_SEC * delta) / 1000,
        );
        container.scrollLeft = scrollPositionRef.current;
        isProgrammaticScrollRef.current = false;
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimestampRef.current = null;
    };
  }, [normalizePosition]);

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
          <Text color={isPositive ? "positive" : "negative"}>
            {isPositive ? "▲" : "▼"} {Math.abs(quote.percent).toFixed(2)}%
          </Text>
        </Flex>
      );
    });

  return (
    <Box
      ref={scrollRef}
      w="full"
      overflowX="scroll"
      overflowY="hidden"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      py={2}
      fontSize="sm"
      css={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        WebkitOverflowScrolling: "touch",
      }}
      onScroll={handleUserScroll}
    >
      <Flex w="max-content" display="inline-flex">
        <Flex ref={segmentRef} display="inline-flex">
          {renderItems("a")}
        </Flex>
        <Flex display="inline-flex">{renderItems("b")}</Flex>
        <Flex display="inline-flex">{renderItems("c")}</Flex>
      </Flex>
    </Box>
  );
};

export default TickerTape;

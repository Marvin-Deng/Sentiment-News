"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { CompanyProfile } from "@/src/features/stocks/types";
import { fetchQuoteInfo } from "@/src/features/stocks/api";
import { getCached, setCached } from "@/src/utils/sessionCache";

const QUOTE_TTL_SECONDS = 120;
const PROFILE_TTL_SECONDS = 3600;

interface TickerCardProps {
  ticker: string;
}

type QuoteState = { current: number; change: number };

const TickerCard: React.FC<TickerCardProps> = ({ ticker }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<QuoteState | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const fetchProfile = async () => {
      const cacheKey = `stock-profile:${ticker}`;
      const cached = getCached<CompanyProfile>(cacheKey);
      if (cached) {
        setCompanyProfile(cached);
        return;
      }
      try {
        const res = await fetch(`/api/stock/company_profile?ticker=${ticker}`);
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data = await res.json();
        setCompanyProfile(data.company_profile);
        setCached(cacheKey, data.company_profile, PROFILE_TTL_SECONDS);
      } catch {
        setCompanyProfile(null);
        setFetchSuccess(false);
      }
    };

    const fetchQuote = async () => {
      const cacheKey = `stock-quote:${ticker}`;
      const cached = getCached<QuoteState>(cacheKey);
      if (cached) {
        setQuoteInfo(cached);
        return;
      }
      try {
        const data = await fetchQuoteInfo(ticker);
        const quote: QuoteState = { current: data.current, change: data.change };
        setQuoteInfo(quote);
        setCached(cacheKey, quote, QUOTE_TTL_SECONDS);
      } catch {
        setQuoteInfo(null);
      }
    };

    fetchProfile();
    fetchQuote();
  }, [ticker]);

  if (!fetchSuccess) return null;

  return (
    <Box
      w="full"
      maxW="container.lg"
      mx="auto"
      mb={3}
      cursor="pointer"
      transition="transform 0.3s ease-in-out"
      _hover={{ transform: "scale(1.02)" }}
    >
      {companyProfile && (
        <Flex
          align="center"
          justify="space-between"
          gap={4}
          p={4}
          border="1px solid"
          borderColor="border"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
        >
          <Flex align="center" gap={4} minW={0}>
            {companyProfile.logo && (
              <Image
                src={companyProfile.logo}
                alt={`${companyProfile.name} logo`}
                boxSize="48px"
                flexShrink={0}
                objectFit="contain"
                borderRadius="md"
              />
            )}
            <Box minW={0}>
              <Text fontWeight="semibold" truncate>
                {companyProfile.name}
              </Text>
              <Text fontSize="sm" color="gray.500" truncate>
                {companyProfile.ticker} · {companyProfile.exchange}
              </Text>
            </Box>
          </Flex>
          {quoteInfo && (
            <Flex direction="column" align="flex-end" flexShrink={0} fontSize="sm" fontWeight="bold">
              <Text>{quoteInfo.current.toFixed(2)}</Text>
              <Text
                display="inline-block"
                px={2}
                py={1}
                borderRadius="md"
                color="white"
                bg={quoteInfo.change >= 0 ? "green.500" : "red.500"}
              >
                {quoteInfo.change >= 0 ? `+${quoteInfo.change.toFixed(2)}` : quoteInfo.change.toFixed(2)}
              </Text>
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
};

export default TickerCard;

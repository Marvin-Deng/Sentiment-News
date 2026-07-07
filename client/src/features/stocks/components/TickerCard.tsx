"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { CompanyProfile } from "@/src/features/stocks/types";
import { fetchQuoteInfo } from "@/src/features/stocks/api";

interface TickerCardProps {
  ticker: string;
}

const TickerCard: React.FC<TickerCardProps> = ({ ticker }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<{ current: number; change: number } | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/stock/company_profile?ticker=${ticker}`);
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data = await res.json();
        setCompanyProfile(data.company_profile);
      } catch {
        setCompanyProfile(null);
        setFetchSuccess(false);
      }
    };

    const fetchQuote = async () => {
      try {
        const data = await fetchQuoteInfo(ticker);
        setQuoteInfo({ current: data.current, change: data.change });
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

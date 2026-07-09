"use client";
import { useState, useEffect, useMemo } from "react";
import { Box, Flex, Text, IconButton, Link } from "@chakra-ui/react";

import LineChart from "@/src/features/stocks/components/LineChart";
import DataTable from "@/src/features/stocks/components/DataTable";
import EpsSurprisesChart from "@/src/features/stocks/components/EpsSurprisesChart";

import {
  fetchEodData,
  fetchCompanyProfile,
  fetchBasicFinancials,
  fetchEpsSurprises,
} from "@/src/features/stocks/api";
import {
  PriceData,
  DEFAULT_PRICE_DATA,
  BasicFinancials,
  EpsSurprise,
  CompanyProfile,
} from "@/src/features/stocks/types";
import { getPriceDiffStr, getPercentChangeStr, isPricePositive } from "@/src/utils/priceUtils";
import { formatDateEST } from "@/src/utils/dateUtils";

interface StockModalProps {
  ticker: string | null;
  onClose: () => void;
}

const RANGES = ["1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "5Y"];

const getRangeStartDate = (range: string): Date => {
  const today = new Date();
  let start = new Date();
  start.setHours(0, 0, 0, 0);
  switch (range) {
    case "1W": start.setDate(today.getDate() - 7); break;
    case "1M": start.setMonth(today.getMonth() - 1); break;
    case "3M": start.setMonth(today.getMonth() - 3); break;
    case "6M": start.setMonth(today.getMonth() - 6); break;
    case "YTD": start = new Date(today.getFullYear(), 0, 1); break;
    case "1Y": start.setFullYear(today.getFullYear() - 1); break;
    case "2Y": start.setFullYear(today.getFullYear() - 2); break;
    case "5Y": start.setFullYear(today.getFullYear() - 5); break;
    default: start.setDate(today.getDate() - 7);
  }
  return start;
};

const StockModal = ({ ticker: tickerProp, onClose }: StockModalProps) => {
  const ticker = tickerProp ?? "";
  const [selectedRange, setSelectedRange] = useState("YTD");
  const startDate = useMemo(() => getRangeStartDate(selectedRange), [selectedRange]);
  const [stockDataMap, setStockDataMap] = useState(new Map<string, PriceData[]>());
  const [currPriceData, setCurrPriceData] = useState<PriceData>(DEFAULT_PRICE_DATA);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [basicFinancials, setBasicFinancials] = useState<BasicFinancials | null>(null);
  const [epsSurprises, setEpsSurprises] = useState<EpsSurprise[]>([]);

  const getCurrTickerData = () => stockDataMap.get(ticker) || [];

  const getPriceDataRange = () => {
    return getCurrTickerData().filter((priceData) => {
      const date = new Date(priceData.date);
      return date >= startDate && date <= new Date();
    });
  };

  useEffect(() => {
    const fetchStockPrices = async () => {
      const priceData = await fetchEodData(ticker, startDate);
      setStockDataMap((prevMap) => new Map(prevMap.set(ticker, priceData)));
    };

    if (ticker) {
      const tickerStockData = getCurrTickerData();
      if (tickerStockData.length === 0) {
        fetchStockPrices();
      } else {
        const earliestData = new Date(tickerStockData[0].date);
        const latestData = new Date(tickerStockData[tickerStockData.length - 1].date);
        const isStale = Date.now() - latestData.getTime() > 24 * 60 * 60 * 1000;
        if (startDate < earliestData || isStale) fetchStockPrices();
      }
    }
  }, [ticker, startDate]);

  useEffect(() => {
    const tickerData = getCurrTickerData();
    if (tickerData.length > 0) {
      setCurrPriceData(tickerData[tickerData.length - 1]);
    }
  }, [stockDataMap, ticker]);

  useEffect(() => {
    if (!ticker) return;

    fetchCompanyProfile(ticker)
      .then(setCompanyProfile)
      .catch(() => setCompanyProfile(null));
  }, [ticker]);

  useEffect(() => {
    if (!ticker) return;

    fetchBasicFinancials(ticker)
      .then(setBasicFinancials)
      .catch(() => setBasicFinancials(null));
  }, [ticker]);

  useEffect(() => {
    if (!ticker) return;

    fetchEpsSurprises(ticker)
      .then(setEpsSurprises)
      .catch(() => setEpsSurprises([]));
  }, [ticker]);

  if (!ticker) return null;

  const rangeData = getPriceDataRange();
  const rangeStartPrice = rangeData.length > 0 ? rangeData[0].close : currPriceData.open;
  const rangeEndPrice = currPriceData.close;
  const priceColor = isPricePositive(rangeStartPrice, rangeEndPrice) ? "positive" : "negative";
  const companyName = companyProfile?.name || ticker;
  const companyWebUrl = companyProfile?.weburl;

  return (
    <Flex
      position="fixed"
      inset={0}
      align="center"
      justify="center"
      zIndex={50}
      bg="blackAlpha.600"
      onClick={onClose}
    >
      <Box
        position="relative"
        w="full"
        maxW="5xl"
        maxH="calc(100vh - 5rem)"
        overflowY="auto"
        bg="bg"
        borderWidth="2px"
        borderColor="border"
        borderRadius="xl"
        pb={10}
        onClick={(e) => e.stopPropagation()}
      >
        <Flex align="center" justify="space-between" p={5} borderBottomWidth="1px" borderColor="border">
          <Text fontSize="xl" fontWeight="semibold">
            {companyWebUrl ? (
              <Link
                href={companyWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                _hover={{ textDecoration: "underline" }}
              >
                {companyName} ({ticker})
              </Link>
            ) : (
              `${companyName} (${ticker})`
            )}
          </Text>
          <IconButton aria-label="Close modal" variant="ghost" size="sm" onClick={onClose}>
            ✕
          </IconButton>
        </Flex>

        <Flex justify="space-around" p={4} wrap="wrap" gap={2}>
          {RANGES.map((range) => (
            <Box
              key={range}
              as="button"
              py={2}
              px={4}
              borderRadius="lg"
              cursor="pointer"
              bg={selectedRange === range ? "gray.600" : "transparent"}
              color={selectedRange === range ? "white" : undefined}
              _hover={{
                bg: selectedRange === range ? "gray.600" : "gray.100",
                color: selectedRange === range ? "white" : "black",
              }}
              onClick={() => setSelectedRange(range)}
            >
              {range}
            </Box>
          ))}
        </Flex>

        <Box w="full" maxW="4xl" mx="auto" px={4} py={2}>
          <Flex align="baseline" gap={3}>
            <Text fontSize="xl" fontWeight="semibold">
              {currPriceData.close}
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color={priceColor}>
              {getPriceDiffStr(rangeStartPrice, rangeEndPrice)} (
              {getPercentChangeStr(rangeStartPrice, rangeEndPrice)})
            </Text>
          </Flex>
          <Text fontSize="sm" mt={1}>
            At close on {formatDateEST(currPriceData.date)}
          </Text>
        </Box>

        <LineChart
          ticker={ticker}
          priceData={rangeData}
          range={selectedRange}
          isPositive={isPricePositive(rangeStartPrice, rangeEndPrice)}
        />

        <Flex justify="center">
          <Box w={{ base: "80%", sm: "50%" }}>
            <DataTable currPriceData={currPriceData} basicFinancials={basicFinancials} />
          </Box>
        </Flex>

        <EpsSurprisesChart epsSurprises={epsSurprises} />
      </Box>
    </Flex>
  );
};

export default StockModal;

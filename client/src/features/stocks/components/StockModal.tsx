"use client";
import { useState, useEffect, useMemo } from "react";
import { Box, Flex, Image, Tabs, Text, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuX } from "react-icons/lu";

import CircularIconButton from "@/src/components/ui/CircularIconButton";

import LineChart from "@/src/features/stocks/components/LineChart";
import DataTable from "@/src/features/stocks/components/DataTable";
import EpsSurprisesChart from "@/src/features/stocks/components/EpsSurprisesChart";
import EpsSurprisesTable from "@/src/features/stocks/components/EpsSurprisesTable";
import InsiderTransactionsTable from "@/src/features/insider/components/InsiderTransactionsTable";

import {
  fetchEodData,
  fetchCompanyProfile,
  fetchBasicFinancials,
  fetchEpsSurprises,
} from "@/src/features/stocks/api";
import { fetchInsiderTransactions } from "@/src/features/insider/api";
import { InsiderTransaction } from "@/src/features/insider/types";
import {
  PriceData,
  DEFAULT_PRICE_DATA,
  BasicFinancials,
  EpsSurprise,
  CompanyProfile,
} from "@/src/features/stocks/types";
import { formatNumber } from "@/src/utils/numberUtils";
import { getPriceDiffStr, getPercentChangeStr, isPricePositive } from "@/src/utils/priceUtils";
import { formatDateEST, getDateDaysBefore, toMarketDateISO, todayMarketDate } from "@/src/utils/dateUtils";

interface StockModalProps {
  ticker: string | null;
  onClose: () => void;
}

const RANGES = ["1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "5Y"];

const TAB_OPTIONS = [
  { value: "profile", label: "Profile" },
  { value: "eps", label: "EPS" },
  { value: "insider", label: "Insider" },
];

const INSIDER_LOOKBACK_DAYS = 183;
const ONE_WEEK_TRADING_DAYS = 7;

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
  const [insiderTransactions, setInsiderTransactions] = useState<InsiderTransaction[]>([]);

  const getCurrTickerData = () => stockDataMap.get(ticker) || [];

  const rangeData = useMemo(() => {
    const marketToday = todayMarketDate();
    const throughToday = (stockDataMap.get(ticker) || []).filter((priceData) => {
      const iso = toMarketDateISO(priceData.date);
      return iso != null && iso <= marketToday;
    });

    if (selectedRange === "1W") {
      return throughToday.slice(-ONE_WEEK_TRADING_DAYS);
    }

    const rangeStart = toMarketDateISO(startDate) ?? marketToday;
    return throughToday.filter((priceData) => {
      const iso = toMarketDateISO(priceData.date);
      return iso != null && iso >= rangeStart;
    });
  }, [stockDataMap, ticker, selectedRange, startDate]);

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
        const earliestIso = toMarketDateISO(tickerStockData[0].date);
        const latestIso = toMarketDateISO(tickerStockData[tickerStockData.length - 1].date);
        const isStale = latestIso != null && latestIso < todayMarketDate();
        const startIso = toMarketDateISO(startDate);
        if ((startIso && earliestIso && startIso < earliestIso) || isStale) fetchStockPrices();
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

  useEffect(() => {
    if (!ticker) return;

    const from = getDateDaysBefore(INSIDER_LOOKBACK_DAYS);
    const to = getDateDaysBefore(0);
    fetchInsiderTransactions(ticker, from, to)
      .then(setInsiderTransactions)
      .catch(() => setInsiderTransactions([]));
  }, [ticker]);

  if (!ticker) return null;

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
          <Flex align="center" gap={3} minW={0}>
            {companyProfile?.logo && (
              <Image
                src={companyProfile.logo}
                alt={`${companyName} logo`}
                boxSize="36px"
                flexShrink={0}
                objectFit="contain"
                borderRadius="md"
              />
            )}
            <Text fontSize="xl" fontWeight="semibold" lineHeight="1" my={0} truncate>
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
          </Flex>
          <CircularIconButton aria-label="Close modal" size="sm" flexShrink={0} onClick={onClose}>
            <LuX />
          </CircularIconButton>
        </Flex>

        <Flex justify="space-around" p={4} wrap="wrap" gap={2}>
          {RANGES.map((range) => (
            <Box
              key={range}
              as="button"
              position="relative"
              py={2}
              px={4}
              cursor="pointer"
              fontWeight={selectedRange === range ? "bold" : "normal"}
              _hover={{ _after: { transform: "scaleX(1)" } }}
              _after={{
                content: '""',
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "full",
                height: "2px",
                bg: "white",
                transform: selectedRange === range ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "center",
                transition: "transform 0.3s ease",
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
              {formatNumber(currPriceData.close)}
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

        <Tabs.Root defaultValue="profile" mt={4} lazyMount unmountOnExit>
          <Tabs.List justifyContent="center">
            {TAB_OPTIONS.map(({ value, label }) => (
              <Tabs.Trigger key={value} value={value} fontSize="md" color="fg">
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="profile">
            <DataTable currPriceData={currPriceData} basicFinancials={basicFinancials} />
          </Tabs.Content>
          <Tabs.Content value="eps">
            <EpsSurprisesChart epsSurprises={epsSurprises} />
            <EpsSurprisesTable epsSurprises={epsSurprises} />
          </Tabs.Content>
          <Tabs.Content value="insider">
            <Box w="full" maxW="4xl" mx="auto" px={4} py={2}>
              <InsiderTransactionsTable
                transactions={insiderTransactions}
                symbol={ticker}
                mt={0}
                headerExtra={
                  <Link asChild fontSize="sm" color="fg.muted" display="inline-block" _hover={{ textDecoration: "underline" }}>
                    <NextLink href={`/insider/${ticker}`}>View details</NextLink>
                  </Link>
                }
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Flex>
  );
};

export default StockModal;

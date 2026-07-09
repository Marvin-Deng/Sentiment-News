"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Center, Text } from "@chakra-ui/react";

import PageLayout from "@/src/components/layout/PageLayout";
import StockSearchBar from "@/src/components/navbar/StockSearchBar";
import Loader from "@/src/components/ui/Loader";
import InsiderSentimentChart from "@/src/features/insider/components/InsiderSentimentChart";
import InsiderStockPriceChart from "@/src/features/insider/components/InsiderStockPriceChart";
import InsiderTransactionsTable from "@/src/features/insider/components/InsiderTransactionsTable";
import { fetchInsiderSentiment, fetchInsiderTransactions } from "@/src/features/insider/api";
import { InsiderSentiment, InsiderTransaction } from "@/src/features/insider/types";
import { fetchCompanyProfile, fetchEodData } from "@/src/features/stocks/api";
import { CompanyProfile, PriceData } from "@/src/features/stocks/types";
import { getDateDaysBefore } from "@/src/utils/dateUtils";

const DEFAULT_SYMBOL = "TSLA";
const LOOKBACK_DAYS = 183;

const InsiderPage = () => {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [sentiment, setSentiment] = useState<InsiderSentiment[] | null>(null);
  const [transactions, setTransactions] = useState<InsiderTransaction[] | null>(null);
  const [priceData, setPriceData] = useState<PriceData[] | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const { fromDate, toDate } = useMemo(
    () => ({
      fromDate: getDateDaysBefore(LOOKBACK_DAYS),
      toDate: getDateDaysBefore(0),
    }),
    [],
  );

  useEffect(() => {
    setSentiment(null);
    setTransactions(null);
    setPriceData(null);
    setCompanyProfile(null);

    fetchInsiderSentiment(symbol, fromDate, toDate)
      .then(setSentiment)
      .catch(() => setSentiment([]));

    fetchInsiderTransactions(symbol, fromDate, toDate)
      .then(setTransactions)
      .catch(() => setTransactions([]));

    fetchEodData(symbol, new Date(fromDate))
      .then(setPriceData)
      .catch(() => setPriceData([]));

    fetchCompanyProfile(symbol)
      .then(setCompanyProfile)
      .catch(() => setCompanyProfile(null));
  }, [symbol, fromDate, toDate]);

  const isLoading = sentiment === null || transactions === null || priceData === null;

  return (
    <PageLayout
      title="Insider Trading"
      subtitle="Insider sentiment and transactions for the past 6 months"
      searchBar={<StockSearchBar selectOnly value={symbol} onSymbolSelect={setSymbol} />}
    >
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}

      {!isLoading && (
        <Box mt={8}>
          <InsiderStockPriceChart
            priceData={priceData}
            transactions={transactions}
            symbol={symbol}
            companyName={companyProfile?.name}
          />
          <InsiderSentimentChart sentiment={sentiment} />
          <InsiderTransactionsTable
            key={symbol}
            transactions={transactions}
            symbol={symbol}
          />
        </Box>
      )}

      {!isLoading && sentiment.length === 0 && transactions.length === 0 && (
        <Text mt={4} fontSize="lg">
          No insider data available for {symbol} in the past 6 months.
        </Text>
      )}
    </PageLayout>
  );
};

export default InsiderPage;

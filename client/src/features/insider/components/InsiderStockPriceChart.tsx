"use client";
import { useMemo } from "react";
import { Box, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import InsiderStockPriceChartDot from "@/src/features/insider/components/InsiderStockPriceChartDot";
import InsiderStockPriceChartTooltip from "@/src/features/insider/components/InsiderStockPriceChartTooltip";
import { InsiderTransaction, ChartPoint } from "@/src/features/insider/types";
import { PriceData } from "@/src/features/stocks/types";
import { formatNumber } from "@/src/utils/numberUtils";
import { CHART_AXIS_FONT_SIZE } from "@/src/theme/system";

interface InsiderStockPriceChartProps {
  priceData: PriceData[];
  transactions: InsiderTransaction[];
  symbol: string;
  companyName?: string;
}

const monthLabel = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short" });

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getLocalDateString = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthStartTicks = (data: PriceData[] | ChartPoint[]): any[] => {
  const ticks: any[] = [];
  let lastMonthKey = "";
  for (const point of data) {
    const d = point.date instanceof Date ? point.date : new Date(point.date);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthKey !== lastMonthKey) {
      ticks.push(point.date as unknown as string);
      lastMonthKey = monthKey;
    }
  }
  return ticks;
};

const getPriceTicks = (data: PriceData[] | ChartPoint[], count: number) => {
  if (data.length === 0) return { ticks: [], domainMin: 0, domainMax: 1 };

  const closes = data.map((p) => p.close);
  const dataMin = Math.min(...closes);
  const dataMax = Math.max(...closes);
  const range = dataMax - dataMin || 1;

  const lowestTick = dataMin - range * 0.1;
  const domainMax = dataMax;
  const step = (domainMax - lowestTick) / (count - 1);
  const domainMin = lowestTick - step * 0.6;

  const ticks = Array.from({ length: count }, (_, i) => lowestTick + step * i);
  return { ticks, domainMin, domainMax };
};

const StockPriceChartTitle = ({
  symbol,
  companyName,
  mb,
}: {
  symbol: string;
  companyName?: string;
  mb: number;
}) => (
  <Heading textStyle="sectionTitle" mb={mb}>
    <Link asChild _hover={{ textDecoration: "underline" }}>
      <NextLink href={`/stocks/${symbol}`}>
        {companyName ? `${companyName} (${symbol})` : symbol}
      </NextLink>
    </Link>
  </Heading>
);

const InsiderStockPriceChart = ({
  priceData,
  transactions,
  symbol,
  companyName,
}: InsiderStockPriceChartProps) => {
  const chartData = useMemo(() => {
    const transactionMap = new Map<string, InsiderTransaction[]>();

    transactions.forEach((tx) => {
      const date = getLocalDateString(tx.transactionDate);
      if (!transactionMap.has(date)) {
        transactionMap.set(date, []);
      }
      transactionMap.get(date)!.push(tx);
    });

    const priceMap = new Map<string, PriceData>();
    priceData.forEach((price) => {
      const dateObj = price.date instanceof Date ? price.date : new Date(price.date);
      const dateStr = getLocalDateString(dateObj);
      priceMap.set(dateStr, { ...price, date: dateObj });
    });

    const combinedData: ChartPoint[] = [];
    const processedDates = new Set<string>();

    priceData.forEach((price) => {
      const dateObj = price.date instanceof Date ? price.date : new Date(price.date);
      const dateStr = getLocalDateString(dateObj);
      processedDates.add(dateStr);

      const dayTransactions = transactionMap.get(dateStr) || [];

      let buyChange = 0;
      let sellChange = 0;
      let buyCount = 0;
      let sellCount = 0;

      dayTransactions.forEach((tx) => {
        if (tx.change > 0) {
          buyChange += tx.change;
          buyCount++;
        } else if (tx.change < 0) {
          sellChange += Math.abs(tx.change);
          sellCount++;
        }
      });

      const netChange = buyChange - sellChange;

      combinedData.push({
        ...price,
        date: dateObj,
        tradeInfo:
          dayTransactions.length > 0
            ? {
                netChange,
                buyChange,
                sellChange,
                buyCount,
                sellCount,
                transactionDate: dateObj,
                trades: dayTransactions.map((tx) => ({
                  name: tx.name,
                  change: tx.change,
                  isBuy: tx.change > 0,
                  tradePrice: tx.transactionPrice,
                })),
              }
            : undefined,
      } as ChartPoint);
    });

    transactionMap.forEach((dayTransactions, dateStr) => {
      if (!processedDates.has(dateStr) && priceData.length > 0) {
        const txDate = parseLocalDate(dateStr);
        let closestPrice = priceData[0];
        let minDiff = Math.abs(new Date(closestPrice.date).getTime() - txDate.getTime());

        priceData.forEach((price) => {
          const priceDateObj = price.date instanceof Date ? price.date : new Date(price.date);
          const diff = Math.abs(priceDateObj.getTime() - txDate.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestPrice = price;
          }
        });

        // Aggregate trades for the day
        let buyChange = 0;
        let sellChange = 0;
        let buyCount = 0;
        let sellCount = 0;

        dayTransactions.forEach((tx) => {
          if (tx.change > 0) {
            buyChange += tx.change;
            buyCount++;
          } else if (tx.change < 0) {
            sellChange += Math.abs(tx.change);
            sellCount++;
          }
        });

        const netChange = buyChange - sellChange;

        combinedData.push({
          ...closestPrice,
          date: txDate,
          tradeInfo: {
            netChange,
            buyChange,
            sellChange,
            buyCount,
            sellCount,
            transactionDate: txDate,
            trades: dayTransactions.map((tx) => ({
              name: tx.name,
              change: tx.change,
              isBuy: tx.change > 0,
              tradePrice: tx.transactionPrice,
            })),
          },
        } as ChartPoint);
      }
    });

    combinedData.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return combinedData;
  }, [priceData, transactions]);

  if (priceData.length === 0) {
    return (
      <Box w="full" py={2}>
        <StockPriceChartTitle symbol={symbol} companyName={companyName} mb={2} />
        <Text color="fg.muted">No price data for this period.</Text>
      </Box>
    );
  }

  const axisColor = "var(--chakra-colors-fg)";
  const monthTicks = useMemo(() => getMonthStartTicks(chartData), [chartData]);
  const priceTicks = useMemo(() => getPriceTicks(chartData, 4), [chartData]);

  const maxNetChange = useMemo(() => {
    return Math.max(
      ...chartData
        .filter((d) => d.tradeInfo)
        .map((d) => Math.abs(d.tradeInfo!.netChange))
    );
  }, [chartData]);

  return (
    <Box w="full" py={2}>
      <StockPriceChartTitle symbol={symbol} companyName={companyName} mb={4} />
      <Box h="320px">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 16 }}>
            <defs>
              <linearGradient id="stockPriceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={monthLabel}
              ticks={monthTicks}
              interval={0}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: CHART_AXIS_FONT_SIZE }}
            />
            <YAxis
              domain={[priceTicks.domainMin, priceTicks.domainMax]}
              ticks={priceTicks.ticks}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: CHART_AXIS_FONT_SIZE }}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <Tooltip content={<InsiderStockPriceChartTooltip />} />
            <Area
              type="linear"
              dataKey="close"
              stroke="#9ca3af"
              fill="url(#stockPriceFill)"
              strokeWidth={2}
              dot={(props) => (
                <InsiderStockPriceChartDot {...props} maxNetChange={maxNetChange} />
              )}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default InsiderStockPriceChart;

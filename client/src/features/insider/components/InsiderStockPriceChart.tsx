"use client";
import { useMemo } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { InsiderTransaction } from "@/src/features/insider/types";
import { PriceData } from "@/src/features/stocks/types";

interface InsiderStockPriceChartProps {
  priceData: PriceData[];
  transactions: InsiderTransaction[];
}

type ChartPoint = PriceData & {
  trades?: Array<{
    name: string;
    change: number;
    isBuy: boolean;
    tradePrice?: number;
  }>;
};

const getMaxTradeSize = (transactions: InsiderTransaction[]): number => {
  if (transactions.length === 0) return 1;
  return Math.max(...transactions.map((t) => Math.abs(t.change)));
};

// Calculate circle radius based on trade size (range: 4-18)
const getCircleRadius = (change: number, maxSize: number) => {
  const normalized = Math.abs(change) / maxSize;
  return 4 + normalized * 14; // 4-18px range
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  label?: any;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="md" p={3} boxShadow="md" fontSize="sm">
      <Box fontWeight="semibold" mb={1}>
        {new Date(label ?? data.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </Box>
      <Box>Close: ${data.close.toFixed(2)}</Box>
      {data.trades && data.trades.length > 0 && (
        <>
          {data.trades.map((trade, idx) => (
            <Box key={idx} fontSize="xs" mt={1} pt={1} borderTopWidth="1px">
              <Box fontWeight="medium">{trade.name}</Box>
              <Box>{trade.isBuy ? "Buy" : "Sell"}: {Math.abs(trade.change).toLocaleString()} shares</Box>
              {trade.tradePrice && <Box>Price: ${trade.tradePrice.toFixed(2)}</Box>}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
  maxTradeSize: number;
}

const CustomDot = ({ cx, cy, payload, maxTradeSize }: CustomDotProps) => {
  if (cx === undefined || cy === undefined || !payload?.trades) return null;

  const trades = payload.trades.filter((t) => t.change !== 0);
  if (trades.length === 0) return null;

  return (
    <>
      {trades.map((trade, idx) => {
        const radius = getCircleRadius(trade.change, maxTradeSize);
        const offsetX = trades.length > 1 ? (idx - (trades.length - 1) / 2) * 8 : 0;

        return (
          <circle
            key={`trade-${idx}`}
            cx={(cx || 0) + offsetX}
            cy={cy}
            r={radius}
            fill={trade.isBuy ? "#22c55e" : "#ef4444"}
            fillOpacity={0.6}
            stroke={trade.isBuy ? "#16a34a" : "#dc2626"}
            strokeWidth={1.5}
          />
        );
      })}
    </>
  );
};

const InsiderStockPriceChart = ({
  priceData,
  transactions,
}: InsiderStockPriceChartProps) => {
  const maxTradeSize = useMemo(() => getMaxTradeSize(transactions), [transactions]);
  const axisColor = "var(--chakra-colors-fg)";

  const chartData = useMemo(() => {
    // Create a map of transaction dates to transactions
    const transactionMap = new Map<string, InsiderTransaction[]>();

    transactions.forEach((tx) => {
      const date = new Date(tx.transactionDate).toISOString().split("T")[0];
      if (!transactionMap.has(date)) {
        transactionMap.set(date, []);
      }
      transactionMap.get(date)!.push(tx);
    });

    // Combine price data with transactions
    return priceData.map((price) => {
      const dateObj = price.date instanceof Date ? price.date : new Date(price.date);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayTransactions = transactionMap.get(dateStr) || [];

      return {
        ...price,
        date: dateObj,
        trades: dayTransactions.map((tx) => ({
          name: tx.name,
          change: tx.change,
          isBuy: tx.change > 0,
          tradePrice: tx.transactionPrice,
        })),
      } as ChartPoint;
    });
  }, [priceData, transactions]);

  if (priceData.length === 0) {
    return (
      <Box w="full" px={4} py={2} mt={6}>
        <Heading size="sm" mb={2}>
          Stock Price & Insider Trades
        </Heading>
        <Text color="fg.muted">No price data for this period.</Text>
      </Box>
    );
  }

  const closes = chartData.map((p) => p.close);
  const dataMin = Math.min(...closes);
  const dataMax = Math.max(...closes);
  const range = dataMax - dataMin || 1;
  const domainMin = dataMin - range * 0.15;
  const domainMax = dataMax + range * 0.05;

  const priceTicks = [
    domainMin + (range * 0.15 + range * 0.05) * 0.25,
    domainMin + (range * 0.15 + range * 0.05) * 0.5,
    domainMin + (range * 0.15 + range * 0.05) * 0.75,
    domainMax,
  ];

  return (
    <Box w="full" px={4} py={2} mt={6}>
      <Heading size="sm" mb={1}>
        Stock Price & Insider Trades
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb={4}>
        Gray line: stock price. Green circles: insider buys, Red circles: insider sells.
      </Text>
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
              tickFormatter={(date: Date) => {
                const d = new Date(date);
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[domainMin, domainMax]}
              ticks={priceTicks}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 10 }}
              tickFormatter={(value: number) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="linear"
              dataKey="close"
              stroke="#9ca3af"
              fill="url(#stockPriceFill)"
              strokeWidth={2}
              dot={(props) => (
                <CustomDot {...props} maxTradeSize={maxTradeSize} />
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

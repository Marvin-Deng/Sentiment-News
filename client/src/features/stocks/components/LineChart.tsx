"use client";
import React from "react";
import { useTheme } from "next-themes";
import { Box, Center } from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";

import Loader from "@/src/components/ui/loader";
import { getPriceDiff } from "@/src/utils/priceUtils";
import { PriceData } from "@/src/features/stocks/types";

interface LineChartProps {
  ticker: string;
  priceData: PriceData[];
}

const formatDateLabel = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: PriceData }[];
  label?: Date | string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="md" p={3} boxShadow="md" fontSize="sm">
      <Box fontWeight="semibold" mb={1}>
        {formatDateLabel(label ?? data.date)}
      </Box>
      <Box>Open: {data.open?.toFixed(2) ?? "N/A"}</Box>
      <Box>Close: {data.close?.toFixed(2) ?? "N/A"}</Box>
      <Box>Low: {data.low?.toFixed(2) ?? "N/A"}</Box>
      <Box>High: {data.high?.toFixed(2) ?? "N/A"}</Box>
      <Box>Volume: {data.volume?.toLocaleString() ?? "N/A"}</Box>
    </Box>
  );
};

const LineChart: React.FC<LineChartProps> = ({ ticker, priceData }) => {
  const { theme } = useTheme();
  const axisColor = theme === "light" ? "black" : "white";

  const { priceLineColor, priceFillColor } = (() => {
    if (priceData.length === 0) {
      return { priceLineColor: "rgba(255, 100, 100, 1)", priceFillColor: "rgba(255, 100, 100, 0.2)" };
    }
    const last = priceData[priceData.length - 1];
    const isPositive = getPriceDiff(last.open, last.close) > 0;
    return isPositive
      ? { priceLineColor: "rgba(30, 200, 100, 1)", priceFillColor: "rgba(144, 238, 144, 0.3)" }
      : { priceLineColor: "rgba(255, 100, 100, 1)", priceFillColor: "rgba(255, 100, 100, 0.2)" };
  })();

  if (priceData.length === 0) {
    return (
      <Center h="400px">
        <Loader />
      </Center>
    );
  }

  return (
    <Box w="full" maxW="4xl" mx="auto" px={4} py={2} h="400px">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={priceData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
          <defs>
            <linearGradient id={`priceFill-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={priceFillColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={priceFillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
          >
            <Label value="Date" position="insideBottom" offset={-10} fill={axisColor} />
          </XAxis>
          <YAxis
            domain={["auto", "auto"]}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            tickFormatter={(value: number) => value.toFixed(2)}
          >
            <Label value="Price" angle={-90} position="insideLeft" fill={axisColor} />
          </YAxis>
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="linear"
            dataKey="close"
            stroke={priceLineColor}
            fill={`url(#priceFill-${ticker})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;

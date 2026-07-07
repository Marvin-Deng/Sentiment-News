"use client";
import React, { useMemo } from "react";
import { Box, Center } from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Loader from "@/src/components/ui/loader";
import { getPriceDiff } from "@/src/utils/priceUtils";
import { PriceData } from "@/src/features/stocks/types";

interface LineChartProps {
  ticker: string;
  priceData: PriceData[];
  range: string;
}

const dayLabel = (date: string) => new Date(date).toLocaleDateString("en-US", { day: "numeric" });
const monthLabel = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short" });
const monthYearLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
const yearLabel = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric" });

// Ticks are computed explicitly (rather than left to recharts' auto interval) because auto
// selection picks points that don't line up with month/year boundaries, leaving most labels blank.
const getMonthStartTicks = (priceData: PriceData[]) => {
  const ticks: string[] = [];
  let lastMonthKey = "";
  for (const point of priceData) {
    const d = new Date(point.date);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthKey !== lastMonthKey) {
      ticks.push(point.date as unknown as string);
      lastMonthKey = monthKey;
    }
  }
  return ticks;
};

// Picks up to `count` ticks evenly spaced across the data, always including the last point.
const getEvenlySpacedTicks = (priceData: PriceData[], count: number) => {
  if (priceData.length === 0) return [];
  const step = (priceData.length - 1) / (count - 1);
  const indices = new Set<number>();
  for (let i = 0; i < count; i++) {
    indices.add(Math.round(i * step));
  }
  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((i) => priceData[i].date as unknown as string);
};

// One tick at the July data point of each year covered by the range (closest available day to
// July 1, since EOD data may not include that exact calendar date).
const getJulyTicks = (priceData: PriceData[]) => {
  const closestByYear = new Map<number, { date: string; distance: number }>();
  for (const point of priceData) {
    const d = new Date(point.date);
    const july1 = new Date(d.getFullYear(), 6, 1);
    const distance = Math.abs(d.getTime() - july1.getTime());
    const existing = closestByYear.get(d.getFullYear());
    if (!existing || distance < existing.distance) {
      closestByYear.set(d.getFullYear(), { date: point.date as unknown as string, distance });
    }
  }
  return Array.from(closestByYear.values()).map((v) => v.date);
};

// One tick at the first data point of each year, so the most recent year lands on the far right.
// The very first tick is dropped if it falls well after January 1 (i.e. the range's start date
// cuts into the middle of that year), since it would otherwise sit much closer to the next year's
// tick than every other year-pair, making the spacing look uneven despite being chronologically
// correct.
const getYearStartTicks = (priceData: PriceData[]) => {
  const ticks: string[] = [];
  let lastYear: number | null = null;
  for (const point of priceData) {
    const year = new Date(point.date).getFullYear();
    if (year !== lastYear) {
      ticks.push(point.date as unknown as string);
      lastYear = year;
    }
  }

  if (ticks.length > 1) {
    const firstTickDate = new Date(ticks[0]);
    const isPartialYear = firstTickDate.getMonth() > 0; // after January
    if (isPartialYear) ticks.shift();
  }

  return ticks;
};

const getAxisConfig = (priceData: PriceData[], range: string) => {
  switch (range) {
    case "1W":
      return { ticks: undefined, interval: 0 as const, formatter: dayLabel };
    case "1M":
      return { ticks: undefined, interval: undefined, formatter: dayLabel };
    case "1Y":
      return { ticks: getEvenlySpacedTicks(priceData, 4), interval: 0 as const, formatter: monthLabel };
    case "2Y":
      return { ticks: getJulyTicks(priceData), interval: 0 as const, formatter: monthYearLabel };
    case "5Y":
      return { ticks: getYearStartTicks(priceData), interval: 0 as const, formatter: yearLabel };
    default:
      return { ticks: getMonthStartTicks(priceData), interval: 0 as const, formatter: monthLabel };
  }
};

// Computes exactly `count` evenly-spaced price ticks. The chart's domain extends further below
// the lowest tick than the tick spacing itself, so the lowest tick renders with visible clearance
// above the bottom axis line instead of sitting flush against it.
const getPriceTicks = (priceData: PriceData[], count: number) => {
  if (priceData.length === 0) return { ticks: [], domainMin: 0, domainMax: 1 };

  const closes = priceData.map((p) => p.close);
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

const formatTooltipDateLabel = (date: Date | string) =>
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
        {formatTooltipDateLabel(label ?? data.date)}
      </Box>
      <Box>Open: {data.open?.toFixed(2) ?? "N/A"}</Box>
      <Box>Close: {data.close?.toFixed(2) ?? "N/A"}</Box>
      <Box>Low: {data.low?.toFixed(2) ?? "N/A"}</Box>
      <Box>High: {data.high?.toFixed(2) ?? "N/A"}</Box>
      <Box>Volume: {data.volume?.toLocaleString() ?? "N/A"}</Box>
    </Box>
  );
};

const LineChart: React.FC<LineChartProps> = ({ ticker, priceData, range }) => {
  const axisColor = "var(--chakra-colors-fg)";

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

  const axisConfig = useMemo(() => getAxisConfig(priceData, range), [priceData, range]);
  const priceTicks = useMemo(() => getPriceTicks(priceData, 4), [priceData]);

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
        <AreaChart data={priceData} margin={{ left: 10, right: 36, top: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={`priceFill-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={priceFillColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={priceFillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tickFormatter={axisConfig.formatter}
            ticks={axisConfig.ticks}
            interval={axisConfig.interval}
            stroke={axisColor}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10 }}
          />
          <YAxis
            domain={[priceTicks.domainMin, priceTicks.domainMax]}
            ticks={priceTicks.ticks}
            stroke={axisColor}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10 }}
            tickFormatter={(value: number) => value.toFixed(2)}
          />
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

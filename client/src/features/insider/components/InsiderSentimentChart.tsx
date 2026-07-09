"use client";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { InsiderSentiment, SentimentChartPoint } from "@/src/features/insider/types";
import { CHART_AXIS_FONT_SIZE } from "@/src/theme/system";

interface InsiderSentimentChartProps {
  sentiment: InsiderSentiment[];
}

const MSPR_MIN = -100;
const MSPR_MAX = 100;
const MSPR_TICKS = [-100, -50, 0, 50, 100];
const MSPR_DOMAIN_MIN = MSPR_MIN - 15;

const formatMonthYear = (year: number, month: number) =>
  new Date(year, month - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const toChartData = (sentiment: InsiderSentiment[]): SentimentChartPoint[] =>
  [...sentiment]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((item) => ({
      ...item,
      label: formatMonthYear(item.year, item.month),
    }));

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SentimentChartPoint }[];
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="md" p={3} boxShadow="md" fontSize="sm">
      <Box textStyle="tooltipLabel" mb={1}>
        {data.label}
      </Box>
      <Box>MSPR: {data.mspr.toFixed(2)}</Box>
      <Box>Net change: {data.change.toLocaleString()} shares</Box>
    </Box>
  );
};

const InsiderSentimentChart = ({ sentiment }: InsiderSentimentChartProps) => {
  const axisColor = "var(--chakra-colors-fg)";
  const chartData = toChartData(sentiment);

  if (chartData.length === 0) {
    return (
      <Box w="full" py={2}>
        <Heading textStyle="sectionTitle" mb={2}>
          Insider Sentiment (MSPR)
        </Heading>
        <Text color="fg.muted">No sentiment data for this period.</Text>
      </Box>
    );
  }

  const lineColor =
    chartData[chartData.length - 1].mspr >= 0
      ? "var(--chakra-colors-positive)"
      : "var(--chakra-colors-negative)";
  const fillColor =
    chartData[chartData.length - 1].mspr >= 0
      ? "color-mix(in srgb, var(--chakra-colors-positive) 30%, transparent)"
      : "color-mix(in srgb, var(--chakra-colors-negative) 20%, transparent)";

  return (
    <Box w="full" py={2}>
      <Heading textStyle="sectionTitle" mb={1}>
        Insider Sentiment (MSPR)
      </Heading>
      <Text textStyle="caption" mb={4}>
        Monthly share purchase ratio from -100 (most negative) to 100 (most positive).
      </Text>
      <Box h="320px">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 16 }}>
            <defs>
              <linearGradient id="msprFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: CHART_AXIS_FONT_SIZE }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[MSPR_DOMAIN_MIN, MSPR_MAX]}
              ticks={MSPR_TICKS}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: CHART_AXIS_FONT_SIZE }}
            />
            <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="mspr"
              stroke={lineColor}
              fill="url(#msprFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default InsiderSentimentChart;

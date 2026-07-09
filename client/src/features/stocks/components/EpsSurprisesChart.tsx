"use client";
import { Box, Center, Heading } from "@chakra-ui/react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Loader from "@/src/components/ui/Loader";
import { EpsSurprise } from "@/src/features/stocks/types";

interface EpsSurprisesChartProps {
  epsSurprises: EpsSurprise[];
}

const BUBBLE_SIZE = 400;

const EpsSurprisesChart: React.FC<EpsSurprisesChartProps> = ({ epsSurprises }) => {
  if (epsSurprises.length === 0) {
    return (
      <Center h="300px">
        <Loader />
      </Center>
    );
  }

  const sorted = [...epsSurprises].sort(
    (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()
  );

  const actualData = sorted.map((d, i) => ({ x: i, y: d.actual, z: BUBBLE_SIZE, ...d }));
  const estimateData = sorted.map((d, i) => ({ x: i, y: d.estimate, z: BUBBLE_SIZE, ...d }));

  const axisColor = "var(--chakra-colors-fg)";

  const formatPeriodLabel = (period: string) =>
    new Date(period).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const renderXAxisTick = (props: { x?: string | number; y?: string | number; payload?: { value: number } }) => {
    const { x, y, payload } = props;
    const d = payload ? sorted[payload.value] : undefined;
    if (!d) return <g />;
    const surpriseColor = d.surprise >= 0 ? "var(--chakra-colors-positive)" : "var(--chakra-colors-negative)";
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={16} textAnchor="middle" fill={axisColor} fontSize={12}>
          {formatPeriodLabel(d.period)}
        </text>
        <text dy={34} textAnchor="middle" fill={surpriseColor} fontSize={14} fontWeight={600}>
          {d.surprise >= 0 ? "Beat" : "Missed"}: {Math.abs(d.surprise).toFixed(2)}
        </text>
      </g>
    );
  };

  return (
    <Box w="full" maxW="4xl" mx="auto" px={4} py={2}>
      <Heading size="sm" mb={2} textAlign="left">
        Historical EPS Surprises
      </Heading>
      <Box h="380px">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 20, right: 30, top: 10, bottom: 30 }}>
            <XAxis
              dataKey="x"
              type="number"
              domain={[-0.5, sorted.length - 0.5]}
              ticks={sorted.map((_, i) => i)}
              stroke={axisColor}
              tickLine={false}
              tick={renderXAxisTick}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Quarterly EPS"
              label={{ value: "Quarterly EPS", angle: -90, position: "insideLeft", dy: 40, fill: axisColor, fontSize: 12 }}
              stroke={axisColor}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
            />
            <ZAxis dataKey="z" range={[200, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload as EpsSurprise;
                return (
                  <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="md" p={3} boxShadow="md" fontSize="sm">
                    <Box textStyle="tooltipLabel" mb={1}>{formatPeriodLabel(data.period)}</Box>
                    <Box>Actual: {data.actual}</Box>
                    <Box>Estimate: {data.estimate}</Box>
                    <Box color={data.surprise >= 0 ? "positive" : "negative"}>
                      {data.surprise >= 0 ? "Beat" : "Missed"}: {Math.abs(data.surprise).toFixed(2)}
                    </Box>
                  </Box>
                );
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 14 }} />
            <Scatter name="Actual" data={actualData} fill="var(--chakra-colors-positive)" />
            <Scatter name="Estimate" data={estimateData} fill="rgba(59, 130, 246, 0.8)" />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default EpsSurprisesChart;

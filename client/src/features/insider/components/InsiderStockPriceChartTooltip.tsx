import { Box } from "@chakra-ui/react";

import { formatCurrency, formatNumber } from "@/src/utils/numberUtils";
import { parseMarketDate } from "@/src/utils/dateUtils";
import { ChartPoint } from "@/src/features/insider/types";

interface InsiderStockPriceChartTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  label?: any;
}

const aggregateTradesByPersonAndDirection = (
  trades: NonNullable<ChartPoint["tradeInfo"]>["trades"],
) => {
  const aggregated = new Map<string, { name: string; isBuy: boolean; change: number }>();

  trades.forEach((trade) => {
    const key = `${trade.name}|${trade.isBuy}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.change += trade.change;
    } else {
      aggregated.set(key, { name: trade.name, isBuy: trade.isBuy, change: trade.change });
    }
  });

  return Array.from(aggregated.values());
};

const InsiderStockPriceChartTooltip = ({
  active,
  payload,
  label,
}: InsiderStockPriceChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="md" p={3} boxShadow="md" fontSize="sm" minW="280px">
      <Box textStyle="tooltipLabel" mb={2}>
        {parseMarketDate(data.tradeInfo?.transactionDate ?? label ?? data.date).format("MMM D, YYYY")}
      </Box>
      <Box mb={2}>{formatCurrency(data.adjClose)}</Box>
      {data.tradeInfo && data.tradeInfo.trades.length > 0 && (
        <>
          {aggregateTradesByPersonAndDirection(data.tradeInfo.trades).map((trade, idx) => (
            <Box key={idx} color={trade.isBuy ? "positive" : "negative"} mb={1}>
              {trade.name}: {formatNumber(Math.abs(trade.change) / 1000)}K
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default InsiderStockPriceChartTooltip;

import { ChartPoint } from "@/src/features/insider/types";

interface InsiderStockPriceChartDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
  maxNetChange: number;
}

const getCircleRadius = (netChange: number, maxNetChange: number) => {
  if (maxNetChange === 0) return 4;
  const normalized = Math.abs(netChange) / maxNetChange;
  return 4 + normalized * 14;
};

const InsiderStockPriceChartDot = ({ cx, cy, payload, maxNetChange }: InsiderStockPriceChartDotProps) => {
  if (cx === undefined || cy === undefined || !payload?.tradeInfo) return null;

  const tradeInfo = payload.tradeInfo;
  if (tradeInfo.trades.length === 0) return null;

  const isBuy = tradeInfo.netChange > 0;
  const radius = getCircleRadius(tradeInfo.netChange, maxNetChange);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={isBuy ? "var(--chakra-colors-positive)" : "var(--chakra-colors-negative)"}
      fillOpacity={0.6}
      stroke={isBuy ? "var(--chakra-colors-positive-emphasized)" : "var(--chakra-colors-negative-emphasized)"}
      strokeWidth={1.5}
    />
  );
};

export default InsiderStockPriceChartDot;

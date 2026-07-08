import StockModalIntercept from "@/src/features/stocks/components/StockModalIntercept";

export default async function InterceptedStockModal({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return <StockModalIntercept ticker={ticker} />;
}

import StockPageView from "@/src/features/stocks/components/StockPageView";

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return <StockPageView ticker={ticker} />;
}

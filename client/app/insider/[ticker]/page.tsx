import InsiderPage from "@/src/features/insider/components/InsiderPage";

export default async function InsiderTickerPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return <InsiderPage initialSymbol={ticker.toUpperCase()} />;
}

import StocksPage from "@/src/features/stocks/components/StocksPage";
import { getDefaultTickers } from "@/src/server/defaultTickers";

export default async function Stocks() {
  const defaultTickers = await getDefaultTickers();

  return <StocksPage defaultTickers={defaultTickers} />;
}

import NewsDisplay from "../src/features/news/components/NewsPage";
import { DEFAULT_TICKERS } from "../src/constants/tickers";

export default function Home() {
  return <NewsDisplay initialTickerList={DEFAULT_TICKERS} />;
}

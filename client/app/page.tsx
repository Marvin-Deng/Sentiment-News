import NewsPage from "../src/features/news/components/NewsPage";
import { DEFAULT_TICKERS } from "../src/constants/tickers";

export default function Home() {
  return <NewsPage initialTickerList={DEFAULT_TICKERS} />;
}

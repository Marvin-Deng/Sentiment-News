import NewsDisplay from "../src/features/news/components/NewsPage";

const TICKER_LIST = ["AAPL", "MSFT", "GOOG", "TSLA", "AMZN", "NVDA"];

export default function Home() {
  return <NewsDisplay initialTickerList={TICKER_LIST} />;
}

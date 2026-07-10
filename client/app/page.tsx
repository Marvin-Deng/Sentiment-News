import NewsPage from "../src/features/news/components/NewsPage";
import { getDefaultTickers } from "../src/server/defaultTickers";

export default async function Home() {
  const defaultTickers = await getDefaultTickers();

  return <NewsPage initialTickerList={defaultTickers} />;
}

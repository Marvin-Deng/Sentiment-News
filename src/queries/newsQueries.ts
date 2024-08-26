import axios from "axios";

export const fetchArticles = async (
  curr_page: number,
  searchQuery: string,
  selectedTickers: Array<string>,
  sentiment: string,
  priceAction: string,
  endDate: string
) => {
  try {
    const queryParams = new URLSearchParams({
      page: curr_page.toString(),
      search_query: searchQuery || "",
      tickers: selectedTickers.join(","),
      sentiment: sentiment,
      price_action: priceAction,
      end_date: endDate,
    });

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/article/news?${queryParams}`
    );
    if (response.status != 200) {
      throw new Error(`Sentiment list request returned with status ${response.status}`);
    }
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching articles: ", error);
    return []
  }
};

export const fetchSentiments = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/article/sentiments`);
    if (response.status != 200) {
      throw new Error(`Sentiment list request returned with status ${response.status}`);
    }
    const sentiment_options = response.data.sentiment;
    return {
      Positive: new Set(sentiment_options.Positive),
      Negative: new Set(sentiment_options.Negative),
      Neutral: new Set(sentiment_options.Neutral),
    };
  } catch (error) {
    console.error("Error fetching sentiment options: ", error);
  }
};

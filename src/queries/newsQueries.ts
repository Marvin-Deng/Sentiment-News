import axios from "axios";

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
    console.error("Error fetching sentiment options:", error);
  }
};

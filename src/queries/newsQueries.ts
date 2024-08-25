import axios from "axios";

export const fetchSentiments = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/article/sentiments`);
    const res_data = response.data
    if (response.status === 200 && res_data) {
      const sentiment_options = res_data.sentiment
      return {
        Positive: new Set(sentiment_options.Positive),
        Negative: new Set(sentiment_options.Negative),
        Neutral: new Set(sentiment_options.Neutral),
      };
    } else {
      throw new Error("Failed to fetch sentiments: Invalid response data");
    }
  } catch (error) {
    console.error("Error fetching sentiment options:", error);
    throw error;
  }
};

export default fetchSentiments;

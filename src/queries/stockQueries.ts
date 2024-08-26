import axios from "axios";

import { dateToISOString } from "@/src/utils/dateUtils";
import { PriceData } from "@/src/types/Stock";

export const fetchEodData = async (ticker: string, startDate: Date) => {
  try {
    const params = {
      ticker: ticker,
      start_date: dateToISOString(startDate),
      end_date: dateToISOString(new Date()),
      format: "json",
      resampleFreq: "monthly",
    };
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stock/tinngo_eod`, {
      params: params,
    });
    if (response.status !== 200) {
      throw new Error(`Tinngo EOD request returned with ${response.status}`);
    }
    const priceData = response.data.eod_data.map((d: PriceData) => ({
      date: new Date(d?.date),
      open: +d?.open,
      close: +d?.close,
      low: +d?.low,
      high: +d?.high,
      volume: +d?.volume,
      adjOpen: +d?.adjOpen,
      adjHigh: +d?.adjHigh,
      adjLow: +d?.adjLow,
      adjClose: +d?.adjClose,
      adjVolume: +d?.adjVolume,
      divCash: +d?.divCash,
      splitFactor: +d?.splitFactor,
    }));
    return priceData;
  } catch (error) {
    console.error("Failed to fetch stock prices: ", error);
    return [];
  }
};

export const fetchTickerList = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stock/tickers`);
    if (response.status != 200) {
      throw new Error(`Ticker list request returned with status ${response.status}`);
    }
    return response.data.tickers;
  } catch (error) {
    console.error("Error fetching tickers: ", error);
  }
};

export const fetchQuoteInfo = async (ticker: string) => {
  try {
    const response = await axios.get(`/api/stock/quote?ticker=${ticker}`);
    if (response.status != 200) {
      throw new Error(`Finnhub quote request returned with status ${response.status}`);
    }
    return response.data.quoteInfo;
  } catch (error) {
    console.error(`Error fetching quote info for ${ticker}:`, error);
  }
};

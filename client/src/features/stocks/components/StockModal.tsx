"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import LineChart from "@/src/features/stocks/components/LineChart";
import DataTable from "@/src/features/stocks/components/DataTable";

import { fetchEodData, fetchQuoteInfo, QuoteInfo } from "@/src/features/stocks/api";
import { PriceData, DEFAULT_PRICE_DATA } from "@/src/features/stocks/types";
import { getPriceColorStr, getPriceDiffStr, getPercentChangeStr } from "@/src/utils/priceUtils";

interface StockModalProps {
  company: string;
  ticker: string;
  isOpen: boolean;
  handleClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ company, ticker, isOpen, handleClose }) => {
  const { theme } = useTheme();
  const [selectedRange, setSelectedRange] = useState("YTD");
  const [startDate, setStartDate] = useState(new Date());
  const [stockDataMap, setStockDataMap] = useState(new Map<string, PriceData[]>());
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [currPriceData, setCurrPriceData] = useState<PriceData>(DEFAULT_PRICE_DATA);

  const getCurrTickerData = () => stockDataMap.get(ticker) || [];

  const getPriceDataRange = () => {
    return getCurrTickerData().filter((priceData) => {
      const date = new Date(priceData.date);
      return date >= startDate && date <= new Date();
    });
  };

  useEffect(() => {
    const fetchStockPrices = async () => {
      const priceData = await fetchEodData(ticker, startDate);
      setStockDataMap((prevMap) => new Map(prevMap.set(ticker, priceData as PriceData[])));
    };

    if (isOpen) {
      const tickerStockData = getCurrTickerData();
      if (tickerStockData.length === 0) {
        fetchStockPrices();
      } else {
        const earliestData = new Date(tickerStockData[0].date);
        if (startDate < earliestData) fetchStockPrices();
      }
    }
  }, [ticker, startDate]);

  useEffect(() => {
    const tickerData = getCurrTickerData();
    if (tickerData.length > 0) {
      setCurrPriceData(tickerData[tickerData.length - 1]);
    }
  }, [stockDataMap, ticker]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuote = async () => {
      try {
        const data = await fetchQuoteInfo(ticker);
        setQuoteInfo(data);
      } catch {
        setQuoteInfo(null);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 5000);
    return () => clearInterval(interval);
  }, [isOpen, ticker]);

  useEffect(() => {
    const today = new Date();
    let start = new Date();
    switch (selectedRange) {
      case "1W": start.setDate(today.getDate() - 7); break;
      case "1M": start.setMonth(today.getMonth() - 1); break;
      case "3M": start.setMonth(today.getMonth() - 3); break;
      case "6M": start.setMonth(today.getMonth() - 6); break;
      case "YTD": start = new Date(today.getFullYear(), 0, 1); break;
      case "1Y": start.setFullYear(today.getFullYear() - 1); break;
      case "2Y": start.setFullYear(today.getFullYear() - 2); break;
      case "5Y": start.setFullYear(today.getFullYear() - 5); break;
      default: start.setDate(today.getDate() - 7);
    }
    setStartDate(start);
  }, [selectedRange]);

  if (!isOpen) return null;

  const bgColor = theme === "light" ? "white" : "black";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="relative w-full max-w-5xl max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div
          className="relative pb-10 border-gray-400 border-2 rounded-xl"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center justify-between p-4 md:p-5 border-b dark:border-gray-600">
            <h3 className="text-xl font-semibold">
              {company} ({ticker})
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white hover:text-gray-900 font-bold rounded-lg text-xl ml-5 w-10 h-10 ms-auto inline-flex justify-center items-center"
              onClick={handleClose}
            >
              X<span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="flex justify-around p-4">
            {["1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "5Y"].map((range) => (
              <button
                key={range}
                className={`relative overflow-hidden py-2 px-4 rounded-lg ${
                  selectedRange === range ? "bg-gray-600 text-white" : "bg-transparent"
                } group`}
                onClick={() => setSelectedRange(range)}
              >
                {range}
                {selectedRange !== range && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                    style={{ backgroundColor: theme === "light" ? "black" : "white" }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-start ml-[12vw] p-4">
            <div className="flex space-x-3">
              <p className="text-xl font-semibold">{`${currPriceData.close}`}</p>
              <p
                className={`text-lg font-semibold text-${getPriceColorStr(
                  currPriceData.open,
                  currPriceData.close
                )}`}
              >
                {getPriceDiffStr(currPriceData.open, currPriceData.close)}
                <span> ({getPercentChangeStr(currPriceData.open, currPriceData.close)})</span>
              </p>
            </div>
            <p className="text-sm mt-1">{`At close on ${currPriceData.date}`}</p>
          </div>
          <LineChart ticker={ticker} priceData={getPriceDataRange()} />
          <div className="flex justify-center">
            <div className="w-4/5 sm:w-1/2">
              <DataTable currPriceData={currPriceData} quoteInfo={quoteInfo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockModal;

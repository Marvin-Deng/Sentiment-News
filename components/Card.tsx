import React from "react";
import { Article } from "@/types/Article";

const Card: React.FC<Article> = ({
  title,
  publication_datetime,
  summary,
  image_url,
  article_url,
  ticker,
  sentiment,
  market_date,
  open_price,
  close_price,
}) => {
  const truncateSummary = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const getDifference = (openPrice: number, closePrice: number) => {
    return (closePrice - openPrice).toFixed(2);
  };

  const getPriceAction = (openPrice: number, closePrice: number) => {
    return (((closePrice - openPrice) / closePrice) * 100).toFixed(2);
  };

  return (
    <div className="flex-shrink-0 shadow-md border dark:border-white rounded-lg overflow-hidden flex p-4">
      <div className="w-full p-4">
        <img
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover mb-2"
        />
        <p className="mb-2">{publication_datetime}</p>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="flex flex-row space-x-4">
          <p className="text-red-400 text-xl font-bold">{ticker}</p>
          <p
            className={`text-xl font-semibold ${
              sentiment === "Positive"
                ? "text-green-500"
                : sentiment === "Negative"
                ? "text-red-500"
                : ""
            }`}
          >
            {sentiment}
          </p>
        </div>
        <p>{truncateSummary(summary, 300)}</p>

        <h1 className="mt-4 text-lg">Price Action On: {market_date}</h1>

        <div className="flex flex-row space-x-4">
          <p>O: {open_price}</p>
          <p>C: {close_price}</p>
          <p
            className={`${
              open_price < close_price
                ? "text-green-500"
                : open_price > close_price
                ? "text-red-500"
                : ""
            }`}
          >
            {open_price < close_price
              ? "▲"
              : open_price > close_price
              ? "▼"
              : ""}
            {getDifference(open_price, close_price)} (
            {getPriceAction(open_price, close_price)})%
          </p>
        </div>

        <a
          href={article_url}
          className={`border text-red-500 border-red-500 hover:text-white hover:bg-red-500 transform hover:scale-105 font-semibold py-2 px-4 rounded mt-4 inline-block transition duration-300 ease-in-out cursor-pointer`}
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default Card;

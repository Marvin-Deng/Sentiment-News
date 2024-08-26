import React from "react";

import HeaderCard from "@/src/components/Navbar/HeaderCard";

import { fetchTickerList } from "@/src/queries/stockQueries";
import { useQueryNoRefetch } from "@/src/queries/queryHook";

const StockHeader = () => {
  const { data: tickerList } = useQueryNoRefetch("tickerList", fetchTickerList);

  return (
    <div className="flex overflow-x-scroll space-x-2 p-2">
      {tickerList &&
        tickerList.map((ticker: string, index: number) => (
          <HeaderCard key={index} ticker={ticker} />
        ))}
    </div>
  );
};

export default StockHeader;

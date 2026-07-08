"use client";
import { useRouter } from "next/navigation";

import StockModal from "@/src/features/stocks/components/StockModal";

interface StockModalInterceptProps {
  ticker: string;
}

const StockModalIntercept = ({ ticker }: StockModalInterceptProps) => {
  const router = useRouter();
  return <StockModal ticker={ticker} onClose={() => router.back()} />;
};

export default StockModalIntercept;

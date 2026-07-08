"use client";
import { useRouter } from "next/navigation";

import StockModal from "@/src/features/stocks/components/StockModal";

interface StockPageViewProps {
  ticker: string;
}

const StockPageView = ({ ticker }: StockPageViewProps) => {
  const router = useRouter();
  return <StockModal ticker={ticker} onClose={() => router.push("/stocks")} />;
};

export default StockPageView;

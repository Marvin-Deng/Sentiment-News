"use client";
import React, { useState, useEffect } from "react";
import { CompanyProfile } from "@/src/features/stocks/types";
import { getPriceDiffStr } from "@/src/utils/priceUtils";
import { fetchQuoteInfo } from "@/src/features/stocks/api";

interface TickerCardProps {
  ticker: string;
}

const TickerCard: React.FC<TickerCardProps> = ({ ticker }) => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<{ current: number; change: number } | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/stock/company_profile?ticker=${ticker}`);
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data = await res.json();
        setCompanyProfile(data.company_profile);
      } catch {
        setCompanyProfile(null);
        setFetchSuccess(false);
      }
    };

    const fetchQuote = async () => {
      try {
        const data = await fetchQuoteInfo(ticker);
        setQuoteInfo({ current: data.current, change: data.change });
      } catch {
        setQuoteInfo(null);
      }
    };

    fetchProfile();
    fetchQuote();
  }, [ticker]);

  if (!fetchSuccess) return null;

  return (
    <div className="max-w-screen-lg mx-auto mt-10 mb-10 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105">
      {companyProfile && (
        <div className="shadow-md border rounded-lg overflow-hidden p-4 flex items-center space-x-4">
          {companyProfile.logo && (
            <img
              src={companyProfile.logo}
              alt={`${companyProfile.name} logo`}
              className="w-12 h-12"
            />
          )}
          <div className="flex-grow">
            <p className="text-sm">
              {companyProfile.ticker} - {companyProfile.name} - {companyProfile.exchange}
            </p>
          </div>
          {quoteInfo && (
            <div className="flex flex-col items-center text-sm p-2 font-bold">
              <p>{quoteInfo.current.toFixed(2)}</p>
              <p
                className={`inline-block px-2 py-1 rounded text-white ${
                  quoteInfo.change >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {quoteInfo.change >= 0 ? `+${quoteInfo.change.toFixed(2)}` : quoteInfo.change.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickerCard;

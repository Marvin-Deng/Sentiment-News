import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { FALLBACK_TICKERS, sanitizeTickers } from "@/src/constants/tickers";

const STATSIG_CONFIG_NAME = "news-config";
const STATSIG_TICKERS_KEY = "tickers";
const STATSIG_DEFAULT_USER_ID = "nextjs-default-tickers";

type StatsigConfigResponse = {
  value?: {
    tickers?: string[];
  };
};

export const getDefaultTickers = cache(async (): Promise<string[]> => {
  noStore();

  const statsigKey = process.env.STATSIG_KEY?.trim();
  if (!statsigKey) {
    return [...FALLBACK_TICKERS];
  }

  try {
    const response = await fetch("https://api.statsig.com/v1/get_config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "statsig-api-key": statsigKey,
      },
      body: JSON.stringify({
        configName: STATSIG_CONFIG_NAME,
        user: {
          userID: STATSIG_DEFAULT_USER_ID,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `Statsig ticker config request failed with status ${response.status}; using fallback tickers.`,
      );
      return [...FALLBACK_TICKERS];
    }

    const payload = (await response.json()) as StatsigConfigResponse;
    return sanitizeTickers(payload.value?.[STATSIG_TICKERS_KEY]);
  } catch (error) {
    console.warn("Statsig ticker config request failed; using fallback tickers.", error);
    return [...FALLBACK_TICKERS];
  }
});

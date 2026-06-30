import { NextResponse } from "next/server";

export async function GET() {
  // TODO: replace with real ticker source
  const tickers = ["AAPL", "MSFT", "GOOG", "TSLA", "AMZN", "NVDA"];
  return NextResponse.json({ tickers });
}

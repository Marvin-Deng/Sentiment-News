import { NextResponse } from "next/server";

export async function GET() {
  // TODO: replace with real data source
  return NextResponse.json({
    sentiment: {
      Positive: ["Bullish", "Good"],
      Negative: ["Bearish", "Bad"],
      Neutral: ["Flat"],
    },
  });
}

import { NextResponse } from "next/server";
import { DEFAULT_TICKERS } from "@/src/constants/tickers";

export async function GET() {
  return NextResponse.json({ tickers: DEFAULT_TICKERS });
}

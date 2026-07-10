import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firestore";

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { sources: string[]; expiresAt: number } | null = null;

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json({ sources: cache.sources });
  }

  const db = getFirestore();
  try {
    const snapshot = await db.collection("articles").select("source").get();

    const sources = Array.from(
      new Set(
        snapshot.docs
          .map((doc) => doc.get("source"))
          .filter((source): source is string => !!source),
      ),
    ).sort();

    cache = { sources, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("failed to query article sources", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 },
    );
  }
}

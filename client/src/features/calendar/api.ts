import { EarningsEvent, IpoEvent } from "@/src/features/calendar/types";
import { getCached, setCached } from "@/src/utils/sessionCache";
import { getDateRangeChunks } from "@/src/utils/dateUtils";

const CALENDAR_TTL_SECONDS = 3600;
const EARNINGS_CHUNK_DAYS = 30;

const earningsKey = (event: EarningsEvent) =>
  `${event.symbol}:${event.date}:${event.quarter}:${event.year}`;

const fetchEarningsCalendarChunk = async (from: string, to: string): Promise<EarningsEvent[]> => {
  const res = await fetch(`/api/calendar/earnings?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`fetchEarningsCalendar failed: ${res.status}`);
  const { earnings_calendar } = await res.json();
  return earnings_calendar as EarningsEvent[];
};

export const fetchIpoCalendar = async (from: string, to: string): Promise<IpoEvent[]> => {
  const cacheKey = `ipo-calendar:${from}:${to}`;
  const cached = getCached<IpoEvent[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/calendar/ipo?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`fetchIpoCalendar failed: ${res.status}`);
  const { ipo_calendar } = await res.json();
  setCached(cacheKey, ipo_calendar, CALENDAR_TTL_SECONDS);
  return ipo_calendar as IpoEvent[];
};

export const fetchEarningsCalendar = async (from: string, to: string): Promise<EarningsEvent[]> => {
  const cacheKey = `earnings-calendar:v2:${from}:${to}`;
  const cached = getCached<EarningsEvent[]>(cacheKey);
  if (cached) return cached;

  const chunks = getDateRangeChunks(from, to, EARNINGS_CHUNK_DAYS);
  const chunkResults = await Promise.all(
    chunks.map(({ from: chunkFrom, to: chunkTo }) => fetchEarningsCalendarChunk(chunkFrom, chunkTo)),
  );

  const merged = new Map<string, EarningsEvent>();
  chunkResults.flat().forEach((event) => {
    merged.set(earningsKey(event), event);
  });

  const earnings = Array.from(merged.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  setCached(cacheKey, earnings, CALENDAR_TTL_SECONDS);
  return earnings;
};

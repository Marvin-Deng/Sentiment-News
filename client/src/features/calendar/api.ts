import { EarningsEvent, IpoEvent } from "@/src/features/calendar/types";
import { getCached, setCached } from "@/src/utils/sessionCache";

const CALENDAR_TTL_SECONDS = 3600;

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
  const cacheKey = `earnings-calendar:${from}:${to}`;
  const cached = getCached<EarningsEvent[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/calendar/earnings?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`fetchEarningsCalendar failed: ${res.status}`);
  const { earnings_calendar } = await res.json();
  setCached(cacheKey, earnings_calendar, CALENDAR_TTL_SECONDS);
  return earnings_calendar as EarningsEvent[];
};

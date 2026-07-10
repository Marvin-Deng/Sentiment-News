import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const MARKET_TIMEZONE = "America/New_York";
const MARKET_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dateToISOString = (date: Date) => dayjs(date).format("YYYY-MM-DD");

export const getDateDaysBefore = (days_duration: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days_duration);
  return dateToISOString(startDate);
};

export const getDateDaysAfter = (days_duration: number) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days_duration);
  return dateToISOString(endDate);
};

export const getDateYearsAfter = (years: number) => dayjs().add(years, "year").format("YYYY-MM-DD");

export const getDateRangeChunks = (
  from: string,
  to: string,
  chunkDays: number,
): { from: string; to: string }[] => {
  const chunks: { from: string; to: string }[] = [];
  let cursor = dayjs(from);
  const end = dayjs(to);

  while (cursor.isBefore(end, "day") || cursor.isSame(end, "day")) {
    const chunkEnd = cursor.add(chunkDays - 1, "day");
    const boundedEnd = chunkEnd.isAfter(end, "day") ? end : chunkEnd;
    chunks.push({
      from: cursor.format("YYYY-MM-DD"),
      to: boundedEnd.format("YYYY-MM-DD"),
    });
    cursor = boundedEnd.add(1, "day");
  }

  return chunks;
};

export const getNextDateString = (date: string) => dayjs(date).add(1, "day").format("YYYY-MM-DD");

export const utcStringToLocal = (utcDatetime: string): string => {
  const localDate = dayjs.utc(utcDatetime).local();
  const tzAbbreviation = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(localDate.toDate())
    .find((part) => part.type === "timeZoneName")?.value;
  return `${localDate.format("MMMM D, YYYY h:mm A")} ${tzAbbreviation ?? ""}`.trim();
};

// Tiingo encodes the trading day as UTC midnight (e.g. 2026-07-09T00:00:00.000Z).
// Always read the YYYY-MM-DD portion — never shift a Date object into US timezones.
export const toMarketDateISO = (date: string | Date | null | undefined): string | null => {
  if (date == null) return null;

  if (typeof date === "string") {
    const iso = date.slice(0, 10);
    return MARKET_DATE_PATTERN.test(iso) ? iso : null;
  }

  if (!Number.isFinite(date.getTime())) return null;

  const iso = dayjs.utc(date).format("YYYY-MM-DD");
  return MARKET_DATE_PATTERN.test(iso) ? iso : null;
};

export const parseMarketDate = (date: string | Date | null | undefined) => {
  const iso = toMarketDateISO(date);
  if (!iso) return dayjs(null);
  return dayjs.tz(iso, MARKET_TIMEZONE);
};

export const todayMarketDate = () => dayjs().tz(MARKET_TIMEZONE).format("YYYY-MM-DD");

export const formatDate = (date: string): string => dayjs(date).format("MMMM D, YYYY");

export const formatDateEST = (date: string | Date | null | undefined): string => {
  const parsed = parseMarketDate(date);
  return parsed.isValid() ? parsed.format("MMMM D, YYYY") : "—";
};

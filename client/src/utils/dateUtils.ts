import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const dateToISOString = (date: Date) => dayjs(date).format("YYYY-MM-DD");

export const getDateDaysBefore = (days_duration: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days_duration);
  return dateToISOString(startDate);
};

export const unixToLocal = (unixTime: number): string => {
  const dateObject = dayjs(unixTime);
  return dateObject.tz("UTC").format("YYYY-MM-DD HH:mm:ss Z");
};

export const utcStringToLocal = (utcDatetime: string): string => {
  const localDate = dayjs.utc(utcDatetime).local();
  const tzAbbreviation = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(localDate.toDate())
    .find((part) => part.type === "timeZoneName")?.value;
  return `${localDate.format("MMMM D, YYYY h:mm A")} ${tzAbbreviation ?? ""}`.trim();
};

export const formatDate = (date: string): string => {
  return dayjs(date).format("MMMM D, YYYY");
};

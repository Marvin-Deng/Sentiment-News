"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Center, Text } from "@chakra-ui/react";

import PageLayout from "@/src/components/layout/PageLayout";
import Loader from "@/src/components/ui/Loader";
import CalendarListView from "@/src/features/calendar/components/CalendarListView";
import CalendarMonthView from "@/src/features/calendar/components/CalendarMonthView";

import { fetchEarningsCalendar, fetchIpoCalendar } from "@/src/features/calendar/api";
import { DayEvents, EarningsEvent, IpoEvent } from "@/src/features/calendar/types";
import { getDateDaysAfter, getDateDaysBefore } from "@/src/utils/dateUtils";

const LOOKAHEAD_DAYS = 30;
const VIEWS = ["Calendar", "List"] as const;
type View = (typeof VIEWS)[number];

const CalendarPage = () => {
  const [ipoEvents, setIpoEvents] = useState<IpoEvent[] | null>(null);
  const [earningsEvents, setEarningsEvents] = useState<EarningsEvent[] | null>(null);
  const [view, setView] = useState<View>("Calendar");

  useEffect(() => {
    const today = getDateDaysBefore(0);
    const end = getDateDaysAfter(LOOKAHEAD_DAYS);

    fetchIpoCalendar(today, end)
      .then(setIpoEvents)
      .catch(() => setIpoEvents([]));

    fetchEarningsCalendar(today, end)
      .then(setEarningsEvents)
      .catch(() => setEarningsEvents([]));
  }, []);

  const daysEvents: DayEvents[] = useMemo(() => {
    if (!ipoEvents || !earningsEvents) return [];

    const dates = new Set<string>([
      ...ipoEvents.map((event) => event.date),
      ...earningsEvents.map((event) => event.date),
    ]);

    return Array.from(dates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((date) => ({
        date,
        ipos: ipoEvents.filter((event) => event.date === date),
        earnings: earningsEvents.filter((event) => event.date === date),
      }));
  }, [ipoEvents, earningsEvents]);

  const isLoading = ipoEvents === null || earningsEvents === null;

  const filters = (
    <>
      {VIEWS.map((option) => (
        <Box
          key={option}
          as="button"
          py={2}
          px={4}
          borderRadius="lg"
          cursor="pointer"
          bg={view === option ? "gray.600" : "transparent"}
          color={view === option ? "white" : undefined}
          _hover={{
            bg: view === option ? "gray.600" : "gray.100",
            color: view === option ? "white" : "black",
          }}
          onClick={() => setView(option)}
        >
          {option}
        </Box>
      ))}
    </>
  );

  return (
    <PageLayout title="Calendar" subtitle="Upcoming IPOs and earnings releases" filters={filters}>
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}

      {!isLoading && daysEvents.length === 0 && (
        <Text mt={8} fontSize="lg">
          No upcoming events in the next {LOOKAHEAD_DAYS} days.
        </Text>
      )}

      {!isLoading && daysEvents.length > 0 && (
        <Box mt={8}>
          {view === "List" ? (
            <CalendarListView daysEvents={daysEvents} />
          ) : (
            <CalendarMonthView daysEvents={daysEvents} />
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default CalendarPage;

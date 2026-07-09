"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Center, Flex, Text } from "@chakra-ui/react";

import PageLayout from "@/src/components/layout/PageLayout";
import Loader from "@/src/components/ui/Loader";
import CalendarListView from "@/src/features/calendar/components/CalendarListView";
import CalendarMonthView from "@/src/features/calendar/components/CalendarMonthView";

import { fetchEarningsCalendar, fetchIpoCalendar } from "@/src/features/calendar/api";
import { DayEvents, EarningsEvent, IpoEvent } from "@/src/features/calendar/types";
import { getDateDaysAfter, getDateDaysBefore } from "@/src/utils/dateUtils";

const LOOKAHEAD_DAYS = 30;
const VIEWS = ["Calendar", "List"] as const;
const EVENT_FILTERS = ["All", "Earnings", "IPOs"] as const;
type View = (typeof VIEWS)[number];
type EventFilter = (typeof EVENT_FILTERS)[number];

const CalendarPage = () => {
  const [ipoEvents, setIpoEvents] = useState<IpoEvent[] | null>(null);
  const [earningsEvents, setEarningsEvents] = useState<EarningsEvent[] | null>(null);
  const [view, setView] = useState<View>("Calendar");
  const [eventFilter, setEventFilter] = useState<EventFilter>("All");

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

  const filteredDaysEvents = useMemo(() => {
    if (eventFilter === "All") return daysEvents;

    return daysEvents
      .map((day) => ({
        date: day.date,
        earnings: eventFilter === "Earnings" ? day.earnings : [],
        ipos: eventFilter === "IPOs" ? day.ipos : [],
      }))
      .filter((day) =>
        eventFilter === "Earnings" ? day.earnings.length > 0 : day.ipos.length > 0,
      );
  }, [daysEvents, eventFilter]);

  const isLoading = ipoEvents === null || earningsEvents === null;

  const emptyMessage =
    eventFilter === "Earnings"
      ? `No upcoming earnings in the next ${LOOKAHEAD_DAYS} days.`
      : eventFilter === "IPOs"
        ? `No upcoming IPOs in the next ${LOOKAHEAD_DAYS} days.`
        : `No upcoming events in the next ${LOOKAHEAD_DAYS} days.`;

  const viewButtonStyles = (isActive: boolean) => ({
    py: 2,
    px: 4,
    borderRadius: "lg",
    cursor: "pointer",
    bg: isActive ? "gray.600" : "transparent",
    color: isActive ? "white" : undefined,
    _hover: {
      bg: isActive ? "gray.600" : "gray.100",
      color: isActive ? "white" : "black",
    },
  });

  const eventFilterButtonStyles = (isActive: boolean) => ({
    py: 1,
    px: 2.5,
    fontSize: "sm",
    borderRadius: "md",
    cursor: "pointer",
    bg: isActive ? "gray.600" : "transparent",
    color: isActive ? "white" : undefined,
    _hover: {
      bg: isActive ? "gray.600" : "gray.100",
      color: isActive ? "white" : "black",
    },
  });

  const filters = (
    <Flex direction="column" align="flex-start" gap={2}>
      <Flex gap={3}>
        {VIEWS.map((option) => (
          <Box
            key={option}
            as="button"
            {...viewButtonStyles(view === option)}
            onClick={() => setView(option)}
          >
            {option}
          </Box>
        ))}
      </Flex>
      <Flex gap={2}>
        {EVENT_FILTERS.map((option) => (
          <Box
            key={option}
            as="button"
            {...eventFilterButtonStyles(eventFilter === option)}
            onClick={() => setEventFilter(option)}
          >
            {option}
          </Box>
        ))}
      </Flex>
    </Flex>
  );

  return (
    <PageLayout title="Calendar" subtitle="Upcoming IPOs and earnings releases" filters={filters}>
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}

      {!isLoading && filteredDaysEvents.length === 0 && (
        <Text mt={8} fontSize="lg">
          {emptyMessage}
        </Text>
      )}

      {!isLoading && filteredDaysEvents.length > 0 && (
        <Box mt={8}>
          {view === "List" ? (
            <CalendarListView daysEvents={filteredDaysEvents} />
          ) : (
            <CalendarMonthView daysEvents={filteredDaysEvents} />
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default CalendarPage;

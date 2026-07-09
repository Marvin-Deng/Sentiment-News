"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Center, Flex, Text } from "@chakra-ui/react";

import PageLayout from "@/src/components/layout/PageLayout";
import SearchBar from "@/src/components/navbar/SearchBar";
import Loader from "@/src/components/ui/Loader";
import CalendarListView from "@/src/features/calendar/components/CalendarListView";
import CalendarMonthView from "@/src/features/calendar/components/CalendarMonthView";

import { fetchEarningsCalendar, fetchIpoCalendar } from "@/src/features/calendar/api";
import { DayEvents, EarningsEvent, IpoEvent } from "@/src/features/calendar/types";
import { useSearch } from "@/src/providers/SearchProvider";
import { getDateDaysBefore, getDateYearsAfter } from "@/src/utils/dateUtils";

const RANGE_YEARS = 1;
const VIEWS = ["Calendar", "List"] as const;
const EVENT_FILTERS = ["All", "Earnings", "IPOs"] as const;
type View = (typeof VIEWS)[number];
type EventFilter = (typeof EVENT_FILTERS)[number];

const CalendarPage = () => {
  const [ipoEvents, setIpoEvents] = useState<IpoEvent[] | null>(null);
  const [earningsEvents, setEarningsEvents] = useState<EarningsEvent[] | null>(null);
  const [view, setView] = useState<View>("Calendar");
  const [eventFilter, setEventFilter] = useState<EventFilter>("All");
  const { searchQuery } = useSearch();

  useEffect(() => {
    const today = getDateDaysBefore(0);
    const end = getDateYearsAfter(RANGE_YEARS);

    fetchIpoCalendar(today, end)
      .then(setIpoEvents)
      .catch(() => setIpoEvents([]));

    fetchEarningsCalendar(today, end)
      .then(setEarningsEvents)
      .catch(() => setEarningsEvents([]));
  }, []);

  const rangeEndDate = useMemo(() => getDateYearsAfter(RANGE_YEARS), []);

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

  const visibleDaysEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return filteredDaysEvents;

    const terms = query.split(" ").filter(Boolean);

    return filteredDaysEvents
      .map((day) => ({
        date: day.date,
        earnings: day.earnings.filter((event) =>
          terms.some((term) => event.symbol.toLowerCase().includes(term)),
        ),
        ipos: day.ipos.filter((event) =>
          terms.some(
            (term) =>
              event.symbol.toLowerCase().includes(term) ||
              event.name.toLowerCase().includes(term),
          ),
        ),
      }))
      .filter((day) => day.earnings.length > 0 || day.ipos.length > 0);
  }, [filteredDaysEvents, searchQuery]);

  const isLoading = ipoEvents === null || earningsEvents === null;

  const emptyMessage = searchQuery.trim()
    ? `No events matching "${searchQuery.trim()}".`
    : eventFilter === "Earnings"
      ? "No upcoming earnings in the next year."
      : eventFilter === "IPOs"
        ? "No upcoming IPOs in the next year."
        : "No upcoming events in the next year.";

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
    <PageLayout
      title="Calendar"
      subtitle="Upcoming IPOs and earnings releases"
      searchBar={<SearchBar />}
      filters={filters}
    >
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}

      {!isLoading && visibleDaysEvents.length === 0 && (
        <Text mt={8} fontSize="lg">
          {emptyMessage}
        </Text>
      )}

      {!isLoading && visibleDaysEvents.length > 0 && (
        <Box mt={8}>
          {view === "List" ? (
            <CalendarListView daysEvents={visibleDaysEvents} />
          ) : (
            <CalendarMonthView daysEvents={visibleDaysEvents} rangeEndDate={rangeEndDate} />
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default CalendarPage;

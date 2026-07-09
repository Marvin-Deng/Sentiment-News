"use client";
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { Box, Flex, Grid, IconButton, Link, Text } from "@chakra-ui/react";

import CalendarListView from "@/src/features/calendar/components/CalendarListView";
import { DayEvents } from "@/src/features/calendar/types";

interface CalendarMonthViewProps {
  daysEvents: DayEvents[];
  rangeEndDate: string;
}

interface CalendarDayButtonProps {
  dateKey: string;
  dayNumber: number;
  dayEvents?: DayEvents;
  isSelected: boolean;
  isToday: boolean;
  isOutsideMonth: boolean;
  onSelect: (dateKey: string) => void;
  onHoverStart?: () => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TOOLTIP_ITEM_LIMIT = 5;

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isPastDate = (day: Date, today: Date) => startOfDay(day) < startOfDay(today);

const isAfterRangeEnd = (day: Date, rangeEnd: Date) => startOfDay(day) > startOfDay(rangeEnd);

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

type TooltipItem =
  | { type: "earnings"; key: string; symbol: string }
  | { type: "ipo"; key: string; name: string };

const CalendarDayButton = ({
  dateKey,
  dayNumber,
  dayEvents,
  isSelected,
  isToday,
  isOutsideMonth,
  onSelect,
  onHoverStart,
}: CalendarDayButtonProps) => {
  return (
    <Box
      as="button"
      onClick={() => onSelect(dateKey)}
      onMouseEnter={onHoverStart}
      cursor="pointer"
      minH="64px"
      p={2}
      borderWidth="1px"
      borderColor={isSelected ? "green.500" : "border"}
      borderRadius="md"
      bg={isSelected ? "green.subtle" : "transparent"}
      opacity={isOutsideMonth ? 0.4 : 1}
      textAlign="left"
      w="full"
      transition="background 0.15s ease, border-color 0.15s ease"
      _hover={
        isSelected
          ? { bg: "green.muted", borderColor: "green.500" }
          : { bg: "bg.muted", borderColor: "border.emphasized" }
      }
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <Text fontSize="sm" fontWeight={isToday ? "bold" : "normal"}>
        {dayNumber}
      </Text>
      {dayEvents && (
        <Flex gap={1} mt={1}>
          {dayEvents.earnings.length > 0 && (
            <Box w="6px" h="6px" borderRadius="full" bg="blue.400" />
          )}
          {dayEvents.ipos.length > 0 && (
            <Box w="6px" h="6px" borderRadius="full" bg="purple.400" />
          )}
        </Flex>
      )}
    </Box>
  );
};

const DayEventsTooltipContent = ({ dayEvents }: { dayEvents: DayEvents }) => {
  const items: TooltipItem[] = [
    ...dayEvents.earnings.map((event, index) => ({
      type: "earnings" as const,
      key: `earnings-${event.symbol}-${index}`,
      symbol: event.symbol,
    })),
    ...dayEvents.ipos.map((event, index) => ({
      type: "ipo" as const,
      key: `ipo-${event.symbol}-${index}`,
      name: event.name,
    })),
  ];

  const visibleItems = items.slice(0, TOOLTIP_ITEM_LIMIT);
  const hasMore = items.length > TOOLTIP_ITEM_LIMIT;

  return (
    <Flex direction="column" gap={1.5} py={0.5}>
      {visibleItems.map((item) =>
        item.type === "earnings" ? (
          <Flex key={item.key} align="center" gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg="blue.400" flexShrink={0} />
            <Text fontSize="sm" whiteSpace="nowrap" color="inherit">
              <Link asChild color="inherit" _hover={{ textDecoration: "underline", color: "green.400" }}>
                <NextLink href={`/stocks/${item.symbol}`}>{item.symbol} Earnings</NextLink>
              </Link>
            </Text>
          </Flex>
        ) : (
          <Flex key={item.key} align="center" gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg="purple.400" flexShrink={0} />
            <Text fontSize="sm" whiteSpace="nowrap" color="inherit">
              {item.name} IPO
            </Text>
          </Flex>
        ),
      )}
      {hasMore && (
        <Text fontSize="sm" color="inherit">
          ...
        </Text>
      )}
    </Flex>
  );
};

const CalendarMonthView = ({ daysEvents, rangeEndDate }: CalendarMonthViewProps) => {
  const today = useMemo(() => new Date(), []);
  const rangeEnd = useMemo(() => new Date(`${rangeEndDate}T00:00:00`), [rangeEndDate]);
  const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(() => toDateKey(new Date()));
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DayEvents>();
    daysEvents.forEach((day) => map.set(day.date, day));
    return map;
  }, [daysEvents]);

  const isCurrentMonthView = isSameMonth(monthCursor, today);

  useEffect(() => {
    if (isCurrentMonthView) {
      setSelectedDate(toDateKey(today));
    } else {
      setSelectedDate(null);
    }
  }, [monthCursor, isCurrentMonthView, today]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - startOffset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }

    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [monthCursor]);

  const monthLabel = monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedDayEvents = selectedDate ? eventsByDate.get(selectedDate) : undefined;
  const canGoToPreviousMonth = !isCurrentMonthView;
  const nextMonthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
  const canGoToNextMonth = startOfDay(nextMonthStart) <= startOfDay(rangeEnd);

  return (
    <Box>
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="border.control">
        <Flex align="center" justify="space-between" mb={4}>
        <IconButton
          aria-label="Previous month"
          variant="ghost"
          size="lg"
          fontSize="2xl"
          lineHeight={1}
          disabled={!canGoToPreviousMonth}
          opacity={canGoToPreviousMonth ? 1 : 0}
          pointerEvents={canGoToPreviousMonth ? "auto" : "none"}
          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          ‹
        </IconButton>
        <Text fontWeight="semibold" fontSize="lg">
          {monthLabel}
        </Text>
        <IconButton
          aria-label="Next month"
          variant="ghost"
          size="lg"
          fontSize="2xl"
          lineHeight={1}
          disabled={!canGoToNextMonth}
          opacity={canGoToNextMonth ? 1 : 0}
          pointerEvents={canGoToNextMonth ? "auto" : "none"}
          onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        >
          ›
        </IconButton>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.500">
            {label}
          </Text>
        ))}
      </Grid>

      {weeks.map((week, weekIndex) => (
        <Grid key={weekIndex} templateColumns="repeat(7, 1fr)" gap={1} mb={1} overflow="visible">
          {week.map((day) => {
            const dateKey = toDateKey(day);
            const dayEvents = eventsByDate.get(dateKey);
            const isToday = isSameDay(day, today);
            const isSelected = dateKey === selectedDate;
            const isPast = isPastDate(day, today);
            const isBeyondRange = isAfterRangeEnd(day, rangeEnd);
            const isOutsideMonth = day.getMonth() !== monthCursor.getMonth();

            if (isPast || isBeyondRange) {
              return <Box key={dateKey} minH="64px" />;
            }

            const dayButtonProps = {
              dateKey,
              dayNumber: day.getDate(),
              dayEvents,
              isSelected,
              isToday,
              isOutsideMonth,
              onSelect: setSelectedDate,
            };

            return (
              <Box
                key={dateKey}
                position="relative"
                onMouseLeave={() => setHoveredDate(null)}
              >
                <CalendarDayButton
                  {...dayButtonProps}
                  onHoverStart={dayEvents ? () => setHoveredDate(dateKey) : undefined}
                />
                {dayEvents && hoveredDate === dateKey && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="50%"
                    transform="translateX(-50%)"
                    pt={1}
                    zIndex={20}
                    minW="max-content"
                    onMouseEnter={() => setHoveredDate(dateKey)}
                  >
                    <Box
                      px={3}
                      py={2}
                      bg="white"
                      color="gray.800"
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      boxShadow="lg"
                      _dark={{
                        bg: "gray.700",
                        color: "white",
                        borderColor: "gray.600",
                      }}
                    >
                      <DayEventsTooltipContent dayEvents={dayEvents} />
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Grid>
      ))}

      <Flex gap={4} mt={3}>
        <Flex align="center" gap={2}>
          <Box w="8px" h="8px" borderRadius="full" bg="blue.400" />
          <Text fontSize="xs">Earnings</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w="8px" h="8px" borderRadius="full" bg="purple.400" />
          <Text fontSize="xs">IPO</Text>
        </Flex>
      </Flex>
      </Box>

      <Box mt={6}>
      {selectedDayEvents ? (
        <CalendarListView key={selectedDayEvents.date} daysEvents={[selectedDayEvents]} />
      ) : selectedDate ? (
        <Text fontSize="sm" color="gray.500">
          No events on this day.
        </Text>
      ) : (
        <Text fontSize="sm" color="gray.500">
          Select a day to see its events.
        </Text>
      )}
      </Box>
    </Box>
  );
};

export default CalendarMonthView;

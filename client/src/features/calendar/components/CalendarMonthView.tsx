"use client";
import { useMemo, useState } from "react";
import { Box, Flex, Grid, IconButton, Text } from "@chakra-ui/react";

import CalendarListView from "@/src/features/calendar/components/CalendarListView";
import { DayEvents } from "@/src/features/calendar/types";

interface CalendarMonthViewProps {
  daysEvents: DayEvents[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const CalendarMonthView = ({ daysEvents }: CalendarMonthViewProps) => {
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateKey(today));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DayEvents>();
    daysEvents.forEach((day) => map.set(day.date, day));
    return map;
  }, [daysEvents]);

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

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4}>
        <IconButton
          aria-label="Previous month"
          variant="ghost"
          size="sm"
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
          size="sm"
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
        <Grid key={weekIndex} templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
          {week.map((day) => {
            const dateKey = toDateKey(day);
            const dayEvents = eventsByDate.get(dateKey);
            const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
            const isToday = isSameDay(day, today);
            const isSelected = dateKey === selectedDate;

            return (
              <Box
                key={dateKey}
                as="button"
                onClick={() => setSelectedDate(dayEvents ? dateKey : null)}
                cursor={dayEvents ? "pointer" : "default"}
                minH="64px"
                p={2}
                borderWidth="1px"
                borderColor={isSelected ? "green.500" : "border"}
                borderRadius="md"
                bg={isSelected ? "green.subtle" : "transparent"}
                opacity={isCurrentMonth ? 1 : 0.4}
                textAlign="left"
              >
                <Text fontSize="sm" fontWeight={isToday ? "bold" : "normal"}>
                  {day.getDate()}
                </Text>
                {dayEvents && (
                  <Flex gap={1} mt={1}>
                    {dayEvents.earnings.length > 0 && (
                      <Box w="6px" h="6px" borderRadius="full" bg="blue.400" title="Earnings" />
                    )}
                    {dayEvents.ipos.length > 0 && (
                      <Box w="6px" h="6px" borderRadius="full" bg="purple.400" title="IPO" />
                    )}
                  </Flex>
                )}
              </Box>
            );
          })}
        </Grid>
      ))}

      <Flex gap={4} mt={3} mb={6}>
        <Flex align="center" gap={2}>
          <Box w="8px" h="8px" borderRadius="full" bg="blue.400" />
          <Text fontSize="xs">Earnings</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w="8px" h="8px" borderRadius="full" bg="purple.400" />
          <Text fontSize="xs">IPO</Text>
        </Flex>
      </Flex>

      {selectedDayEvents ? (
        <CalendarListView daysEvents={[selectedDayEvents]} />
      ) : (
        <Text fontSize="sm" color="gray.500">
          Select a highlighted day to see its events.
        </Text>
      )}
    </Box>
  );
};

export default CalendarMonthView;

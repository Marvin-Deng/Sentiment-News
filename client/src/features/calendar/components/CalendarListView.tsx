"use client";
import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, Heading, Link, Table, Text } from "@chakra-ui/react";

import { DayEvents, EarningsEvent, HOUR_LABELS, IpoEvent } from "@/src/features/calendar/types";
import { formatDate } from "@/src/utils/dateUtils";

const ROW_LIMIT = 5;

interface CalendarListViewProps {
  daysEvents: DayEvents[];
}

const TickerLink = ({ ticker }: { ticker: string }) => (
  <Link asChild fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
    <NextLink href={`/stocks/${ticker}`}>{ticker}</NextLink>
  </Link>
);

const CalendarListView = ({ daysEvents }: CalendarListViewProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const expandSection = (sectionKey: string) => {
    setExpandedSections((prev) => new Set(prev).add(sectionKey));
  };

  const getVisibleItems = <T,>(items: T[], sectionKey: string) => {
    if (expandedSections.has(sectionKey) || items.length <= ROW_LIMIT) {
      return { visible: items, hiddenCount: 0 };
    }
    return { visible: items.slice(0, ROW_LIMIT), hiddenCount: items.length - ROW_LIMIT };
  };

  return (
    <Box>
      {daysEvents.map((day) => {
        const earningsKey = `${day.date}-earnings`;
        const iposKey = `${day.date}-ipos`;
        const { visible: visibleEarnings, hiddenCount: hiddenEarnings } = getVisibleItems(
          day.earnings,
          earningsKey,
        );
        const { visible: visibleIpos, hiddenCount: hiddenIpos } = getVisibleItems(day.ipos, iposKey);

        return (
          <Box key={day.date} mb={8}>
            <Heading size="md" mb={3}>
              {formatDate(day.date)}
            </Heading>

            {day.earnings.length > 0 && (
              <Box mb={4}>
                <Text fontWeight="semibold" mb={2}>
                  Earnings
                </Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Symbol</Table.ColumnHeader>
                      <Table.ColumnHeader>Timing</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">EPS Estimate</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Revenue Estimate</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visibleEarnings.map((event: EarningsEvent, index: number) => (
                      <Table.Row key={`${event.symbol}-${event.date}-${event.quarter}-${index}`}>
                        <Table.Cell>
                          <TickerLink ticker={event.symbol} />
                        </Table.Cell>
                        <Table.Cell>{HOUR_LABELS[event.hour] ?? "—"}</Table.Cell>
                        <Table.Cell textAlign="right">{event.epsEstimate ?? "—"}</Table.Cell>
                        <Table.Cell textAlign="right">
                          {event.revenueEstimate?.toLocaleString() ?? "—"}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                {hiddenEarnings > 0 && (
                  <Button
                    mt={2}
                    size="sm"
                    variant="ghost"
                    onClick={() => expandSection(earningsKey)}
                  >
                    Show {hiddenEarnings} more
                  </Button>
                )}
              </Box>
            )}

            {day.ipos.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  IPOs
                </Text>
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Symbol</Table.ColumnHeader>
                      <Table.ColumnHeader>Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Exchange</Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Price</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visibleIpos.map((event: IpoEvent, index: number) => (
                      <Table.Row key={`${event.symbol}-${event.date}-${index}`}>
                        <Table.Cell>
                          <Text fontWeight="semibold">{event.symbol}</Text>
                        </Table.Cell>
                        <Table.Cell>{event.name}</Table.Cell>
                        <Table.Cell>{event.exchange}</Table.Cell>
                        <Table.Cell textTransform="capitalize">{event.status}</Table.Cell>
                        <Table.Cell textAlign="right">{event.price}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                {hiddenIpos > 0 && (
                  <Button mt={2} size="sm" variant="ghost" onClick={() => expandSection(iposKey)}>
                    Show {hiddenIpos} more
                  </Button>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CalendarListView;

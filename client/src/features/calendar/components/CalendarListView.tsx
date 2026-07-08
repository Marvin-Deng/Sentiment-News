import { Box, Heading, Table, Text } from "@chakra-ui/react";

import { DayEvents, HOUR_LABELS } from "@/src/features/calendar/types";
import { formatDate } from "@/src/utils/dateUtils";

interface CalendarListViewProps {
  daysEvents: DayEvents[];
}

const CalendarListView = ({ daysEvents }: CalendarListViewProps) => {
  return (
    <Box>
      {daysEvents.map((day) => (
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
                  {day.earnings.map((event, index) => (
                    <Table.Row key={`${event.symbol}-${event.date}-${event.quarter}-${index}`}>
                      <Table.Cell>{event.symbol}</Table.Cell>
                      <Table.Cell>{HOUR_LABELS[event.hour] ?? "—"}</Table.Cell>
                      <Table.Cell textAlign="right">{event.epsEstimate ?? "—"}</Table.Cell>
                      <Table.Cell textAlign="right">
                        {event.revenueEstimate?.toLocaleString() ?? "—"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
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
                  {day.ipos.map((event, index) => (
                    <Table.Row key={`${event.symbol}-${event.date}-${index}`}>
                      <Table.Cell>{event.symbol}</Table.Cell>
                      <Table.Cell>{event.name}</Table.Cell>
                      <Table.Cell>{event.exchange}</Table.Cell>
                      <Table.Cell textTransform="capitalize">{event.status}</Table.Cell>
                      <Table.Cell textAlign="right">{event.price}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CalendarListView;

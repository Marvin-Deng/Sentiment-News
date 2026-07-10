import { Box, Heading, Table } from "@chakra-ui/react";

import { formatNumber } from "@/src/utils/numberUtils";
import { EpsSurprise } from "@/src/features/stocks/types";

interface EpsSurprisesTableProps {
  epsSurprises: EpsSurprise[];
}

const formatPeriodLabel = (period: string) =>
  new Date(period).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const EpsSurprisesTable = ({ epsSurprises }: EpsSurprisesTableProps) => {
  const sorted = [...epsSurprises].sort(
    (a, b) => new Date(b.period).getTime() - new Date(a.period).getTime(),
  );

  return (
    <Box w="full" maxW="4xl" mx="auto" px={4} py={2}>
      <Heading textStyle="sectionTitle" mb={2} textAlign="left">
        EPS Surprises History
      </Heading>
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Period</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Actual</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Estimate</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Surprise</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Surprise %</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Result</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((row) => {
            const isBeat = row.surprise >= 0;
            const resultColor = isBeat ? "positive" : "negative";

            return (
              <Table.Row key={`${row.period}-${row.quarter}-${row.year}`}>
                <Table.Cell>{formatPeriodLabel(row.period)}</Table.Cell>
                <Table.Cell textAlign="right">{formatNumber(row.actual)}</Table.Cell>
                <Table.Cell textAlign="right">{formatNumber(row.estimate)}</Table.Cell>
                <Table.Cell textAlign="right" color={resultColor}>
                  {formatNumber(row.surprise)}
                </Table.Cell>
                <Table.Cell textAlign="right" color={resultColor}>
                  {formatNumber(row.surprisePercent)}%
                </Table.Cell>
                <Table.Cell textAlign="right" color={resultColor} fontWeight="semibold">
                  {isBeat ? "Beat" : "Missed"}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default EpsSurprisesTable;

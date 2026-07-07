import React, { ReactNode } from "react";
import { Box, Table, Heading } from "@chakra-ui/react";
import { PriceData } from "@/src/features/stocks/types";
import { QuoteInfo } from "@/src/features/stocks/api";

interface TableBodyProps {
  children: ReactNode;
}

interface TableColumnProps {
  label: string;
  value: number;
}

interface DataTableProps {
  currPriceData: PriceData;
  quoteInfo: QuoteInfo | null;
}

const TableBody: React.FC<TableBodyProps> = ({ children }) => (
  <Table.Root variant="outline" size="sm">
    <Table.Body>{children}</Table.Body>
  </Table.Root>
);

const TableColumn: React.FC<TableColumnProps> = ({ label, value }) => (
  <Table.Row>
    <Table.Cell>{label}</Table.Cell>
    <Table.Cell textAlign="right">{`${value}`}</Table.Cell>
  </Table.Row>
);

const DataTable: React.FC<DataTableProps> = ({ currPriceData, quoteInfo }) => (
  <Box p={4}>
    <Heading size="sm" mb={2}>
      Latest Quote
    </Heading>
    <TableBody>
      <TableColumn label="Current Price" value={quoteInfo?.current ?? 0} />
      <TableColumn label="Change" value={quoteInfo?.change ?? 0} />
    </TableBody>

    <Heading size="sm" mt={5} mb={2}>
      End of Day Data
    </Heading>
    <TableBody>
      <TableColumn label="Open" value={currPriceData.open} />
      <TableColumn label="High" value={currPriceData.high} />
      <TableColumn label="Low" value={currPriceData.low} />
      <TableColumn label="Close" value={currPriceData.close} />
      <TableColumn label="Volume" value={currPriceData.volume} />
      <TableColumn label="Dividend" value={currPriceData.divCash} />
      <TableColumn label="Split" value={currPriceData.splitFactor} />
    </TableBody>

    <Heading size="sm" mt={5} mb={2}>
      Adjusted Prices
    </Heading>
    <TableBody>
      <TableColumn label="Adj Open" value={currPriceData.adjOpen} />
      <TableColumn label="Adj High" value={currPriceData.adjHigh} />
      <TableColumn label="Adj Low" value={currPriceData.adjLow} />
      <TableColumn label="Adj Close" value={currPriceData.adjClose} />
      <TableColumn label="Adj Volume" value={currPriceData.adjVolume} />
    </TableBody>
  </Box>
);

export default DataTable;

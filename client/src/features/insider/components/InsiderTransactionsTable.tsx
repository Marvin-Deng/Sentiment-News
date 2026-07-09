"use client";
import { useMemo, useState } from "react";
import NextLink from "next/link";
import { Box, Center, Heading, Link, Table, Text } from "@chakra-ui/react";

import LoadMoreButton from "@/src/components/ui/LoadMoreButton";
import { InsiderTransaction, TRANSACTION_CODE_LABELS } from "@/src/features/insider/types";
import { formatDate } from "@/src/utils/dateUtils";

const PAGE_SIZE = 10;

interface InsiderTransactionsTableProps {
  transactions: InsiderTransaction[];
  symbol: string;
}

const InsiderTransactionsTable = ({ transactions, symbol }: InsiderTransactionsTableProps) => {
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
      ),
    [transactions],
  );

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  if (sorted.length === 0) {
    return (
      <Box mt={8}>
        <Heading size="sm" mb={2}>
          Insider Transactions
        </Heading>
        <Text color="fg.muted">No transactions found for {symbol} in this period.</Text>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Heading size="sm" mb={4}>
        Insider Transactions
      </Heading>
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Insider</Table.ColumnHeader>
            <Table.ColumnHeader>Transaction Date</Table.ColumnHeader>
            <Table.ColumnHeader>Filing Date</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Change</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Shares Held</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Price</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visible.map((tx, index) => {
            const isBuy = tx.change > 0;
            const changeColor = isBuy ? "positive" : tx.change < 0 ? "negative" : undefined;
            const typeLabel = TRANSACTION_CODE_LABELS[tx.transactionCode] ?? tx.transactionCode;

            return (
              <Table.Row key={`${tx.name}-${tx.transactionDate}-${tx.transactionCode}-${index}`}>
                <Table.Cell>{tx.name}</Table.Cell>
                <Table.Cell>{formatDate(tx.transactionDate)}</Table.Cell>
                <Table.Cell>{formatDate(tx.filingDate)}</Table.Cell>
                <Table.Cell>
                  {typeLabel}
                  {isBuy ? " (Buy)" : tx.change < 0 ? " (Sell)" : ""}
                </Table.Cell>
                <Table.Cell textAlign="right" color={changeColor}>
                  {tx.change > 0 ? "+" : ""}
                  {tx.change.toLocaleString()}
                </Table.Cell>
                <Table.Cell textAlign="right">{tx.share.toLocaleString()}</Table.Cell>
                <Table.Cell textAlign="right">
                  {tx.transactionPrice != null ? `$${tx.transactionPrice.toFixed(2)}` : "—"}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <Text mt={3} fontSize="sm" color="fg.muted">
        Showing {visible.length} of {sorted.length} transaction{sorted.length === 1 ? "" : "s"}. View{" "}
        <Link asChild fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
          <NextLink href={`/stocks/${symbol}`}>{symbol}</NextLink>
        </Link>{" "}
        for more stock details.
      </Text>

      {hasMore && (
        <Center mt={4}>
          <LoadMoreButton onClick={() => setPage((prev) => prev + 1)} />
        </Center>
      )}
    </Box>
  );
};

export default InsiderTransactionsTable;

"use client";
import { useMemo, useState } from "react";
import { Box, Center, Flex, Heading, Icon, Table, Text } from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from "react-icons/lu";

import LoadMoreButton from "@/src/components/ui/LoadMoreButton";
import { ChangeSort, InsiderTransaction, TRANSACTION_CODE_LABELS } from "@/src/features/insider/types";
import { formatDate } from "@/src/utils/dateUtils";

interface InsiderTransactionsTableProps {
  transactions: InsiderTransaction[];
  symbol: string;
  mt?: number;
}

const PAGE_SIZE = 10;

const cycleChangeSort = (current: ChangeSort): ChangeSort => {
  if (current === "default") return "asc";
  if (current === "asc") return "desc";
  return "default";
};

const compareInsiderTransactions = (a: InsiderTransaction, b: InsiderTransaction) => {
  const dateDiff = new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
  if (dateDiff !== 0) return dateDiff;

  const nameDiff = a.name.localeCompare(b.name);
  if (nameDiff !== 0) return nameDiff;

  const changeRank = (change: number) => (change > 0 ? 0 : change < 0 ? 1 : 2);
  const changeDiff = changeRank(a.change) - changeRank(b.change);
  if (changeDiff !== 0) return changeDiff;

  const shareDiff = b.share - a.share;
  if (shareDiff !== 0) return shareDiff;

  return new Date(a.filingDate).getTime() - new Date(b.filingDate).getTime();
};

const TransactionsHeading = ({ mb }: { mb: number }) => (
  <Heading textStyle="sectionTitle" mb={mb}>
    Insider Transactions
  </Heading>
);

const formatTransactionPrice = (price?: number) => {
  if (price == null || price === 0) return "—";
  return `$${price.toFixed(2)}`;
};

const InsiderTransactionsTable = ({ transactions, symbol, mt = 8 }: InsiderTransactionsTableProps) => {
  const [page, setPage] = useState(1);
  const [changeSort, setChangeSort] = useState<ChangeSort>("default");

  const sorted = useMemo(() => {
    const rows = [...transactions];

    if (changeSort === "default") {
      return rows.sort(compareInsiderTransactions);
    }

    return rows.sort((a, b) => {
      const changeDiff = changeSort === "asc" ? a.change - b.change : b.change - a.change;
      if (changeDiff !== 0) return changeDiff;
      return compareInsiderTransactions(a, b);
    });
  }, [transactions, changeSort]);

  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sorted.length;

  if (sorted.length === 0) {
    return (
      <Box mt={mt}>
        <TransactionsHeading mb={2} />
        <Text color="fg.muted">No transactions found for {symbol} in this period.</Text>
      </Box>
    );
  }

  return (
    <Box mt={mt}>
      <TransactionsHeading mb={4} />
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader minW="140px" fontSize="md">Insider</Table.ColumnHeader>
            <Table.ColumnHeader fontSize="md">Transaction Date</Table.ColumnHeader>
            <Table.ColumnHeader fontSize="md">Filing Date</Table.ColumnHeader>
            <Table.ColumnHeader fontSize="md">Type</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right" fontSize="md">
              <Flex
                as="button"
                align="center"
                justify="flex-end"
                gap={1}
                w="full"
                cursor="pointer"
                onClick={() => {
                  setChangeSort((current) => cycleChangeSort(current));
                  setPage(1);
                }}
              >
                Change
                <Icon boxSize={3.5} color={changeSort === "default" ? "fg.muted" : "fg"}>
                  {changeSort === "asc" ? (
                    <LuArrowUp />
                  ) : changeSort === "desc" ? (
                    <LuArrowDown />
                  ) : (
                    <LuArrowUpDown />
                  )}
                </Icon>
              </Flex>
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right" fontSize="md">Shares Held After</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right" fontSize="md">Price</Table.ColumnHeader>
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
                  {isBuy ? (
                    <Box as="span" color="positive">
                      {" (Buy)"}
                    </Box>
                  ) : tx.change < 0 ? (
                    <Box as="span" color="negative">
                      {" (Sell)"}
                    </Box>
                  ) : (
                    ""
                  )}
                </Table.Cell>
                <Table.Cell textAlign="right" color={changeColor}>
                  {tx.change > 0 ? "+" : ""}
                  {tx.change.toLocaleString()}
                </Table.Cell>
                <Table.Cell textAlign="right">{tx.share.toLocaleString()}</Table.Cell>
                <Table.Cell textAlign="right">{formatTransactionPrice(tx.transactionPrice)}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <Text mt={3} textStyle="caption">
        Shares Held After reflects holdings following that filing line only, not total current ownership.
        Showing {visible.length} of {sorted.length} transaction{sorted.length === 1 ? "" : "s"}.
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

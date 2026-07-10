import { Box, Table, Heading } from "@chakra-ui/react";
import { formatNumber } from "@/src/utils/numberUtils";
import { BasicFinancials, PriceData } from "@/src/features/stocks/types";

interface DataTableProps {
  currPriceData: PriceData;
  basicFinancials?: BasicFinancials | null;
}

type TableSection = {
  title: string;
  rows: { label: string; value: number }[];
};

const SectionTable = ({ section }: { section: TableSection }) => (
  <Box>
    <Heading textStyle="sectionTitle" mb={2}>
      {section.title}
    </Heading>
    <Table.Root variant="outline" size="sm">
      <Table.Body>
        {section.rows.map((row) => (
          <Table.Row key={row.label}>
            <Table.Cell>{row.label}</Table.Cell>
            <Table.Cell textAlign="right">{formatNumber(row.value)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

const DataTable = ({ currPriceData, basicFinancials }: DataTableProps) => {
  const eodSection: TableSection = {
    title: "End of Day Data",
    rows: [
      { label: "Open", value: currPriceData.open },
      { label: "High", value: currPriceData.high },
      { label: "Low", value: currPriceData.low },
      { label: "Close", value: currPriceData.close },
      { label: "Volume", value: currPriceData.volume },
    ],
  };

  const financialsSection: TableSection | null = basicFinancials
    ? {
        title: "Basic Financials",
        rows: [
          { label: "Market Cap", value: basicFinancials.marketCapitalization ?? 0 },
          { label: "P/E (TTM)", value: basicFinancials.peBasicExclExtraTTM ?? 0 },
          { label: "EPS (TTM)", value: basicFinancials.epsBasicExclExtraItemsTTM ?? 0 },
          { label: "Beta", value: basicFinancials.beta ?? 0 },
          { label: "52 Week High", value: basicFinancials["52WeekHigh"] ?? 0 },
          { label: "52 Week Low", value: basicFinancials["52WeekLow"] ?? 0 },
          { label: "Net Margin (TTM)", value: basicFinancials.netMarginTTM ?? 0 },
          { label: "Gross Margin (TTM)", value: basicFinancials.grossMarginTTM ?? 0 },
          { label: "ROE (TTM)", value: basicFinancials.roeTTM ?? 0 },
          { label: "Dividend Yield", value: basicFinancials.dividendYieldIndicatedAnnual ?? 0 },
        ],
      }
    : null;

  return (
    <Box p={4} display="flex" flexDirection={{ base: "column", md: "row" }} justifyContent="center" gap={8}>
      <Box w={{ base: "full", md: "sm" }}>
        <SectionTable section={eodSection} />
      </Box>
      {financialsSection && (
        <Box w={{ base: "full", md: "sm" }}>
          <SectionTable section={financialsSection} />
        </Box>
      )}
    </Box>
  );
};

export default DataTable;

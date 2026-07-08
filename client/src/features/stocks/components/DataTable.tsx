import { Box, Table, Heading } from "@chakra-ui/react";
import { BasicFinancials, PriceData } from "@/src/features/stocks/types";

interface DataTableProps {
  currPriceData: PriceData;
  basicFinancials?: BasicFinancials | null;
}

type TableSection = {
  title: string;
  rows: { label: string; value: number }[];
};

const DataTable = ({ currPriceData, basicFinancials }: DataTableProps) => {
  const sections: TableSection[] = [
    {
      title: "End of Day Data",
      rows: [
        { label: "Open", value: currPriceData.open },
        { label: "High", value: currPriceData.high },
        { label: "Low", value: currPriceData.low },
        { label: "Close", value: currPriceData.close },
        { label: "Volume", value: currPriceData.volume },
      ],
    },
    ...(basicFinancials
      ? [
          {
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
          },
        ]
      : []),
  ];

  return (
    <Box p={4}>
      {sections.map((section, index) => (
        <Box key={section.title} mt={index === 0 ? 0 : 5}>
          <Heading size="sm" mb={2}>
            {section.title}
          </Heading>
          <Table.Root variant="outline" size="sm">
            <Table.Body>
              {section.rows.map((row) => (
                <Table.Row key={row.label}>
                  <Table.Cell>{row.label}</Table.Cell>
                  <Table.Cell textAlign="right">{row.value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      ))}
    </Box>
  );
};

export default DataTable;

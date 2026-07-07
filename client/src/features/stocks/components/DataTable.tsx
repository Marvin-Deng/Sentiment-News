import { Box, Table, Heading } from "@chakra-ui/react";
import { PriceData } from "@/src/features/stocks/types";
import { QuoteInfo } from "@/src/features/stocks/api";

interface DataTableProps {
  currPriceData: PriceData;
  quoteInfo: QuoteInfo | null;
}

type TableSection = {
  title: string;
  rows: { label: string; value: number }[];
};

const DataTable = ({ currPriceData, quoteInfo }: DataTableProps) => {
  const sections: TableSection[] = [
    {
      title: "Latest Quote",
      rows: [
        { label: "Current Price", value: quoteInfo?.current ?? 0 },
        { label: "Change", value: quoteInfo?.change ?? 0 },
      ],
    },
    {
      title: "End of Day Data",
      rows: [
        { label: "Open", value: currPriceData.open },
        { label: "High", value: currPriceData.high },
        { label: "Low", value: currPriceData.low },
        { label: "Close", value: currPriceData.close },
        { label: "Volume", value: currPriceData.volume },
        { label: "Dividend", value: currPriceData.divCash },
        { label: "Split", value: currPriceData.splitFactor },
      ],
    },
    {
      title: "Adjusted Prices",
      rows: [
        { label: "Adj Open", value: currPriceData.adjOpen },
        { label: "Adj High", value: currPriceData.adjHigh },
        { label: "Adj Low", value: currPriceData.adjLow },
        { label: "Adj Close", value: currPriceData.adjClose },
        { label: "Adj Volume", value: currPriceData.adjVolume },
      ],
    },
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

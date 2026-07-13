import { Box, Text, Image, Link } from "@chakra-ui/react";

import { FinnhubNewsItem } from "@/src/features/stocks/types";

interface StockNewsListProps {
  news: FinnhubNewsItem[];
}

const truncateSummary = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;

const StockNewsList = ({ news }: StockNewsListProps) => {
  if (news.length === 0) {
    return (
      <Box w="full" maxW="50rem" mx="auto" px={4} py={2}>
        <Text fontSize="sm" color="fg.muted">
          No recent news available.
        </Text>
      </Box>
    );
  }

  return (
    <Box w="full" maxW="50rem" mx="auto" px={4} py={2}>
      {news.map((item) => (
        <Box key={item.url} pb={4} mb={4} borderBottomWidth="1px" borderColor="border">
          {item.image && (
            <Image src={item.image} alt={item.headline} w="full" h="56" objectFit="cover" mb={3} borderRadius="lg" />
          )}
          <Link href={item.url} target="_blank" rel="noopener noreferrer" _hover={{ textDecoration: "underline" }}>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              {item.headline}
            </Text>
          </Link>
          <Text fontSize="sm" color="fg">
            {truncateSummary(item.summary, 300)}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default StockNewsList;

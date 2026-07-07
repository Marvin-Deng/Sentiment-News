import { Article } from "../api";
import { getPriceColorStr, getPriceStrArrow } from "@/src/utils/priceUtils";
import { utcStringToLocal, formatDate } from "@/src/utils/dateUtils";
import { Badge } from "@/src/components/ui/badge";
import { getSentimentBadgeVariant } from "@/src/constants/sentiment";
import {
  Box,
  Card,
  Text,
  Image,
  Flex,
  Link,
} from "@chakra-ui/react";

const ArticleCard = ({
  title,
  publication_datetime,
  summary,
  image_url,
  article_url,
  ticker,
  sentiment,
  market_date,
  open_price,
  close_price,
}: Article) => {
  const truncateSummary = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const isPositive = getPriceColorStr(open_price, close_price) === "green-500";

  return (
    <Card.Root>
      <Card.Body>
        <Image src={image_url} alt={title} w="full" h="56" objectFit="cover" mb={3} borderRadius="lg" />
        <Text fontStyle="italic" fontSize="sm" color="gray.500" mb={2}>
          {utcStringToLocal(publication_datetime)}
        </Text>
        <Flex align="center" justify="space-between" mb={2}>
          <Flex align="center" gap={3}>
            <Text fontSize="sm" fontWeight="semibold">{ticker}</Text>
            <Badge variant={getSentimentBadgeVariant(sentiment)}>
              {sentiment}
            </Badge>
          </Flex>
        </Flex>
        <Text fontSize="sm" color="gray.700">
          {truncateSummary(summary, 300)}
        </Text>
        <Box mt={4}>
          <Text fontStyle="italic" fontSize="sm" mb={2}>Price Action On: {formatDate(market_date)}</Text>
          {open_price ? (
            <Flex align="center" gap={4} mb={3}>
              <Text>O: {open_price}</Text>
              <Text>C: {close_price}</Text>
              <Text color={isPositive ? "green.600" : "red.600"}>
                {getPriceStrArrow(open_price, close_price)}
              </Text>
            </Flex>
          ) : (
            <Text>Not available yet</Text>
          )}
          <Flex justify="flex-end">
            <Link href={article_url} mt={2}>
              Read More
            </Link>
          </Flex>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

export default ArticleCard;

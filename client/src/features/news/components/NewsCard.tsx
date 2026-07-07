import { Article } from "../types";
import { isPricePositive, getPriceStrArrow } from "@/src/utils/priceUtils";
import { utcStringToLocal, formatDate } from "@/src/utils/dateUtils";
import Badge from "@/src/components/ui/Badge";
import { getSentimentBadgeVariant } from "@/src/constants/sentiment";
import {
  Box,
  Card,
  Text,
  Image,
  Flex,
  Link,
} from "@chakra-ui/react";

const NewsCard = ({
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
  const truncateSummary = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;

  const isPositive = isPricePositive(open_price, close_price);

  return (
    <Card.Root borderWidth="1px" borderColor="gray.400" _dark={{ borderColor: "whiteAlpha.400" }}>
      <Card.Body>
        <Image src={image_url} alt={title} w="full" h="56" objectFit="cover" mb={3} borderRadius="lg" />
        <Text fontStyle="italic" fontSize="sm" color="fg.muted" mb={2}>
          {utcStringToLocal(publication_datetime)}
        </Text>
        <Flex align="center" justify="space-between" mb={2}>
          <Flex align="center" gap={ticker ? 3 : 0}>
            {ticker && (
              <Text fontSize="sm" fontWeight="semibold">{ticker}</Text>
            )}
            <Badge variant={getSentimentBadgeVariant(sentiment)}>
              {sentiment}
            </Badge>
          </Flex>
        </Flex>
        <Text fontSize="sm" color="fg">
          {truncateSummary(summary, 300)}
        </Text>
        <Box mt={4}>
          <Text fontStyle="italic" fontSize="sm" color="fg.muted" mb={2}>
            Price Action On: {market_date ? formatDate(market_date) : "Pending"}
          </Text>
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
          <Flex justify="flex-start">
            <Link
              href={article_url}
              mt={2}
              px={3}
              py={1}
              border="1px solid"
              borderColor="gray.400"
              _dark={{ borderColor: "whiteAlpha.400" }}
              borderRadius="md"
              cursor="pointer"
              transition="background-color 0.3s ease, color 0.3s ease"
              _hover={{ textDecoration: "none", bg: "fg", color: "bg" }}
            >
              Read More
            </Link>
          </Flex>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

export default NewsCard;

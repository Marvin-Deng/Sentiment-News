import NextLink from "next/link";
import { Article } from "../types";
import { formatNumber } from "@/src/utils/numberUtils";
import { isPricePositive, getPriceStrArrow } from "@/src/utils/priceUtils";
import { utcStringToLocal, formatDate } from "@/src/utils/dateUtils";
import Badge from "@/src/components/ui/Badge";
import Tooltip from "@/src/components/ui/Tooltip";
import { getSentimentBadgeVariant } from "@/src/constants/sentiment";
import {
  Box,
  Card,
  Text,
  Image,
  Flex,
  Link,
  Icon,
} from "@chakra-ui/react";
import { MdInfoOutline } from "react-icons/md";

const NewsCard = ({
  title,
  publication_datetime,
  summary,
  image_url,
  article_url,
  ticker,
  sentiment,
  reasoning,
  market_date,
  open_price,
  close_price,
}: Article) => {
  const truncateSummary = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;

  const isPositive = isPricePositive(open_price, close_price);

  return (
    <Card.Root borderWidth="1px" borderColor="border.control">
      <Card.Body>
        <Image src={image_url} alt={title} w="full" h="56" objectFit="cover" mb={3} borderRadius="lg" />
        <Text textStyle="caption" fontStyle="italic" mb={2}>
          {utcStringToLocal(publication_datetime)}
        </Text>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          {title}
        </Text>
        <Flex align="center" justify="space-between" mb={2}>
          <Flex align="center" gap={ticker ? 3 : 0}>
            {ticker && (
              <Link asChild fontSize="md" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                <NextLink href={`/stocks/${ticker}`}>{ticker}</NextLink>
              </Link>
            )}
            <Flex align="center" gap={1}>
              <Badge variant={getSentimentBadgeVariant(sentiment)}>
                {sentiment}
              </Badge>
              {reasoning && (
                <Tooltip content={reasoning} contentProps={{ maxW: "sm" }}>
                  <Icon size="sm" color="fg.muted" cursor="pointer">
                    <MdInfoOutline />
                  </Icon>
                </Tooltip>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Text fontSize="sm" color="fg">
          {truncateSummary(summary, 300)}
        </Text>
        <Box mt={4}>
          <Text textStyle="caption" fontStyle="italic" mb={2}>
            Price Action On: {market_date ? formatDate(market_date) : "Pending"}
          </Text>
          {open_price ? (
            <Flex align="center" gap={4} mb={3}>
              <Text>O: {formatNumber(open_price)}</Text>
              <Text>C: {formatNumber(close_price)}</Text>
              <Text color={isPositive ? "positive" : "negative"}>
                {getPriceStrArrow(open_price, close_price)}
              </Text>
            </Flex>
          ) : (
            <Text fontSize="sm">Not available yet</Text>
          )}
          <Flex justify="flex-start">
            <Link
              href={article_url}
              mt={2}
              px={3}
              py={1}
              border="1px solid"
              borderColor="border.control"
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

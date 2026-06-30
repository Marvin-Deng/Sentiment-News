import { Flex, Box, Text, Separator } from "@chakra-ui/react";

interface PageLayoutProps {
  title: string;
  subtitle: string;
  filters?: React.ReactNode;
  children: React.ReactNode;
}

const PageLayout = ({ title, subtitle, filters, children }: PageLayoutProps) => {
  return (
    <Flex flex={1} align="flex-start" justify="center" bg="bg" py={8}>
      <Flex flex={1} w="full" maxW="5xl" direction="column">
        <Box maxW="container.lg" mx="auto" w="full" mt={3} mb={20}>
          <Box px={10}>
            <Text fontWeight="bold" fontSize={{ base: "4xl", sm: "5xl" }} mb={2}>
              {title}
            </Text>
            <Text mt={3} fontSize="xl">
              {subtitle}
            </Text>
            <Separator my={6} />
            {filters && (
              <Box display="flex" flexDir="row" alignItems="center" gap={3} mb={4}>
                {filters}
              </Box>
            )}
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default PageLayout;

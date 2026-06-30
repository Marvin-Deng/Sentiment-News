"use client";
import { Flex, Box } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "News", href: "/" },
  { label: "Stocks", href: "/stocks" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <Box>
      <Flex
        as="nav"
        maxW="5xl"
        mx="auto"
        px={10}
        py={3}
        align="center"
        gap={6}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Box
            key={href}
            as={Link}
            href={href}
            fontWeight={pathname === href ? "bold" : "normal"}
            borderBottom={pathname === href ? "2px solid" : "2px solid transparent"}
            borderColor={pathname === href ? "blue.500" : "transparent"}
            pb={1}
            _hover={{ color: "blue.500" }}
          >
            {label}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default Navbar;

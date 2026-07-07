"use client";
import { Flex, Box } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorModeButton } from "../ui/color-mode";

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
        justify="space-between"
      >
        <Flex align="center" gap={6}>
          {NAV_LINKS.map(({ label, href }) => (
            <Box
              key={href}
              fontWeight={pathname === href ? "bold" : "normal"}
              borderBottom={pathname === href ? "2px solid" : "2px solid transparent"}
              borderColor={pathname === href ? "blue.500" : "transparent"}
              pb={1}
              _hover={{ color: "blue.500" }}
            >
              <Link href={href}>{label}</Link>
            </Box>
          ))}
        </Flex>
        <ColorModeButton />
      </Flex>
    </Box>
  );
};

export default Navbar;

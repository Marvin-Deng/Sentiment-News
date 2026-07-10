"use client";
import { Flex, Box } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorModeButton } from "../ui/ColorMode";
import TickerTape from "./TickerTape";

const NAV_LINKS = [
  { label: "News", href: "/" },
  { label: "Stocks", href: "/stocks" },
  { label: "Insider", href: "/insider" },
  { label: "Calendar", href: "/calendar" },
];

interface NavbarProps {
  defaultTickers: string[];
}

const Navbar = ({ defaultTickers }: NavbarProps) => {
  const pathname = usePathname();

  return (
    <Box>
      <TickerTape defaultTickers={defaultTickers} />
      <Flex
        as="nav"
        maxW="5xl"
        mx="auto"
        px={10}
        pt={6}
        pb={3}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={6}>
          {NAV_LINKS.map(({ label, href }) => (
            <Box
              key={href}
              position="relative"
              fontWeight={pathname === href ? "bold" : "normal"}
              pb={1}
              _hover={{ color: "green.500", _after: { transform: "scaleX(1)" } }}
              _after={{
                content: '""',
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "full",
                height: "2px",
                bg: "green.500",
                transform: pathname === href ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "center",
                transition: "transform 0.3s ease",
              }}
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

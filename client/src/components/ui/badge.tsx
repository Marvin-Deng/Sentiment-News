import { Badge as ChakraBadge } from "@chakra-ui/react";
import React from "react";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "positive" | "negative" | "neutral";
  className?: string;
}

const colorMap = {
  positive: "green",
  negative: "red",
  neutral: "gray",
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className }) => (
  <ChakraBadge colorPalette={colorMap[variant]} variant="subtle" className={className}>
    {children}
  </ChakraBadge>
);

export default Badge;

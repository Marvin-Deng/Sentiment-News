import { Badge as ChakraBadge } from "@chakra-ui/react";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "positive" | "negative" | "neutral";
}

const colorMap = {
  positive: "green",
  negative: "red",
  neutral: "gray",
};

const Badge = ({ children, variant = "neutral" }: BadgeProps) => (
  <ChakraBadge colorPalette={colorMap[variant]} variant="subtle">
    {children}
  </ChakraBadge>
);

export default Badge;

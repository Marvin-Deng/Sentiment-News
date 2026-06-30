import { Button as ChakraButton } from "@chakra-ui/react";
import React from "react";

type OldVariant = "default" | "outline" | "ghost" | "destructive" | "link";
type ChakraVariant = "solid" | "outline" | "ghost" | "plain";

interface ButtonProps extends Omit<React.ComponentProps<typeof ChakraButton>, "variant"> {
  variant?: OldVariant;
}

const variantMap: Record<OldVariant, ChakraVariant> = {
  default: "solid",
  outline: "outline",
  ghost: "ghost",
  destructive: "solid",
  link: "plain",
};

export function Button({ variant = "default", colorPalette, ...props }: ButtonProps) {
  const chakraVariant = variantMap[variant];
  const palette = colorPalette ?? (variant === "destructive" ? "red" : "gray");
  return <ChakraButton variant={chakraVariant} colorPalette={palette} {...props} />;
}

export default Button;

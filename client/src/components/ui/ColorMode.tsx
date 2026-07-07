"use client";

import { IconButton, Skeleton, type IconButtonProps } from "@chakra-ui/react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { forwardRef, useEffect, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = (forcedTheme || resolvedTheme) as ColorMode;
  const toggleColorMode = () => {
    setTheme(colorMode === "dark" ? "light" : "dark");
  };
  return {
    colorMode: colorMode || "dark",
    setColorMode: setTheme as (colorMode: ColorMode) => void,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
}

type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">;

export const ColorModeButton = forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <Skeleton boxSize="8" borderRadius="md" />;
    }

    return (
      <IconButton
        onClick={toggleColorMode}
        variant="outline"
        bg="transparent"
        color="fg"
        border="1px solid"
        borderColor="gray.400"
        _dark={{ borderColor: "whiteAlpha.400" }}
        transition="background-color 0.3s ease, color 0.3s ease"
        _hover={{ bg: "fg", color: "bg" }}
        size="sm"
        aria-label="Toggle color mode"
        ref={ref}
        {...props}
      >
        <ColorModeIcon />
      </IconButton>
    );
  },
);

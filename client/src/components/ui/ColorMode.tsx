"use client";

import { Skeleton, type IconButtonProps } from "@chakra-ui/react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LuMoon, LuSun } from "react-icons/lu";

import CircularIconButton from "@/src/components/ui/CircularIconButton";
import { THEME_STORAGE_KEY } from "@/src/theme/colorModeScript";

export { THEME_STORAGE_KEY };

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

interface ColorModeProviderProps {
  children: ReactNode;
  defaultTheme?: ColorMode;
}

const ColorModeContext = createContext<UseColorModeReturn | null>(null);

const applyColorMode = (colorMode: ColorMode) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(colorMode);
  document.documentElement.style.colorScheme = colorMode;
};

export function ColorModeProvider({ children, defaultTheme = "dark" }: ColorModeProviderProps) {
  const [colorMode, setColorModeState] = useState<ColorMode>(defaultTheme);

  useEffect(() => {
    // THEME_INIT_SCRIPT already applied the class/colorScheme before hydration; just sync state.
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const initial: ColorMode = stored === "light" || stored === "dark" ? stored : defaultTheme;
    setColorModeState(initial);
  }, [defaultTheme]);

  const value = useMemo<UseColorModeReturn>(() => {
    const setColorMode = (mode: ColorMode) => {
      setColorModeState(mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      applyColorMode(mode);
    };

    return {
      colorMode,
      setColorMode,
      toggleColorMode: () => setColorMode(colorMode === "dark" ? "light" : "dark"),
    };
  }, [colorMode]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode(): UseColorModeReturn {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
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
      <CircularIconButton
        onClick={toggleColorMode}
        size="sm"
        aria-label="Toggle color mode"
        ref={ref}
        {...props}
      >
        <ColorModeIcon />
      </CircularIconButton>
    );
  },
);

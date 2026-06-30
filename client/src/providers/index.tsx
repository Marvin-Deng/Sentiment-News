"use client";
import React from "react";
import ThemeProvider from "./ThemeProvider";
import SearchProvider from "./SearchProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SearchProvider>{children}</SearchProvider>
    </ThemeProvider>
  );
}

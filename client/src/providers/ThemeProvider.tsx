"use client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

function EmotionCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: "css" });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (!names.length) return null;
    const styles = names
      .map((name) =>
        typeof cache.inserted[name] === "string" ? cache.inserted[name] : ""
      )
      .join("");
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <EmotionCacheProvider>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </EmotionCacheProvider>
  );
};

export default ThemeProvider;

import type { Metadata } from "next";
import Script from "next/script";
import Providers from "../src/providers";
import Navbar from "../src/components/navbar/Navbar";
import { THEME_INIT_SCRIPT } from "../src/theme/colorModeScript";

export const metadata: Metadata = {
  title: "Sentiment News",
  description: "Financial news and sentiment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

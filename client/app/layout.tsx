import type { Metadata } from "next";
import "./globals.css";
import Providers from "../src/providers";
import Navbar from "../src/components/Navbar/Navbar";

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
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

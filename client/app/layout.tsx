import type { Metadata } from "next";
import Providers from "../src/providers";
import Navbar from "../src/components/navbar/Navbar";

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
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoFinTech - Whitelabel Algo Trading Solution",
  description:
    "The complete white-label infrastructure to start a proprietary trading company. Deploy battle-tested algorithms for Crypto, Stocks, Forex, and Futures under your brand.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </head>
      <body className="antialiased overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}

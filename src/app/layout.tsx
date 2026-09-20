import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/Kishann911/TaxPilot"),
  title: "TaxPilot · Enterprise Indian Income Tax Return (ITR) Engine",
  description:
    "Deterministic Indian Income Tax computation engine & AI filing co-pilot for AY 2026-27 (FY 2025-26). Zero LLM arithmetic, 205+ verified statutory tests. Built and maintained by Kishan Ojha.",
  authors: [{ name: "Kishan Ojha", url: "https://github.com/Kishann911/TaxPilot" }],
  icons: {
    icon: "/assets/favicon.svg",
  },
  openGraph: {
    title: "TaxPilot · Deterministic Indian Income Tax Return Engine",
    description: "AY 2026-27 / FY 2025-26 Indian Income Tax Co-Pilot with zero arithmetic hallucination.",
    url: "https://github.com/Kishann911/TaxPilot",
    siteName: "TaxPilot",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

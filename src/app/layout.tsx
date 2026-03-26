import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImpactCaddy — Play Golf. Change the World.",
  description:
    "Join the movement mapping golf rounds to global impact. Every round you play fuels a legacy of change.",
  keywords: ["golf charity", "impact rounds", "legacy play", "stableford impact", "give back"],
  openGraph: {
    title: "ImpactCaddy — Play Golf. Change the World.",
    description: "Every round you play fuels a legacy of change.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

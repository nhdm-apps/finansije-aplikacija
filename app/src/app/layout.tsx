import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. Ovde dodajemo manifest i instrukcije za Apple uređaje
export const metadata: Metadata = {
  title: "Finansije App",
  description: "Aplikacija za praćenje budžeta i cash-flowa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finansije",
  },
};

// 2. Ovde definišemo boju gornje trake na telefonu (gde su sat i baterija)
export const viewport: Viewport = {
  themeColor: "#1e293b", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

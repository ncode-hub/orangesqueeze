import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProviderWrapper from "@/components/WalletProviderWrapper";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORANGE | Squeeze Your $ORANGE",
  description: "Stake your $ORANGE tokens and earn juicy rewards on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProviderWrapper>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}

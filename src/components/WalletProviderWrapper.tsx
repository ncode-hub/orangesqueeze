"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { ToastProvider } from "./Toast";

const WalletContextProvider = dynamic(
  () => import("@/contexts/WalletContext").then((mod) => mod.WalletContextProvider),
  { ssr: false }
);

export default function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WalletContextProvider>
  );
}

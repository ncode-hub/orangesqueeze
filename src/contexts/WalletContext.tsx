"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton as SolanaWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT, RPC_ENDPOINT_BACKUP } from "@/lib/constants";

import "@solana/wallet-adapter-react-ui/styles.css";

export const useWallet = useSolanaWallet;

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );
  
  const onError = useCallback((error: any) => {
    console.error("Wallet error:", error);
    // Suppress wallet connection errors in production to avoid noise
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
  }, []);

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const WalletMultiButton: FC<{ className?: string }> = ({ className }) => {
  return (
    <SolanaWalletMultiButton 
      className={className || "!bg-orange-500 hover:!bg-orange-600 !rounded-lg"}
    />
  );
};

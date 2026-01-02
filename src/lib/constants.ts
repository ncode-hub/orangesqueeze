import { PublicKey } from "@solana/web3.js";

// ============== CONFIGURATION ==============
// Update these values after deploying the program!

// Program ID - Replace with actual program ID after `anchor build`
export const PROGRAM_ID = new PublicKey(
  "5MRKYXP3y54CEqDsuEGnieLwYGrGkTQNG34xcpbWEoW7"
);

// $ORANGE Token Mint - Replace with your token mint address
export const ORANGE_MINT = new PublicKey(
  "QTeMapgDXPdgG8ZKuyD4pkBsuE5qFeKeKEyp5khLHAV"
);

// RPC Endpoints
export const RPC_ENDPOINTS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  devnetBackup: "https://rpc.ankr.com/solana_devnet",
  // Use Helius for better performance (free tier available)
  heliusMainnet: "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY",
  heliusDevnet: "https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY",
};

// Current network
export const NETWORK = "devnet" as "mainnet" | "devnet"; // Change to "mainnet" for production

// Get current RPC endpoint
export const RPC_ENDPOINT = RPC_ENDPOINTS[NETWORK];
export const RPC_ENDPOINT_BACKUP = NETWORK === "devnet" ? RPC_ENDPOINTS.devnetBackup : RPC_ENDPOINTS.mainnet;

// Staking configuration
export const STAKING_CONFIG = {
  minStakeAmount: 300_000,           // Minimum 300K tokens
  instantUnstakeFee: 100,            // 1% fee (in basis points)
  rewardDuration: 600,               // 10 minutes per epoch
  tokenDecimals: 6,                  // Token decimals (most pump.fun tokens use 6)
};

// UI Configuration  
export const UI_CONFIG = {
  tokenSymbol: "ORANGE",
  tokenName: "Orange",
  emoji: "🍊",
  juiceEmoji: "🧃",
};

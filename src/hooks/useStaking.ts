"use client";

import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  OrangeStakingClient, 
  getPoolPDA, 
  getUserStakePDA,
  getStakeVaultPDA,
  getRewardVaultPDA,
  formatTokenAmount,
  formatSolAmount,
  parseTokenAmount,
  StakingPoolData,
  UserStakeData 
} from "@/lib/staking-client";
import { RPC_ENDPOINT, RPC_ENDPOINT_BACKUP, ORANGE_MINT, STAKING_CONFIG, PROGRAM_ID } from "@/lib/constants";
import { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from "@solana/web3.js";

interface StakingState {
  isLoading: boolean;
  poolData: StakingPoolData | null;
  userStakeData: UserStakeData | null;
  tokenBalance: bigint;
  pendingRewards: bigint;
  error: string | null;
}

export function useStaking(walletPublicKey: PublicKey | null) {
  const [state, setState] = useState<StakingState>({
    isLoading: true,
    poolData: null,
    userStakeData: null,
    tokenBalance: BigInt(0),
    pendingRewards: BigInt(0),
    error: null,
  });

  const [client, setClient] = useState<OrangeStakingClient | null>(null);

  // Initialize client
  useEffect(() => {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    setClient(new OrangeStakingClient(connection));
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!client) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const poolData = await client.getPoolData();

      let userStakeData: UserStakeData | null = null;
      let tokenBalance = BigInt(0);
      let pendingRewards = BigInt(0);

      if (walletPublicKey) {
        try {
          userStakeData = await client.getUserStakeData(walletPublicKey);
          tokenBalance = await client.getTokenBalance(walletPublicKey);
          pendingRewards = await client.getPendingRewards(walletPublicKey);
        } catch (userError) {
          console.warn("Error fetching user data, continuing with defaults:", userError);
          // Continue with default values instead of failing completely
        }
      }

      setState({
        isLoading: false,
        poolData,
        userStakeData,
        tokenBalance,
        pendingRewards,
        error: null,
      });
    } catch (e) {
      console.error("Error fetching staking data:", e);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: e instanceof Error ? e.message : "Connection error. Please check your network.",
      }));
    }
  }, [client, walletPublicKey]);

  // Fetch on mount and when wallet changes
  useEffect(() => {
    fetchData();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Format helpers
  const formattedData = {
    stakedAmount: state.userStakeData 
      ? formatTokenAmount(state.userStakeData.stakedAmount)
      : "0",
    tokenBalance: formatTokenAmount(state.tokenBalance),
    pendingRewards: formatSolAmount(state.pendingRewards),
    totalStaked: state.poolData 
      ? formatTokenAmount(state.poolData.totalStaked)
      : "0",
    totalStakers: state.poolData?.totalStakers?.toString() || "0",
    rawStakedAmount: state.userStakeData?.stakedAmount || BigInt(0),
    rawTokenBalance: state.tokenBalance,
    rawPendingRewards: state.pendingRewards,
    rawTotalStaked: state.poolData?.totalStaked || BigInt(0),
  };

  return {
    ...state,
    ...formattedData,
    refresh,
    client,
  };
}

// Hook to get pool stats
export function usePoolStats() {
  const [stats, setStats] = useState({
    totalStaked: "0",
    totalStakers: "0",
    rewardVaultBalance: "0",
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const client = new OrangeStakingClient(connection);
        const poolData = await client.getPoolData();
        
        if (poolData) {
          // Get reward vault balance
          const [poolPDA] = getPoolPDA();
          const [rewardVaultPDA] = getRewardVaultPDA(poolPDA);
          const rewardVaultBalance = await connection.getBalance(rewardVaultPDA);
          
          setStats({
            totalStaked: formatTokenAmount(poolData.totalStaked),
            totalStakers: poolData.totalStakers.toString(),
            rewardVaultBalance: (rewardVaultBalance / 1_000_000_000).toFixed(4),
            isLoading: false,
          });
        }
      } catch (e) {
        console.error("Error fetching pool stats:", e);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Transaction result type
interface TxResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// Hook for staking transactions
export function useStakingTransactions() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const stake = async (amount: string): Promise<TxResult> => {
    if (!publicKey || !sendTransaction) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsProcessing(true);
    
    try {
      const amountBN = parseTokenAmount(amount);
      const [poolPDA] = getPoolPDA();
      const [userStakePDA] = getUserStakePDA(poolPDA, publicKey);
      const [stakeVaultPDA] = getStakeVaultPDA(poolPDA);
      const userTokenAccount = await getAssociatedTokenAddress(ORANGE_MINT, publicKey);

      // Anchor discriminator for "stake"
      const discriminator = Buffer.from([206, 176, 202, 18, 200, 209, 179, 108]);
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64LE(amountBN);
      const data = Buffer.concat([discriminator, amountBuffer]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      
      setTxSignature(signature);
      console.log("Stake successful:", signature);
      return { success: true, signature };
    } catch (e: any) {
      console.error("Stake error:", e);
      const errorMsg = e.message?.includes("User rejected") 
        ? "Transaction cancelled by user"
        : e.message || "Transaction failed";
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  const unstake = async (amount: string, instant: boolean = false): Promise<TxResult> => {
    if (!publicKey || !sendTransaction) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsProcessing(true);
    
    try {
      const amountBN = parseTokenAmount(amount);
      const [poolPDA] = getPoolPDA();
      const [userStakePDA] = getUserStakePDA(poolPDA, publicKey);
      const [stakeVaultPDA] = getStakeVaultPDA(poolPDA);
      const userTokenAccount = await getAssociatedTokenAddress(ORANGE_MINT, publicKey);

      // Anchor discriminator for "unstake" or "instant_unstake"
      const discriminator = instant 
        ? Buffer.from([154, 82, 75, 182, 102, 45, 198, 214]) // instant_unstake
        : Buffer.from([90, 95, 107, 42, 205, 124, 50, 225]); // unstake
      
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64LE(amountBN);
      const data = Buffer.concat([discriminator, amountBuffer]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      
      setTxSignature(signature);
      console.log("Unstake successful:", signature);
      return { success: true, signature };
    } catch (e: any) {
      console.error("Unstake error:", e);
      const errorMsg = e.message?.includes("User rejected") 
        ? "Transaction cancelled by user"
        : e.message || "Transaction failed";
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  const claimRewards = async (): Promise<TxResult> => {
    if (!publicKey || !sendTransaction) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsProcessing(true);
    
    try {
      const [poolPDA] = getPoolPDA();
      const [userStakePDA] = getUserStakePDA(poolPDA, publicKey);
      const [rewardVaultPDA] = getRewardVaultPDA(poolPDA);

      // Anchor discriminator for "claim_rewards"
      const discriminator = Buffer.from([4, 144, 132, 71, 116, 23, 151, 80]);
      
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: rewardVaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: discriminator,
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      
      setTxSignature(signature);
      console.log("Claim successful:", signature);
      return { success: true, signature };
    } catch (e: any) {
      console.error("Claim error:", e);
      const errorMsg = e.message?.includes("User rejected") 
        ? "Transaction cancelled by user"
        : e.message || "Transaction failed";
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    stake,
    unstake,
    claimRewards,
    isProcessing,
    txSignature,
  };
}

// Activity item type
export interface ActivityItem {
  type: "stake" | "unstake" | "claim" | "unknown";
  signature: string;
  address: string;
  amount?: string;
  timestamp: number;
  timeAgo: string;
}

// Hook to fetch recent activity from blockchain
export function useRecentActivity(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const [poolPDA] = getPoolPDA();
        
        // Get recent signatures for the program
        const signatures = await connection.getSignaturesForAddress(
          poolPDA,
          { limit: limit * 2 }, // Fetch more to filter
          "confirmed"
        );

        if (signatures.length === 0) {
          setActivities([]);
          setIsLoading(false);
          return;
        }

        // Fetch transaction details
        const txs = await connection.getParsedTransactions(
          signatures.map(s => s.signature),
          { maxSupportedTransactionVersion: 0 }
        );

        const parsedActivities: ActivityItem[] = [];

        for (let i = 0; i < signatures.length && parsedActivities.length < limit; i++) {
          const sig = signatures[i];
          const tx = txs[i];
          
          if (!tx || !tx.meta || tx.meta.err) continue;

          // Parse the instruction type from logs
          const logs = tx.meta.logMessages || [];
          let type: ActivityItem["type"] = "unknown";
          let amount: string | undefined;

          // Check logs for instruction type
          const logStr = logs.join(" ");
          if (logStr.includes("Instruction: Stake") || logStr.includes("StakeEvent")) {
            type = "stake";
          } else if (logStr.includes("Instruction: InstantUnstake") || logStr.includes("InstantUnstakeEvent")) {
            type = "unstake";
          } else if (logStr.includes("Instruction: Unstake") || logStr.includes("UnstakeEvent")) {
            type = "unstake";
          } else if (logStr.includes("Instruction: ClaimRewards") || logStr.includes("ClaimEvent")) {
            type = "claim";
          } else if (logStr.includes("Instruction: Initialize")) {
            continue; // Skip initialize transactions
          } else if (logStr.includes("Instruction: DepositRewards")) {
            continue; // Skip deposit rewards (admin action)
          }

          if (type === "unknown") continue;

          // Get signer address
          const signer = tx.transaction.message.accountKeys.find(k => k.signer)?.pubkey.toBase58() || "Unknown";
          const shortAddress = `${signer.slice(0, 4)}...${signer.slice(-4)}`;

          // Calculate time ago
          const timestamp = sig.blockTime || 0;
          const timeAgo = getTimeAgo(timestamp);

          parsedActivities.push({
            type,
            signature: sig.signature,
            address: shortAddress,
            timestamp,
            timeAgo,
          });
        }

        setActivities(parsedActivities);
      } catch (e) {
        console.error("Error fetching activity:", e);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  return { activities, isLoading };
}

// Helper to format time ago
function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

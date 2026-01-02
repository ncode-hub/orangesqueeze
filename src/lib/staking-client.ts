import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { PROGRAM_ID, ORANGE_MINT, STAKING_CONFIG } from "./constants";
import { IDL } from "./idl";
import BN from "bn.js";

// PDA derivation functions
export function getPoolPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), ORANGE_MINT.toBuffer()],
    PROGRAM_ID
  );
}

export function getStakeVaultPDA(pool: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake_vault"), pool.toBuffer()],
    PROGRAM_ID
  );
}

export function getRewardVaultPDA(pool: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reward_vault"), pool.toBuffer()],
    PROGRAM_ID
  );
}

export function getUserStakePDA(pool: PublicKey, user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_stake"), pool.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

// Staking Pool data structure
export interface StakingPoolData {
  authority: PublicKey;
  stakeMint: PublicKey;
  stakeVault: PublicKey;
  rewardVault: PublicKey;
  totalStaked: bigint;
  totalStakers: bigint;
  rewardDuration: bigint;
  lastRewardTime: bigint;
  rewardPerTokenStored: bigint;
  minStakeAmount: bigint;
  instantUnstakeFee: number;
  bump: number;
}

// User Stake data structure
export interface UserStakeData {
  owner: PublicKey;
  pool: PublicKey;
  stakedAmount: bigint;
  stakeTime: bigint;
  rewardPerTokenPaid: bigint;
  pendingRewards: bigint;
  totalRewardsClaimed: bigint;
}

export class OrangeStakingClient {
  connection: Connection;
  programId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = PROGRAM_ID;
  }

  // Fetch pool data
  async getPoolData(): Promise<StakingPoolData | null> {
    const [poolPDA] = getPoolPDA();
    try {
      const accountInfo = await this.connection.getAccountInfo(poolPDA);
      if (!accountInfo) return null;
      // Decode account data (simplified - use anchor for proper decoding)
      return this.decodePoolData(accountInfo.data);
    } catch (e) {
      console.error("Error fetching pool:", e);
      return null;
    }
  }

  // Fetch user stake data
  async getUserStakeData(userPubkey: PublicKey): Promise<UserStakeData | null> {
    const [poolPDA] = getPoolPDA();
    const [userStakePDA] = getUserStakePDA(poolPDA, userPubkey);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(userStakePDA);
      if (!accountInfo) return null;
      return this.decodeUserStakeData(accountInfo.data);
    } catch (e) {
      console.error("Error fetching user stake:", e);
      return null;
    }
  }

  // Get user's token balance
  async getTokenBalance(userPubkey: PublicKey): Promise<bigint> {
    try {
      const ata = await getAssociatedTokenAddress(ORANGE_MINT, userPubkey);
      const balance = await this.connection.getTokenAccountBalance(ata);
      return BigInt(balance.value.amount);
    } catch (e) {
      return BigInt(0);
    }
  }

  // Calculate pending rewards
  async getPendingRewards(userPubkey: PublicKey): Promise<bigint> {
    const pool = await this.getPoolData();
    const userStake = await this.getUserStakeData(userPubkey);
    
    if (!pool || !userStake || userStake.stakedAmount === BigInt(0)) {
      return BigInt(0);
    }

    const rewardDiff = pool.rewardPerTokenStored - userStake.rewardPerTokenPaid;
    const earned = (userStake.stakedAmount * rewardDiff) / BigInt(1e18);
    
    return userStake.pendingRewards + earned;
  }

  // Decode functions (simplified - for production use @coral-xyz/anchor)
  private decodePoolData(data: Buffer): StakingPoolData {
    // Skip 8 byte discriminator
    let offset = 8;
    
    const authority = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const stakeMint = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const stakeVault = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const rewardVault = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const totalStaked = data.readBigUInt64LE(offset); offset += 8;
    const totalStakers = data.readBigUInt64LE(offset); offset += 8;
    const rewardDuration = data.readBigInt64LE(offset); offset += 8;
    const lastRewardTime = data.readBigInt64LE(offset); offset += 8;
    const rewardPerTokenStored = this.readU128(data, offset); offset += 16;
    const minStakeAmount = data.readBigUInt64LE(offset); offset += 8;
    const instantUnstakeFee = data.readUInt16LE(offset); offset += 2;
    const bump = data.readUInt8(offset);

    return {
      authority,
      stakeMint,
      stakeVault,
      rewardVault,
      totalStaked,
      totalStakers,
      rewardDuration,
      lastRewardTime,
      rewardPerTokenStored,
      minStakeAmount,
      instantUnstakeFee,
      bump,
    };
  }

  private decodeUserStakeData(data: Buffer): UserStakeData {
    let offset = 8;
    
    const owner = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const pool = new PublicKey(data.subarray(offset, offset + 32)); offset += 32;
    const stakedAmount = data.readBigUInt64LE(offset); offset += 8;
    const stakeTime = data.readBigInt64LE(offset); offset += 8;
    const rewardPerTokenPaid = this.readU128(data, offset); offset += 16;
    const pendingRewards = data.readBigUInt64LE(offset); offset += 8;
    const totalRewardsClaimed = data.readBigUInt64LE(offset);

    return {
      owner,
      pool,
      stakedAmount,
      stakeTime,
      rewardPerTokenPaid,
      pendingRewards,
      totalRewardsClaimed,
    };
  }

  private readU128(data: Buffer, offset: number): bigint {
    const low = data.readBigUInt64LE(offset);
    const high = data.readBigUInt64LE(offset + 8);
    return low + (high << BigInt(64));
  }
}

// Helper to format token amounts
export function formatTokenAmount(amount: bigint, decimals: number = STAKING_CONFIG.tokenDecimals): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, "0").slice(0, 2)}`;
}

// Helper to format SOL amounts
export function formatSolAmount(lamports: bigint): string {
  return (Number(lamports) / 1e9).toFixed(4);
}

// Helper to parse token input
export function parseTokenAmount(input: string, decimals: number = STAKING_CONFIG.tokenDecimals): bigint {
  const [whole, fraction = ""] = input.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

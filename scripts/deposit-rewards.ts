import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Calculate Anchor discriminator
function getDiscriminator(instructionName: string): Buffer {
  const hash = crypto.createHash('sha256').update(`global:${instructionName}`).digest();
  return hash.slice(0, 8);
}

// Configuration
const PROGRAM_ID = new PublicKey("5MRKYXP3y54CEqDsuEGnieLwYGrGkTQNG34xcpbWEoW7");
const ORANGE_MINT = new PublicKey("QTeMapgDXPdgG8ZKuyD4pkBsuE5qFeKeKEyp5khLHAV");
const RPC_URL = "https://api.devnet.solana.com";

// Amount to deposit (in SOL)
const DEPOSIT_AMOUNT = 0.05; // 0.05 SOL

async function main() {
  console.log("🍊 Depositing rewards to Orange Staking Pool...\n");

  // Load wallet
  const keypairPath = path.join(process.cwd(), "id.json");
  if (!fs.existsSync(keypairPath)) {
    console.error("❌ Wallet keypair not found!");
    console.log("Please copy your wallet keypair to:", keypairPath);
    process.exit(1);
  }

  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log("Wallet address:", wallet.publicKey.toBase58());

  // Connect
  const connection = new Connection(RPC_URL, "confirmed");
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  // Derive PDAs
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), ORANGE_MINT.toBuffer()],
    PROGRAM_ID
  );
  console.log("Pool PDA:", poolPDA.toBase58());

  const [rewardVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward_vault"), poolPDA.toBuffer()],
    PROGRAM_ID
  );
  console.log("Reward Vault PDA:", rewardVaultPDA.toBase58());

  // Check current reward vault balance
  const vaultBalance = await connection.getBalance(rewardVaultPDA);
  console.log("Current vault balance:", vaultBalance / LAMPORTS_PER_SOL, "SOL");

  // Check pool data
  const poolAccount = await connection.getAccountInfo(poolPDA);
  if (!poolAccount) {
    console.error("❌ Pool not initialized!");
    process.exit(1);
  }

  // Read total_staked from pool (offset 8 + 32*4 = 136, then 8 bytes for total_staked)
  const totalStaked = poolAccount.data.readBigUInt64LE(8 + 32 * 4);
  console.log("Total staked:", totalStaked.toString(), "tokens\n");

  if (totalStaked === BigInt(0)) {
    console.error("❌ No tokens staked in pool! Deposit rewards after someone stakes.");
    process.exit(1);
  }

  const depositLamports = Math.floor(DEPOSIT_AMOUNT * LAMPORTS_PER_SOL);
  console.log(`Depositing ${DEPOSIT_AMOUNT} SOL (${depositLamports} lamports)...`);

  // Build deposit_rewards instruction
  const discriminator = getDiscriminator("deposit_rewards");
  console.log("Discriminator:", Array.from(discriminator));
  
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(depositLamports));
  const data = Buffer.concat([discriminator, amountBuffer]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: poolPDA, isSigner: false, isWritable: true },
      { pubkey: rewardVaultPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const transaction = new Transaction().add(instruction);

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: "confirmed",
    });

    console.log("\n✅ Rewards deposited successfully!");
    console.log("Transaction:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Check new vault balance
    const newVaultBalance = await connection.getBalance(rewardVaultPDA);
    console.log("\nNew vault balance:", newVaultBalance / LAMPORTS_PER_SOL, "SOL");
    console.log("\nStakers can now claim their rewards! 🧃");
  } catch (error: any) {
    console.error("\n❌ Transaction failed:", error.message);
    
    if (error.message?.includes("Unauthorized")) {
      console.log("\nNote: Only the pool authority can deposit rewards.");
      console.log("Pool was initialized by a different wallet.");
    }
  }
}

main().catch(console.error);

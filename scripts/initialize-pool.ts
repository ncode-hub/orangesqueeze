import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const PROGRAM_ID = new PublicKey("5MRKYXP3y54CEqDsuEGnieLwYGrGkTQNG34xcpbWEoW7");
const ORANGE_MINT = new PublicKey("QTeMapgDXPdgG8ZKuyD4pkBsuE5qFeKeKEyp5khLHAV");
const RPC_URL = "https://api.devnet.solana.com";

// Staking config
const REWARD_DURATION = 600; // 10 minutes
const MIN_STAKE_AMOUNT = 300000 * 1_000_000; // 300K tokens (with 6 decimals)
const INSTANT_UNSTAKE_FEE = 100; // 1% in basis points

async function main() {
  console.log("🍊 Initializing Orange Staking Pool...\n");

  // Load wallet from local id.json
  const keypairPath = path.join(process.cwd(), "id.json");
  
  if (!fs.existsSync(keypairPath)) {
    console.error("❌ Wallet keypair not found!");
    console.log("Please copy your wallet keypair to:", keypairPath);
    console.log("\nRun in WSL: cp /home/ncode/.config/solana/id.json /mnt/c/xampp/htdocs/stake-orange/id.json");
    process.exit(1);
  }

  console.log("Loading wallet from:", keypairPath);
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  
  console.log("Wallet address:", wallet.publicKey.toBase58());

  // Connect to devnet
  const connection = new Connection(RPC_URL, "confirmed");
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Wallet balance:", balance / 1_000_000_000, "SOL\n");

  if (balance < 0.1 * 1_000_000_000) {
    console.error("❌ Insufficient balance. Need at least 0.1 SOL");
    process.exit(1);
  }

  // Derive PDAs
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), ORANGE_MINT.toBuffer()],
    PROGRAM_ID
  );
  console.log("Pool PDA:", poolPDA.toBase58());

  const [stakeVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake_vault"), poolPDA.toBuffer()],
    PROGRAM_ID
  );
  console.log("Stake Vault PDA:", stakeVaultPDA.toBase58());

  const [rewardVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward_vault"), poolPDA.toBuffer()],
    PROGRAM_ID
  );
  console.log("Reward Vault PDA:", rewardVaultPDA.toBase58());

  // Check if pool already exists
  const poolAccount = await connection.getAccountInfo(poolPDA);
  if (poolAccount) {
    console.log("\n✅ Pool already initialized!");
    console.log("Pool address:", poolPDA.toBase58());
    process.exit(0);
  }

  console.log("\n📝 Building initialize transaction...");

  // Build instruction data for initialize
  // Anchor discriminator for "initialize" + args
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]); // initialize discriminator
  
  const rewardDurationBuffer = Buffer.alloc(8);
  rewardDurationBuffer.writeBigInt64LE(BigInt(REWARD_DURATION));
  
  const minStakeBuffer = Buffer.alloc(8);
  minStakeBuffer.writeBigUInt64LE(BigInt(MIN_STAKE_AMOUNT));
  
  const feeBuffer = Buffer.alloc(2);
  feeBuffer.writeUInt16LE(INSTANT_UNSTAKE_FEE);

  const data = Buffer.concat([discriminator, rewardDurationBuffer, minStakeBuffer, feeBuffer]);

  const { TransactionInstruction, Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: poolPDA, isSigner: false, isWritable: true },
      { pubkey: ORANGE_MINT, isSigner: false, isWritable: false },
      { pubkey: stakeVaultPDA, isSigner: false, isWritable: true },
      { pubkey: rewardVaultPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const transaction = new Transaction().add(instruction);

  console.log("🚀 Sending transaction...");
  
  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: "confirmed",
    });
    
    console.log("\n✅ Pool initialized successfully!");
    console.log("Transaction:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\nPool Address:", poolPDA.toBase58());
    console.log("Stake Vault:", stakeVaultPDA.toBase58());
    console.log("Reward Vault:", rewardVaultPDA.toBase58());
  } catch (error) {
    console.error("\n❌ Transaction failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);

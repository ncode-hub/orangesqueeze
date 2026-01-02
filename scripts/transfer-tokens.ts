import { 
  Connection, 
  Keypair, 
  PublicKey,
  clusterApiUrl 
} from "@solana/web3.js";
import { 
  getOrCreateAssociatedTokenAccount, 
  transfer 
} from "@solana/spl-token";
import * as fs from "fs";

// Configuration
const ORANGE_MINT = new PublicKey("QTeMapgDXPdgG8ZKuyD4pkBsuE5qFeKeKEyp5khLHAV");
const RECIPIENT_ADDRESS = process.argv[2]; // Pass as argument
const AMOUNT = parseInt(process.argv[3]) || 1000000; // Default 1M tokens

async function main() {
  if (!RECIPIENT_ADDRESS) {
    console.log("Usage: npx ts-node scripts/transfer-tokens.ts <RECIPIENT_WALLET> <AMOUNT>");
    console.log("Example: npx ts-node scripts/transfer-tokens.ts 7xKu...9Fgh 1000000");
    process.exit(1);
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // Load your wallet (the one that has the tokens)
  const walletPath = "./id.json"; // Your wallet keypair
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
  
  console.log("From wallet:", wallet.publicKey.toBase58());
  console.log("To wallet:", RECIPIENT_ADDRESS);
  console.log("Amount:", AMOUNT, "tokens (with 6 decimals)");

  const recipient = new PublicKey(RECIPIENT_ADDRESS);

  // Get or create sender's token account
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    ORANGE_MINT,
    wallet.publicKey
  );
  console.log("Sender token account:", senderTokenAccount.address.toBase58());

  // Get or create recipient's token account
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet, // Payer for creating account if needed
    ORANGE_MINT,
    recipient
  );
  console.log("Recipient token account:", recipientTokenAccount.address.toBase58());

  // Transfer tokens (amount is in smallest unit, so multiply by 10^decimals)
  const amountInSmallestUnit = BigInt(AMOUNT) * BigInt(1_000_000); // 6 decimals
  
  const signature = await transfer(
    connection,
    wallet,
    senderTokenAccount.address,
    recipientTokenAccount.address,
    wallet,
    amountInSmallestUnit
  );

  console.log("\n✅ Transfer successful!");
  console.log("Signature:", signature);
  console.log(`Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}

main().catch(console.error);

"use client";

import { useState, useEffect } from "react";
import { useWallet, WalletMultiButton } from "@/contexts/WalletContext";
import { ArrowDownUp, Loader2, Info } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { RPC_ENDPOINT, ORANGE_MINT } from "@/lib/constants";

const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

export default function SwapPage() {
  const wallet = useWallet();
  const { connected, publicKey, signTransaction } = wallet;
  const { showToast } = useToast();
  
  const [solAmount, setSolAmount] = useState("");
  const [orangeAmount, setOrangeAmount] = useState("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [slippage, setSlippage] = useState(1);
  
  const getQuote = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setOrangeAmount("");
      setQuoteData(null);
      return;
    }
    
    try {
      setIsLoadingQuote(true);
      const lamports = Math.floor(parseFloat(amount) * 1e9);
      
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${NATIVE_SOL_MINT}&outputMint=${ORANGE_MINT.toBase58()}&amount=${lamports}&slippageBps=${slippage * 100}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to get quote");
      }
      
      const quote = await response.json();
      setQuoteData(quote);
      
      const outputAmount = parseInt(quote.outAmount) / 1e6;
      setOrangeAmount(outputAmount.toFixed(2));
    } catch (error) {
      console.error("Quote error:", error);
      showToast("error", "Quote Failed", "Unable to get swap quote. Try again.");
      setOrangeAmount("");
      setQuoteData(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (solAmount) {
        getQuote(solAmount);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [solAmount, slippage]);
  
  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !quoteData) {
      showToast("error", "Swap Failed", "Please connect your wallet");
      return;
    }
    
    try {
      setIsSwapping(true);
      
      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get swap transaction");
      }
      
      const { swapTransaction } = await response.json();
      
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      const signedTransaction = await signTransaction(transaction);
      
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );
      
      await connection.confirmTransaction(signature, "confirmed");
      
      showToast(
        "success",
        "Swap Successful! ??",
        `You swapped ${solAmount} SOL for ${orangeAmount} ORANGE`,
        signature
      );
      
      setSolAmount("");
      setOrangeAmount("");
      setQuoteData(null);
    } catch (error: any) {
      console.error("Swap error:", error);
      showToast("error", "Swap Failed", error.message || "Transaction failed");
    } finally {
      setIsSwapping(false);
    }
  };
  
  const handleMaxSol = () => {
    showToast("info", "Max SOL", "Please enter your SOL amount manually");
  };
  
  if (!connected) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">??</div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to swap SOL for $ORANGE
          </p>
          <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !px-8" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Swap to $ORANGE</h1>
          <p className="text-gray-400">
            Convert your SOL to $ORANGE tokens instantly
          </p>
        </div>
        
        <div className="bg-black/40 rounded-2xl p-6 orange-border">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Info className="w-4 h-4" />
              <span className="text-sm">Slippage Tolerance</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.5, 1, 2].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    slippage === value
                      ? "bg-orange-500 text-white"
                      : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-gray-400 text-sm mb-2">From</div>
            <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="bg-transparent text-2xl font-bold outline-none flex-1"
                />
                <button
                  onClick={handleMaxSol}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold hover:bg-orange-500/30 transition-all mr-2"
                >
                  MAX
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ?
                  </div>
                  <span className="font-bold">SOL</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center my-4">
            <div className="p-2 bg-orange-500 rounded-full">
              <ArrowDownUp className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">To (estimated)</div>
            <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-400">
                  {isLoadingQuote ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    orangeAmount || "0.0"
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg">
                  <span className="text-2xl">??</span>
                  <span className="font-bold">ORANGE</span>
                </div>
              </div>
            </div>
          </div>
          
          {quoteData && (
            <div className="mb-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white font-bold">
                    1 SOL � {(parseInt(quoteData.outAmount) / 1e6 / parseFloat(solAmount)).toFixed(2)} ORANGE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={`font-bold ${quoteData.priceImpactPct > 1 ? 'text-red-400' : 'text-green-400'}`}>
                    {quoteData.priceImpactPct?.toFixed(2) || '0.00'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum Received</span>
                  <span className="text-white font-bold">
                    {(parseInt(quoteData.otherAmountThreshold || quoteData.outAmount) / 1e6).toFixed(2)} ORANGE
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSwap}
            disabled={isSwapping || isLoadingQuote || !quoteData || !solAmount}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap Now ??"
            )}
          </button>
          
          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <p className="mb-2">
                  <span className="text-blue-400 font-bold">Powered by Jupiter Aggregator</span>
                </p>
                <p>
                  Jupiter finds the best route across all Solana DEXs to get you the best price for your swap.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-black/40 rounded-2xl p-6 orange-border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>??</span>
            What to do next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <div className="font-bold mb-1">Stake Your $ORANGE</div>
                <div className="text-gray-400 text-sm">
                  Head to the Grove to stake your tokens and start earning rewards
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <div className="font-bold mb-1">Grow Your Grove</div>
                <div className="text-gray-400 text-sm">
                  Watch your staking rewards grow every epoch (24 hours)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <div className="font-bold mb-1">Harvest Your Juice</div>
                <div className="text-gray-400 text-sm">
                  Claim your SOL rewards anytime from the Rewards tab
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

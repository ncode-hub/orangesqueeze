"use client";

import { useState } from "react";
import { useWallet, WalletMultiButton } from "@/contexts/WalletContext";
import { ArrowDown, Zap, Info } from "lucide-react";

export default function StakePage() {
  const { connected } = useWallet();
  const [mode, setMode] = useState<"squeeze" | "unsqueeze">("squeeze");
  const [amount, setAmount] = useState("");
  const [walletBalance] = useState(5000); // Dummy balance
  const [stakedBalance] = useState(1000); // Dummy staked

  const handleMax = () => {
    if (mode === "squeeze") {
      setAmount(walletBalance.toString());
    } else {
      setAmount(stakedBalance.toString());
    }
  };

  const handleSubmit = () => {
    // Dummy transaction - would call smart contract in real implementation
    alert(`${mode === "squeeze" ? "Squeezing" : "Unsqueezing"} ${amount} $ORANGE`);
  };

  if (!connected) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🍊</div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to start squeezing
          </p>
          <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !px-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            {mode === "squeeze" ? "Squeeze" : "Unsqueeze"} Your $ORANGE
          </h1>
          <p className="text-gray-400">
            {mode === "squeeze"
              ? "Stake your tokens to start earning juice"
              : "Withdraw your staked tokens"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-black/40 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode("squeeze")}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              mode === "squeeze"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🍊 Squeeze
          </button>
          <button
            onClick={() => setMode("unsqueeze")}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              mode === "unsqueeze"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📤 Unsqueeze
          </button>
        </div>

        {/* Stake Card */}
        <div className="bg-black/40 rounded-2xl p-6 orange-border mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">
              {mode === "squeeze" ? "Amount to Squeeze" : "Amount to Unsqueeze"}
            </span>
            <span className="text-sm text-gray-400">
              Balance: {mode === "squeeze" ? walletBalance : stakedBalance} $ORANGE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-3xl font-bold outline-none"
            />
            <button
              onClick={handleMax}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg font-bold hover:bg-orange-500/30 transition-all"
            >
              MAX
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-2xl">🍊</span>
            <span className="font-bold">$ORANGE</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Result Card */}
        <div className="bg-black/40 rounded-2xl p-6 orange-border mb-6">
          <div className="text-gray-400 mb-2">You will receive</div>
          <div className="text-3xl font-bold">
            {amount || "0.00"} {mode === "squeeze" ? "st$ORANGE" : "$ORANGE"}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-2xl">{mode === "squeeze" ? "🧃" : "🍊"}</span>
            <span className="font-bold">
              {mode === "squeeze" ? "st$ORANGE" : "$ORANGE"}
            </span>
          </div>
        </div>

        {/* Info Box */}
        {mode === "unsqueeze" && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <div className="font-bold text-orange-400 mb-1">
                  Instant Unsqueeze Available
                </div>
                <p className="text-sm text-gray-400">
                  You can unsqueeze instantly with a 1% fee, or wait until the
                  next epoch for free withdrawal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {mode === "squeeze" ? "Squeeze Now" : "Unsqueeze Now"}
        </button>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Current APY</div>
            <div className="text-2xl font-bold text-orange-400">12.5%</div>
          </div>
          <div className="bg-black/40 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Total Squeezed</div>
            <div className="text-2xl font-bold text-orange-400">1.2M</div>
          </div>
        </div>
      </div>
    </div>
  );
}

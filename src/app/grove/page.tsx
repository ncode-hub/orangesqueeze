"use client";

import { useState } from "react";
import { useWallet, WalletMultiButton } from "@/contexts/WalletContext";
import { Sparkles, TrendingUp, Unlock, Zap, RefreshCw, Loader2 } from "lucide-react";
import GrowthTracker from "@/components/GrowthTracker";
import HarvestTimer from "@/components/HarvestTimer";
import NutritionFacts from "@/components/NutritionFacts";
import CommunityGrove from "@/components/CommunityGrove";
import { useStaking, useStakingTransactions, usePoolStats } from "@/hooks/useStaking";
import { useToast } from "@/components/Toast";
import LoadingScreen from "@/components/LoadingScreen";

export default function GrovePage() {
  const { connected, publicKey } = useWallet();
  const { tokenBalance, stakedAmount, pendingRewards: stakingRewards, refresh, isLoading } = useStaking(publicKey);
  const { stake, unstake, claimRewards, isProcessing, txSignature } = useStakingTransactions();
  const poolStats = usePoolStats();
  const { showToast } = useToast();
  
  // All useState hooks must be called before any early returns
  const [activeTab, setActiveTab] = useState<"squeeze" | "rewards">("squeeze");
  const [amount, setAmount] = useState("");

  // Show loading screen while initial data is loading
  if (connected && isLoading && poolStats.isLoading) {
    return <LoadingScreen message="Loading your grove data..." />;
  }
  
  const walletBalance = parseFloat(tokenBalance) || 0;
  const stakedBalance = parseFloat(stakedAmount) || 0;
  const pendingRewardsValue = parseFloat(stakingRewards) || 0;

  const minSqueeze = 300000;

  const handleStake = async () => {
    if (!amount || parseFloat(amount) < minSqueeze) {
      showToast("warning", "Invalid Amount", `Minimum stake is ${minSqueeze.toLocaleString()} ORANGE`);
      return;
    }
    if (parseFloat(amount) > walletBalance) {
      showToast("error", "Insufficient Balance", "You don't have enough ORANGE tokens");
      return;
    }
    const result = await stake(amount);
    if (result.success) {
      showToast("success", "Stake Successful! 🍊", `You staked ${parseFloat(amount).toLocaleString()} ORANGE`, result.signature);
      setAmount("");
      refresh();
    } else {
      showToast("error", "Stake Failed", result.error || "Transaction failed");
    }
  };

  const handleUnstake = async (instant: boolean = false) => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("warning", "Invalid Amount", "Please enter amount to unstake");
      return;
    }
    if (parseFloat(amount) > stakedBalance) {
      showToast("error", "Insufficient Staked Balance", "You don't have enough staked tokens");
      return;
    }
    const result = await unstake(amount, instant);
    if (result.success) {
      const feeMsg = instant ? " (1% fee applied)" : "";
      showToast("success", "Unstake Successful! 🧃", `You unstaked ${parseFloat(amount).toLocaleString()} ORANGE${feeMsg}`, result.signature);
      setAmount("");
      refresh();
    } else {
      showToast("error", "Unstake Failed", result.error || "Transaction failed");
    }
  };

  const handleClaimRewards = async () => {
    if (pendingRewardsValue <= 0) {
      showToast("warning", "No Rewards", "You don't have any pending rewards to claim");
      return;
    }
    const result = await claimRewards();
    if (result.success) {
      showToast("success", "Harvest Successful! 🧃", `You claimed ${pendingRewardsValue.toFixed(4)} SOL`, result.signature);
      refresh();
    } else {
      showToast("error", "Harvest Failed", result.error || "Transaction failed");
    }
  };

  const handleMax = () => {
    if (activeTab === "squeeze") {
      setAmount(walletBalance.toString());
    } else {
      setAmount(stakedBalance.toString());
    }
  };

  if (!connected) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🍊</div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to access your grove
          </p>
          <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !px-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Staking Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Squeeze/Rewards Toggle */}
            <div className="flex bg-black/40 rounded-full p-1 orange-border">
              <button
                onClick={() => setActiveTab("squeeze")}
                className={`flex-1 py-3 rounded-full font-bold transition-all ${
                  activeTab === "squeeze"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Squeeze
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex-1 py-3 rounded-full font-bold transition-all ${
                  activeTab === "rewards"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Rewards
              </button>
            </div>

            {activeTab === "squeeze" ? (
              <>
                {/* Squeeze Oranges Card */}
                <div className="bg-black/40 rounded-2xl p-6 orange-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400">🍊</span>
                    <h2 className="text-lg font-bold text-orange-400">Squeeze Oranges</h2>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    Stake your tokens and start growing your grove
                  </p>

                  <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-1">Your Balance</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {walletBalance.toLocaleString()} ORANGE
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Amount to Squeeze</span>
                      <span className="text-gray-500 text-sm">Min: {minSqueeze.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded-xl p-3 border border-orange-500/30">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={minSqueeze.toLocaleString()}
                        className="flex-1 bg-transparent text-xl font-bold outline-none"
                      />
                      <button
                        onClick={handleMax}
                        className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg font-bold hover:bg-orange-500/30 transition-all text-sm"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Variable APY Info */}
                  <div className="bg-orange-500/10 rounded-xl p-4 mb-4 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-orange-400">Variable APY</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Rewards are based on trading volume and creator fee distributions. Higher volume = higher rewards.
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Unlock className="w-4 h-4" />
                      <span className="text-sm">No lockups</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Real yield</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleStake}
                    disabled={isProcessing || !amount}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Squeeze Stake →"
                    )}
                  </button>
                </div>

                {/* How Rewards Work */}
                <div className="bg-black/40 rounded-2xl p-6 orange-border">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <h2 className="text-lg font-bold">How Rewards Work</h2>
                  </div>

                  <div className="space-y-4">
                    <RewardInfo
                      icon={<Sparkles className="w-4 h-4 text-orange-400" />}
                      title="Variable APY"
                      description="Returns depend on trading volume and creator fee distributions"
                    />
                    <RewardInfo
                      icon={<RefreshCw className="w-4 h-4 text-orange-400" />}
                      title="Dynamic Fees"
                      description="Pump.fun creator fees vary based on token market cap"
                    />
                    <RewardInfo
                      icon={<Zap className="w-4 h-4 text-orange-400" />}
                      title="Real Yield"
                      description="Rewards come from actual trading activity, not inflation"
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-orange-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {poolStats.isLoading ? "..." : poolStats.rewardVaultBalance}
                      </div>
                      <div className="text-gray-400 text-sm">SOL in Vault</div>
                    </div>
                    <div className="bg-orange-500/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {poolStats.isLoading ? "..." : poolStats.totalStaked}
                      </div>
                      <div className="text-gray-400 text-sm">Total Squeezed</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-gray-500 text-sm">
                    {poolStats.totalStakers} stakers in the grove
                  </div>
                </div>

                {/* Community Grove */}
                <CommunityGrove />
              </>
            ) : (
              /* Rewards Tab */
              <div className="space-y-6">
                {/* Your Staked Balance */}
                <div className="bg-black/40 rounded-2xl p-6 orange-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🍊</span>
                    <h2 className="text-lg font-bold text-orange-400">Your Staked Balance</h2>
                  </div>
                  
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-orange-400 mb-2">
                      {stakedBalance.toLocaleString()} ORANGE
                    </div>
                    <p className="text-gray-400 mb-4">Currently staked</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Amount to Unstake</span>
                      <button 
                        onClick={() => setAmount(stakedBalance.toString())}
                        className="text-orange-400 text-sm hover:underline"
                      >
                        MAX
                      </button>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-black/40 rounded-xl p-3 border border-orange-500/30 text-xl font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleUnstake(false)}
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      className="py-3 bg-orange-500/20 hover:bg-orange-500/30 disabled:bg-orange-500/10 disabled:cursor-not-allowed rounded-xl font-bold transition-all text-orange-400"
                    >
                      Unstake
                    </button>
                    <button 
                      onClick={() => handleUnstake(true)}
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      className="py-3 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 disabled:cursor-not-allowed rounded-xl font-bold transition-all text-red-400"
                    >
                      Instant (1% fee)
                    </button>
                  </div>
                </div>

                {/* Pending Rewards */}
                <div className="bg-black/40 rounded-2xl p-6 orange-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🧃</span>
                    <h2 className="text-lg font-bold text-orange-400">Your Juice Rewards</h2>
                  </div>

                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-orange-400 mb-2">
                      {pendingRewardsValue.toFixed(4)} SOL
                    </div>
                    <p className="text-gray-400 mb-6">Ready to harvest</p>

                    <button 
                      onClick={handleClaimRewards}
                      disabled={isProcessing || pendingRewardsValue <= 0}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Harvest Juice 🧃"
                      )}
                    </button>
                  </div>

                  {pendingRewardsValue <= 0 && (
                    <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <p className="text-gray-400 text-sm text-center">
                        No pending rewards yet. Rewards are distributed when SOL is deposited to the reward vault by the pool admin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats Panels */}
          <div className="space-y-6">
            <GrowthTracker stakedAmount={stakedBalance} />
            <HarvestTimer pendingRewards={pendingRewardsValue} />
            <NutritionFacts
              stakedAmount={stakedBalance}
              pendingRewards={pendingRewardsValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardInfo({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-gray-400 text-sm">{description}</div>
      </div>
    </div>
  );
}

"use client";

import { useWallet, WalletMultiButton } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { TrendingUp, Droplets, Clock, Wallet } from "lucide-react";
import GrowthTracker from "@/components/GrowthTracker";
import HarvestTimer from "@/components/HarvestTimer";

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const [stakedAmount, setStakedAmount] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (connected) {
      // Dummy data - would fetch from blockchain in real implementation
      setStakedAmount(1000);
      setPendingRewards(12.5);
      setTotalEarned(150.75);
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🍊</div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your grove dashboard
          </p>
          <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !px-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Your Grove</h1>
          <p className="text-gray-400">
            Welcome back, {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-orange-400" />}
            label="Staked Balance"
            value={`${stakedAmount.toLocaleString()} $ORANGE`}
          />
          <StatCard
            icon={<Droplets className="w-6 h-6 text-orange-400" />}
            label="Pending Juice"
            value={`${pendingRewards.toFixed(2)} $ORANGE`}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
            label="Total Earned"
            value={`${totalEarned.toFixed(2)} $ORANGE`}
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-orange-400" />}
            label="Current APY"
            value="12.5%"
          />
        </div>

        {/* Growth Tracker & Harvest Timer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <GrowthTracker stakedAmount={stakedAmount} />
          <HarvestTimer pendingRewards={pendingRewards} />
        </div>

        {/* Recent Activity */}
        <div className="bg-black/40 rounded-2xl p-6 orange-border">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              type="stake"
              amount={500}
              time="2 hours ago"
            />
            <ActivityItem
              type="harvest"
              amount={12.5}
              time="1 day ago"
            />
            <ActivityItem
              type="stake"
              amount={500}
              time="3 days ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ActivityItem({
  type,
  amount,
  time,
}: {
  type: "stake" | "unstake" | "harvest";
  amount: number;
  time: string;
}) {
  const icons = {
    stake: "🍊",
    unstake: "📤",
    harvest: "🧃",
  };

  const labels = {
    stake: "Squeezed",
    unstake: "Unstaked",
    harvest: "Harvested Juice",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-orange-500/20 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div>
          <div className="font-medium">{labels[type]}</div>
          <div className="text-sm text-gray-400">{time}</div>
        </div>
      </div>
      <div className="text-orange-400 font-bold">
        {type === "unstake" ? "-" : "+"}
        {amount} $ORANGE
      </div>
    </div>
  );
}

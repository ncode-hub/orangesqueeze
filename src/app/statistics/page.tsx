"use client";

import { TrendingUp, Users, Coins, Clock, BarChart3, PieChart, Loader2 } from "lucide-react";
import { usePoolStats, useRecentActivity } from "@/hooks/useStaking";
import LoadingScreen from "@/components/LoadingScreen";

export default function StatisticsPage() {
  const poolStats = usePoolStats();
  const { activities, isLoading: activityLoading } = useRecentActivity(10);

  // Show loading screen while initial data is loading
  if (poolStats.isLoading && activityLoading) {
    return <LoadingScreen message="Loading statistics..." />;
  }

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Statistics</h1>
          <p className="text-gray-400">Real-time grove analytics and metrics</p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Coins className="w-6 h-6 text-orange-400" />}
            label="Total Staked"
            value={poolStats.isLoading ? "..." : `${poolStats.totalStaked} ORANGE`}
            subtext="In the grove"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-orange-400" />}
            label="Total Stakers"
            value={poolStats.isLoading ? "..." : poolStats.totalStakers}
            subtext="Growers"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
            label="Reward Vault"
            value={poolStats.isLoading ? "..." : `${poolStats.rewardVaultBalance} SOL`}
            subtext="Available rewards"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-orange-400" />}
            label="Recent Activity"
            value={activityLoading ? "..." : `${activities.length}`}
            subtext="Transactions"
          />
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* TVL Chart Placeholder */}
          <div className="bg-black/40 rounded-2xl p-6 orange-border">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold">Total Value Locked</h2>
            </div>
            <div className="h-64 flex items-center justify-center border border-orange-500/20 rounded-xl">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-400">Chart Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Distribution Chart Placeholder */}
          <div className="bg-black/40 rounded-2xl p-6 orange-border">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold">Reward Distribution</h2>
            </div>
            <div className="h-64 flex items-center justify-center border border-orange-500/20 rounded-xl">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-gray-400">Chart Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-black/40 rounded-2xl p-6 orange-border">
          <h2 className="text-lg font-bold mb-6">Protocol Metrics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <MetricItem 
              label="Total $ORANGE Staked" 
              value={poolStats.isLoading ? "Loading..." : `${poolStats.totalStaked}`} 
            />
            <MetricItem 
              label="SOL in Reward Vault" 
              value={poolStats.isLoading ? "Loading..." : `${poolStats.rewardVaultBalance} SOL`} 
            />
            <MetricItem 
              label="Total Stakers" 
              value={poolStats.isLoading ? "Loading..." : poolStats.totalStakers} 
            />
            <MetricItem 
              label="Network" 
              value="Solana Devnet" 
            />
            <MetricItem 
              label="Min Stake" 
              value="300,000 ORANGE" 
            />
            <MetricItem 
              label="Instant Unstake Fee" 
              value="1%" 
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/40 rounded-2xl p-6 orange-border mt-8">
          <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading activity...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-400">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <a
                  key={activity.signature}
                  href={`https://explorer.solana.com/tx/${activity.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-3 border-b border-orange-500/20 last:border-0 hover:bg-orange-500/5 px-2 rounded transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {activity.type === "stake" ? "🍊" : activity.type === "claim" ? "🧃" : "📤"}
                    </span>
                    <div>
                      <span className="font-mono text-sm">{activity.address}</span>
                      <span className="text-gray-500 text-xs ml-2">{activity.timeAgo}</span>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    activity.type === "stake" ? "text-orange-400" : 
                    activity.type === "claim" ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {activity.type === "stake" ? "Staked" : activity.type === "claim" ? "Claimed" : "Unstaked"}
                  </span>
                </a>
              ))
            )}
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
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subtext && (
        <span className="text-sm text-gray-400">{subtext}</span>
      )}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-orange-500/20">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-xl font-bold text-orange-400">{value}</div>
    </div>
  );
}

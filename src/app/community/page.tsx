"use client";

import { useState } from "react";
import { Trophy, Activity, Users, Crown, Medal, Award, Loader2, Info } from "lucide-react";
import { usePoolStats, useRecentActivity } from "@/hooks/useStaking";
import LoadingScreen from "@/components/LoadingScreen";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "activity">("activity");
  const poolStats = usePoolStats();
  const { activities, isLoading: activityLoading } = useRecentActivity(15);

  // Show loading screen while initial data is loading
  if (poolStats.isLoading && activityLoading) {
    return <LoadingScreen message="Loading community data..." />;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400 w-5 text-center">{rank}</span>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "stake":
        return "🍊";
      case "claim":
        return "🧃";
      case "unstake":
        return "📤";
      default:
        return "❓";
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Community Grove</h1>
          <p className="text-gray-400">See what other growers are doing</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 rounded-2xl p-6 orange-border text-center">
            <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">{poolStats.totalStakers}</div>
            <div className="text-gray-400 text-sm">Active Growers</div>
          </div>
          <div className="bg-black/40 rounded-2xl p-6 orange-border text-center">
            <Trophy className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">{poolStats.totalStaked}</div>
            <div className="text-gray-400 text-sm">Total Staked</div>
          </div>
          <div className="bg-black/40 rounded-2xl p-6 orange-border text-center">
            <Activity className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">{activities.length}</div>
            <div className="text-gray-400 text-sm">Recent Actions</div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black/40 rounded-xl p-1 mb-6 orange-border">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
              activeTab === "leaderboard"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
              activeTab === "activity"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="w-5 h-5" />
            Recent Activity
          </button>
        </div>

        {/* Content */}
        {activeTab === "leaderboard" ? (
          <div className="bg-black/40 rounded-2xl orange-border overflow-hidden">
            <div className="flex items-center gap-2 p-4 bg-orange-500/10">
              <Info className="w-4 h-4 text-orange-400" />
              <span className="text-gray-400 text-sm">
                Leaderboard coming soon. Currently {poolStats.totalStakers} stakers in the grove.
              </span>
            </div>
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-400">Leaderboard will be available soon</p>
              <p className="text-gray-500 text-sm mt-2">
                Requires indexer to track individual stake amounts
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-black/40 rounded-2xl p-4 orange-border">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                <span className="ml-2 text-gray-400">Loading activity...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-400">No recent activity yet</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to stake!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((item) => (
                  <a
                    key={item.signature}
                    href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 px-4 bg-orange-500/5 rounded-xl hover:bg-orange-500/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getActivityIcon(item.type)}</span>
                      <div>
                        <div className="font-mono text-sm">{item.address}</div>
                        <div className="text-gray-500 text-xs">{item.timeAgo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          item.type === "stake"
                            ? "text-orange-400"
                            : item.type === "claim"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {item.type === "stake" ? "Staked" : item.type === "claim" ? "Claimed" : "Unstaked"}
                      </div>
                      <div className="text-gray-500 text-xs capitalize">{item.type}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

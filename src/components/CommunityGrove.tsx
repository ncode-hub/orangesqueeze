"use client";

import { useState } from "react";
import { Users, ExternalLink, Trophy, Activity, Info, Loader2 } from "lucide-react";
import { usePoolStats, useRecentActivity, ActivityItem } from "@/hooks/useStaking";

export default function CommunityGrove() {
  // All useState hooks must be called before any conditional logic
  const [activeTab, setActiveTab] = useState<"leaderboard" | "activity">("activity");
  
  // Move all hooks to the top before any conditional logic
  const poolStats = usePoolStats();
  const { activities, isLoading: activityLoading } = useRecentActivity(10);
  
  // Now we can safely use conditional logic
  const emptyState = poolStats.totalStakers === "0" && activities.length === 0;

  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold">Community Grove</h2>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
            LIVE
          </span>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-400" />
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-black/40 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "leaderboard"
              ? "bg-orange-500/20 text-orange-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "activity"
              ? "bg-orange-500/20 text-orange-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          Recent Activity
        </button>
      </div>

      {/* Content */}
      {emptyState ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-gray-400 mb-2">The grove is waiting for its first stakers!</p>
          <p className="text-gray-500 text-sm">Be the first to squeeze your ORANGE tokens.</p>
        </div>
      ) : activeTab === "leaderboard" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3 p-2 bg-orange-500/10 rounded-lg">
            <Info className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">
              Leaderboard coming soon. {poolStats.totalStakers} stakers currently in the grove.
            </span>
          </div>
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-gray-400 text-sm">Leaderboard will be available soon</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading activity...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-400 text-sm">No recent activity yet</p>
              <p className="text-gray-500 text-xs mt-1">Be the first to stake!</p>
            </div>
          ) : (
            activities.map((item, index) => (
              <a
                key={item.signature}
                href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 px-3 bg-orange-500/5 rounded-lg hover:bg-orange-500/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.type === "stake" ? "🍊" : item.type === "claim" ? "🧃" : "📤"}
                  </span>
                  <div>
                    <span className="font-mono text-sm">{item.address}</span>
                    <span className="text-gray-500 text-xs ml-2">{item.timeAgo}</span>
                  </div>
                </div>
                <span className={`font-bold text-sm ${
                  item.type === "stake" ? "text-orange-400" : 
                  item.type === "claim" ? "text-green-400" : "text-yellow-400"
                }`}>
                  {item.type === "stake" ? "Staked" : item.type === "claim" ? "Claimed" : "Unstaked"}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

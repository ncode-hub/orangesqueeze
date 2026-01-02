"use client";

import { Sprout } from "lucide-react";

interface GrowthTrackerProps {
  stakedAmount: number;
}

const stages = [
  { name: "Pulp", threshold: 300000, emoji: "🍊" },
  { name: "Seedling", threshold: 1000000, emoji: "🌱" },
  { name: "Blooming", threshold: 5000000, emoji: "🌸" },
  { name: "Fruiting", threshold: 10000000, emoji: "🍊" },
  { name: "Golden Grove", threshold: 20000000, emoji: "👑" },
];

export default function GrowthTracker({ stakedAmount }: GrowthTrackerProps) {
  const getCurrentStage = () => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stakedAmount >= stages[i].threshold) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIndex = getCurrentStage();
  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1];

  const getProgressToNextLevel = () => {
    if (!nextStage) return 100;
    const currentThreshold = currentStage.threshold;
    const nextThreshold = nextStage.threshold;
    const progress = ((stakedAmount - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progressPercent = getProgressToNextLevel();

  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center gap-2 mb-4">
        <Sprout className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold">Growth Tracker</h2>
      </div>

      {/* Circle Progress */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-orange-900/30"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#orangeGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={352}
              strokeDashoffset={352 - (352 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">{currentStage.emoji}</span>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-orange-400 font-bold">{currentStage.name}</div>
          <div className="text-gray-400 text-sm">Stage {currentStageIndex + 1} of {stages.length}</div>
        </div>
      </div>

      {/* Progress Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progress to next level</span>
          <span className="text-orange-400 text-sm">~{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">{currentStage.name}</span>
          <span className="text-gray-500 text-sm">
            {(stakedAmount / 1000000).toFixed(1)}M / {nextStage ? (nextStage.threshold / 1000000).toFixed(0) + "M" : "MAX"}
          </span>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="flex items-center justify-between gap-1">
        {stages.map((stage, index) => {
          const isReached = stakedAmount >= stage.threshold;
          const isCurrent = index === currentStageIndex;
          return (
            <div
              key={stage.name}
              className={`flex-1 text-center p-2 rounded-lg transition-all ${
                isReached
                  ? "bg-orange-500/30 border border-orange-500/50"
                  : "bg-orange-900/20 border border-orange-900/30"
              } ${isCurrent ? "ring-2 ring-orange-500" : ""}`}
            >
              <div className="text-xs font-bold mb-1">
                {(stage.threshold / 1000000).toFixed(0)}M
              </div>
              <div className="text-[10px] text-gray-400 truncate">{stage.name}</div>
            </div>
          );
        })}
      </div>

      {/* Stage dots */}
      <div className="flex justify-center gap-2 mt-4">
        {stages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index <= currentStageIndex ? "bg-orange-500" : "bg-orange-900/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

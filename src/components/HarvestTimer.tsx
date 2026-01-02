"use client";

import { useState, useEffect } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { usePoolStats } from "@/hooks/useStaking";

interface HarvestTimerProps {
  pendingRewards: number;
}

export default function HarvestTimer({ pendingRewards }: HarvestTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [cycleProgress, setCycleProgress] = useState(0);
  const poolStats = usePoolStats();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // 10-minute cycle - calculate time until next 10-minute mark
      const currentCycleMinute = minutes % 10;
      const minutesLeft = 9 - currentCycleMinute;
      const secondsLeft = 59 - seconds;
      
      setTimeLeft({ minutes: minutesLeft, seconds: secondsLeft });
      
      // Calculate cycle progress (0-100%)
      const totalSecondsInCycle = 10 * 60;
      const elapsedSeconds = (currentCycleMinute * 60) + seconds;
      setCycleProgress((elapsedSeconds / totalSecondsInCycle) * 100);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold">Harvest Timer</h2>
      </div>

      {/* Next Distribution */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mb-3">
          <RefreshCw className="w-3 h-3" />
          <span>Next Distribution</span>
        </div>

        <div className="flex justify-center gap-3">
          <div className="bg-orange-500/20 rounded-xl px-4 py-3 min-w-[70px]">
            <div className="text-3xl font-bold text-orange-400">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-400">Minutes</div>
          </div>
          <div className="bg-orange-500/20 rounded-xl px-4 py-3 min-w-[70px]">
            <div className="text-3xl font-bold text-orange-400">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-400">Seconds</div>
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-3">
          Rewards distributed every 10 minutes
        </p>
      </div>

      {/* Cycle Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <RefreshCw className="w-3 h-3" />
            <span>Cycle Progress</span>
          </div>
          <span className="text-orange-400 text-sm font-bold">
            {cycleProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-orange-900/30 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-600 to-orange-400 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${cycleProgress}%` }}
          />
        </div>
      </div>

      {/* Pool Info */}
      <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Reward Vault</span>
          <span className="text-orange-400 font-bold">{poolStats.rewardVaultBalance} SOL</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Your Pending</span>
          <span className="text-green-400 font-bold">{pendingRewards.toFixed(4)} SOL</span>
        </div>
      </div>
    </div>
  );
}

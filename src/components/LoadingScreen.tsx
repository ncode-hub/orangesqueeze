"use client";

import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {/* Pulsing orange circle */}
        <div className="w-24 h-24 rounded-full bg-orange-500/20 animate-ping absolute inset-0" />
        <div className="w-24 h-24 rounded-full bg-orange-500/30 flex items-center justify-center relative">
          <span className="text-5xl animate-bounce">🍊</span>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2">
        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
        <span className="text-gray-400">{message}</span>
      </div>
    </div>
  );
}

// Skeleton components for different sections
export function CardSkeleton() {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border animate-pulse">
      <div className="h-4 bg-orange-500/20 rounded w-1/3 mb-4" />
      <div className="h-8 bg-orange-500/20 rounded w-2/3 mb-2" />
      <div className="h-3 bg-orange-500/10 rounded w-1/2" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2 px-3 bg-orange-500/5 rounded-lg animate-pulse">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-orange-500/20 rounded w-24 mb-1" />
            <div className="h-3 bg-orange-500/10 rounded w-16" />
          </div>
          <div className="h-4 bg-orange-500/20 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Title skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-10 bg-orange-500/20 rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-orange-500/10 rounded w-64 mx-auto" />
        </div>
        
        {/* Stats skeleton */}
        <StatsSkeleton />
        
        {/* Content skeleton */}
        <div className="mt-8 bg-black/40 rounded-2xl p-6 orange-border animate-pulse">
          <div className="h-6 bg-orange-500/20 rounded w-32 mb-6" />
          <ActivitySkeleton />
        </div>
      </div>
    </div>
  );
}

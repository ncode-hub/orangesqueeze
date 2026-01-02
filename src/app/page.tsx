"use client";

import Link from "next/link";
import { Droplets, Clock, TrendingUp, Zap, Shield, Gift } from "lucide-react";
import { usePoolStats } from "@/hooks/useStaking";

export default function Home() {
  const poolStats = usePoolStats();
  
  // Format total staked for display
  const formatTotalStaked = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ""));
    if (isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(0);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="text-8xl mb-6 float">🍊</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Squeeze Your $ORANGE</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Stake your $ORANGE tokens and earn juicy rewards. 
            Watch your grove grow with every epoch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stake"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105 pulse-orange"
            >
              Start Squeezing
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-transparent border-2 border-orange-500 hover:bg-orange-500/20 rounded-xl font-bold text-lg transition-all"
            >
              Learn More
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400">
                {poolStats.isLoading ? "..." : formatTotalStaked(poolStats.totalStaked)}
              </div>
              <div className="text-gray-400">Total Squeezed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400">
                {poolStats.isLoading ? "..." : poolStats.rewardVaultBalance + " SOL"}
              </div>
              <div className="text-gray-400">Reward Pool</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400">
                {poolStats.isLoading ? "..." : poolStats.totalStakers}
              </div>
              <div className="text-gray-400">Growers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            Why Choose ORANGE?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            The juiciest staking experience on Solana. Zero protocol fees, real yields.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Droplets className="w-8 h-8 text-orange-400" />}
              title="Real Yield"
              description="Earn real rewards from protocol fees. No inflation, just pure juice."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-orange-400" />}
              title="24h Epochs"
              description="Rewards calculated and distributed every 24 hours. Watch your grove grow daily."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-orange-400" />}
              title="Growth Tracker"
              description="Track your staking progress with our visual growth meter."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-orange-400" />}
              title="Instant Unstake"
              description="Need your tokens? Unstake instantly with a small fee."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-orange-400" />}
              title="0% Protocol Fee"
              description="100% of staking rewards go to you. We take nothing."
            />
            <FeatureCard
              icon={<Gift className="w-8 h-8 text-orange-400" />}
              title="Juice Rewards"
              description="Harvest your juice rewards anytime. They're always fresh."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-orange-900/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Three simple steps to start growing your grove
          </p>
          
          <div className="space-y-8">
            <StepCard
              number={1}
              title="Connect Your Wallet"
              description="Connect your Solana wallet (Phantom, Solflare, etc.) to get started."
            />
            <StepCard
              number={2}
              title="Squeeze Your $ORANGE"
              description="Deposit your $ORANGE tokens into the staking contract. Your grove starts growing immediately."
            />
            <StepCard
              number={3}
              title="Harvest Your Juice"
              description="Watch the harvest timer and collect your rewards at the end of each epoch."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 rounded-3xl p-12 orange-border">
            <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Grove?</h2>
            <p className="text-gray-300 mb-8">
              Join thousands of growers earning juicy rewards on Solana.
            </p>
            <Link
              href="/stake"
              className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Squeezing Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-orange-500/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-2xl">🍊</span>
            <span className="font-bold gradient-text">ORANGE</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 ORANGE Staking. Built on Solana.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border card-hover">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

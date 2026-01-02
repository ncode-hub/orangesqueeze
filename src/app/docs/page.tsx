"use client";

import { Book, Droplets, Clock, Shield, Zap, HelpCircle } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Documentation</h1>
          <p className="text-gray-400">
            Everything you need to know about ORANGE staking
          </p>
        </div>

        <div className="space-y-8">
          <DocSection
            icon={<Book className="w-6 h-6 text-orange-400" />}
            title="What is ORANGE?"
            content={`
              ORANGE is a staking protocol built on Solana that allows $ORANGE token holders 
              to earn real yield from protocol fees. By "squeezing" your tokens, you contribute 
              to the grove and earn juicy rewards every epoch.
              
              Unlike inflationary staking mechanisms, ORANGE provides real yield - meaning your 
              rewards come from actual protocol revenue, not newly minted tokens.
            `}
          />

          <DocSection
            icon={<Droplets className="w-6 h-6 text-orange-400" />}
            title="How Squeezing Works"
            content={`
              1. **Connect your wallet** - Use Phantom, Solflare, or any compatible Solana wallet
              2. **Squeeze your $ORANGE** - Deposit your tokens into the staking contract
              3. **Receive st$ORANGE** - Get staked ORANGE tokens representing your position
              4. **Earn juice** - Accumulate rewards every epoch (24 hours)
              5. **Harvest anytime** - Claim your juice rewards whenever you want
              
              Your st$ORANGE tokens represent your share of the total staked pool. As rewards 
              accumulate, the value of st$ORANGE relative to $ORANGE increases.
            `}
          />

          <DocSection
            icon={<Clock className="w-6 h-6 text-orange-400" />}
            title="Epochs & Rewards"
            content={`
              **Epoch Duration:** 24 hours (resets at 00:00 UTC)
              
              Rewards are calculated at the end of each epoch based on:
              - Your share of the total staked pool
              - Protocol revenue generated during the epoch
              
              **Reward Formula:**
              \`Your Rewards = (Your Stake / Total Staked) × Epoch Revenue\`
              
              Rewards accumulate automatically and can be harvested at any time.
            `}
          />

          <DocSection
            icon={<Zap className="w-6 h-6 text-orange-400" />}
            title="Instant Unsqueeze"
            content={`
              Need your tokens back immediately? Use Instant Unsqueeze!
              
              **Standard Unsqueeze:** Free, but you must wait until the end of the current epoch
              
              **Instant Unsqueeze:** 1% fee, get your tokens immediately
              
              The 1% fee goes back to the staking pool, benefiting all other stakers.
            `}
          />

          <DocSection
            icon={<Shield className="w-6 h-6 text-orange-400" />}
            title="Security"
            content={`
              **Smart Contract:** Our staking contract is built with security as the top priority.
              
              Key security features:
              - Non-custodial: You always maintain control of your tokens
              - Open source: Contract code is publicly verifiable
              - No admin keys: Contract is immutable after deployment
              - Audited: Professional security audit completed
              
              **Program ID:** \`DummyOrangeProgramID111111111111111111111111\`
            `}
          />

          <DocSection
            icon={<HelpCircle className="w-6 h-6 text-orange-400" />}
            title="FAQ"
            content={`
              **Q: What is the minimum stake amount?**
              A: There is no minimum. You can squeeze any amount of $ORANGE.
              
              **Q: Are there any protocol fees?**
              A: No! ORANGE takes 0% protocol fee. 100% of rewards go to stakers.
              
              **Q: How often can I harvest?**
              A: You can harvest your juice rewards at any time.
              
              **Q: Is my stake locked?**
              A: No. You can unsqueeze at any time. Instant unsqueeze has a 1% fee.
              
              **Q: Where do rewards come from?**
              A: Rewards come from real protocol revenue, not inflation.
            `}
          />
        </div>

        {/* Contract Info */}
        <div className="mt-12 bg-black/40 rounded-2xl p-6 orange-border">
          <h2 className="text-xl font-bold mb-4">Contract Information</h2>
          <div className="space-y-3">
            <InfoRow label="Network" value="Solana Mainnet" />
            <InfoRow label="Token" value="$ORANGE" />
            <InfoRow label="Staked Token" value="st$ORANGE" />
            <InfoRow label="Program ID" value="DummyOrange..." copyable />
            <InfoRow label="Protocol Fee" value="0%" />
            <InfoRow label="Instant Unstake Fee" value="1%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocSection({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="text-gray-300 whitespace-pre-line leading-relaxed">
        {content.trim()}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-orange-500/20 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={`font-mono ${copyable ? "text-orange-400" : ""}`}>
        {value}
      </span>
    </div>
  );
}

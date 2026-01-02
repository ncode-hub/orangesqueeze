"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is ORANGE?",
    answer:
      "ORANGE is a staking protocol built on Solana that allows $ORANGE token holders to earn real yield from trading fees. By squeezing your tokens, you contribute to the grove and earn juicy rewards every 10 minutes.",
  },
  {
    question: "How do rewards work?",
    answer:
      "Rewards come from actual trading activity on pump.fun, not from inflation. Creator fees are distributed to stakers based on their share of the total squeezed pool. Higher trading volume means higher rewards!",
  },
  {
    question: "What is the minimum amount to squeeze?",
    answer:
      "The minimum amount to squeeze is 300,000 $ORANGE tokens. This helps ensure meaningful participation in the grove.",
  },
  {
    question: "Are my tokens locked when I squeeze?",
    answer:
      "No! There are no lockups in ORANGE. You can unsqueeze your tokens at any time. If you need instant access, you can use the instant unsqueeze feature with a small 1% fee.",
  },
  {
    question: "How often are rewards distributed?",
    answer:
      "Rewards are distributed every 10 minutes (each epoch). You can harvest your juice rewards at any time after they accumulate.",
  },
  {
    question: "What is Variable APY?",
    answer:
      "The APY in ORANGE is variable because it depends on trading volume and creator fee distributions. Higher trading activity on pump.fun means more fees distributed to stakers, resulting in higher APY.",
  },
  {
    question: "What are the growth stages?",
    answer:
      "As you squeeze more tokens, your grove grows through 5 stages: Pulp (300K), Seedling (1M), Blooming (5M), Fruiting (10M), and Golden Grove (20M). Each stage represents your commitment to the grove!",
  },
  {
    question: "Is there a protocol fee?",
    answer:
      "ORANGE takes 0% protocol fee on staking rewards. 100% of the creator fees go directly to stakers. The only fee is a 1% fee on instant unsqueeze.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "ORANGE supports all major Solana wallets including Phantom, Solflare, Backpack, and any wallet compatible with the Solana Wallet Adapter.",
  },
  {
    question: "How do I see my position on the leaderboard?",
    answer:
      "Visit the Community page to see the full leaderboard of growers ranked by their squeezed amount. You can also see recent activity from other community members.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400">
            Everything you need to know about squeezing $ORANGE
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-black/40 rounded-2xl orange-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-orange-500/5 transition-all"
              >
                <span className="font-bold pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-orange-400 transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-black/40 rounded-2xl p-8 orange-border text-center">
          <div className="text-4xl mb-4">🍊</div>
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Join our community and ask directly!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold transition-all"
            >
              Join Discord
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-transparent border-2 border-orange-500 hover:bg-orange-500/20 rounded-xl font-bold transition-all"
            >
              Follow Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

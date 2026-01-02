"use client";

interface NutritionFactsProps {
  stakedAmount: number;
  pendingRewards: number;
}

export default function NutritionFacts({
  stakedAmount,
  pendingRewards,
}: NutritionFactsProps) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 orange-border">
      <div className="border-b-8 border-orange-500 pb-2 mb-4">
        <h2 className="text-xl font-black">Nutrition Facts</h2>
        <p className="text-gray-400 text-sm">Your Daily Grove Values</p>
      </div>

      <div className="space-y-0">
        <NutritionRow
          label="Serving Size"
          value="1 Wallet"
          bold
          border
        />
        <NutritionRow
          label="Vitamin C(itrus)"
          sublabel="Based on Volume"
          value="Variable"
        />
        <NutritionRow
          label="Pulp Content"
          sublabel="Tokens Squeezed"
          value={stakedAmount > 0 ? (stakedAmount / 1000000).toFixed(2) + "M" : "0"}
        />
        <NutritionRow
          label="Fresh Juice"
          sublabel="Ready to Harvest"
          value={pendingRewards.toFixed(4) + " SOL"}
          highlight
        />
        <NutritionRow
          label="Zest Level"
          sublabel="Staking Power"
          value={stakedAmount > 5000000 ? "High" : stakedAmount > 1000000 ? "Medium" : "Low"}
        />
        <NutritionRow
          label="Sweetness"
          sublabel="APY Estimate"
          value="~12.5%"
          highlight
        />
      </div>

      <div className="mt-4 pt-4 border-t border-orange-500/30">
        <p className="text-gray-500 text-xs">
          * Percent Daily Values are based on your grove activity. 
          Your daily values may be higher or lower depending on trading volume.
        </p>
      </div>
    </div>
  );
}

function NutritionRow({
  label,
  sublabel,
  value,
  bold,
  border,
  highlight,
}: {
  label: string;
  sublabel?: string;
  value: string;
  bold?: boolean;
  border?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        border ? "border-b-4 border-orange-500" : "border-b border-orange-500/20"
      }`}
    >
      <div>
        <span className={bold ? "font-bold" : ""}>{label}</span>
        {sublabel && (
          <span className="text-gray-500 text-xs ml-2">{sublabel}</span>
        )}
      </div>
      <span className={`${highlight ? "text-orange-400" : ""} ${bold ? "font-bold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

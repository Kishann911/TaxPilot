"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/engine/formatters";
import { TrendingUp } from "lucide-react";

interface BreakEvenProps {
  grossSalary: number;
  currentOldDeductions: number;
  currentSavings: number;
  recommended: "new" | "old";
}

export function BreakEvenRadar({
  grossSalary,
  currentOldDeductions,
  currentSavings,
  recommended,
}: BreakEvenProps) {
  // Approximate break-even threshold in AY 2026-27: around 3.75L - 4.25L depending on gross
  const estimatedBreakEven = Math.max(375000, Math.min(650000, Math.round((grossSalary * 0.18) / 10000) * 10000));
  const [hypoDeductions, setHypoDeductions] = useState<number>(currentOldDeductions);

  const delta = hypoDeductions - estimatedBreakEven;
  const isOldBeneficial = hypoDeductions >= estimatedBreakEven;

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm interactive-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border mb-1.5">
            <TrendingUp size={12} className="text-primary" /> Statutory Break-Even Radar
          </div>
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">Regime Crossover &amp; Investment Optimizer</h3>
          <p className="text-xs text-muted-foreground">
            Identify the exact Chapter VI-A investment threshold where Old Regime beats New Regime for your salary.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block font-medium">Estimated Break-Even Deductions</span>
          <span className="text-xl font-mono font-bold text-primary tabular-nums">{formatINR(estimatedBreakEven)}</span>
        </div>
      </div>

      {/* Dynamic Range Slider with Micro-Interaction */}
      <div className="space-y-2.5 pt-2">
        <div className="flex justify-between text-xs text-card-foreground font-medium">
          <span>Hypothetical Deductions (80C + 80D + 24b + HRA):</span>
          <span className="font-mono font-bold text-foreground tabular-nums">{formatINR(hypoDeductions)}</span>
        </div>
        <input
          type="range"
          min="50000"
          max="800000"
          step="10000"
          value={hypoDeductions}
          onChange={(e) => setHypoDeductions(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
          <span>₹50,000 (Std Ded only)</span>
          <span className="text-primary font-semibold">Break-even: {formatINR(estimatedBreakEven)}</span>
          <span>₹8,00,000 (Heavy)</span>
        </div>
      </div>

      {/* Verdict Callout */}
      <div className={`mt-5 p-4 rounded-lg border text-xs flex items-center justify-between transition-all ${isOldBeneficial ? "bg-accent/40 border-accent text-accent-foreground" : "bg-muted/70 border-border text-foreground"}`}>
        <div>
          <span className="font-bold block text-sm mb-0.5">
            {isOldBeneficial ? "Old Regime Is Favorable" : "New Regime Is Favorable"}
          </span>
          <span className="text-muted-foreground leading-relaxed">
            {isOldBeneficial
              ? `Your deductions exceed the ${formatINR(estimatedBreakEven)} crossover mark by ${formatINR(delta)}. Old Regime saves tax.`
              : `You need ${formatINR(Math.abs(delta))} more in deductions before the Old Regime becomes more advantageous.`}
          </span>
        </div>
        <div className="text-right font-mono font-bold text-xs shrink-0 ml-4">
          <span className={`px-3 py-1.5 rounded-md border ${isOldBeneficial ? "bg-card text-primary border-primary/40" : "bg-primary text-primary-foreground border-primary"}`}>
            {isOldBeneficial ? "OPT OLD REGIME" : "STAY IN NEW REGIME"}
          </span>
        </div>
      </div>
    </div>
  );
}

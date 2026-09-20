"use client";

import React, { useState } from "react";
import { HelpCircle, FileCheck2, ChevronRight, Sparkles } from "lucide-react";

export function FormWizard() {
  const [incomeType, setIncomeType] = useState<"salary" | "multiple_hp">("salary");
  const [hasCapitalGains, setHasCapitalGains] = useState<"no" | "yes">("no");
  const [hasBusiness, setHasBusiness] = useState<"no" | "presumptive" | "full">("no");
  const [hasForeignAssets, setHasForeignAssets] = useState<"no" | "yes">("no");

  let formName = "ITR-1 (Sahaj)";
  let reason = "Salaried individuals with income up to ₹50 Lakhs and no capital gains.";
  let badgeColor = "bg-primary/20 text-primary border-primary/40";

  if (hasForeignAssets === "yes") {
    formName = "ITR-2 / ITR-3 (Schedule FA)";
    reason = "Mandatory disclosure in Schedule FA for individuals holding foreign bank accounts, US stocks, or RSUs.";
    badgeColor = "bg-destructive/15 text-destructive border-destructive/30";
  } else if (hasBusiness === "full") {
    formName = "ITR-3";
    reason = "Taxpayers with full business or professional income requiring maintenance of books of account and P&L statements.";
    badgeColor = "bg-accent/40 text-accent-foreground border-border";
  } else if (hasBusiness === "presumptive") {
    formName = "ITR-4 (Sugam)";
    reason = "Small businesses and freelance professionals opting for presumptive taxation u/s 44AD / 44ADA.";
    badgeColor = "bg-primary/20 text-primary border-primary/40";
  } else if (hasCapitalGains === "yes" || incomeType === "multiple_hp") {
    formName = "ITR-2";
    reason = "Salaried individuals with Capital Gains (stocks, mutual funds, crypto, property) or multiple house properties.";
    badgeColor = "bg-primary/20 text-primary border-primary/40";
  }

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm interactive-card">
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border mb-1.5">
          <HelpCircle size={12} className="text-primary" /> Return Selector
        </div>
        <h3 className="text-lg font-bold text-card-foreground tracking-tight">Which ITR Form Should You File?</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Answer 4 quick questions to determine the exact statutory return form required by the Income Tax Department.</p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Q1 */}
        <div>
          <span className="font-semibold text-foreground block mb-2">1. What are your primary income sources?</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIncomeType("salary")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                incomeType === "salary"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Salary / Pension + 1 House Property
            </button>
            <button
              onClick={() => setIncomeType("multiple_hp")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                incomeType === "multiple_hp"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Multiple House Properties / Agricultural &gt; ₹5,000
            </button>
          </div>
        </div>

        {/* Q2 */}
        <div>
          <span className="font-semibold text-foreground block mb-2">2. Did you sell equities, mutual funds, crypto, or real estate?</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHasCapitalGains("no")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasCapitalGains === "no"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              No Capital Gains
            </button>
            <button
              onClick={() => setHasCapitalGains("yes")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasCapitalGains === "yes"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Yes, have STCG / LTCG / VDA Crypto
            </button>
          </div>
        </div>

        {/* Q3 */}
        <div>
          <span className="font-semibold text-foreground block mb-2">3. Do you have freelance, consulting, or business income?</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHasBusiness("no")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasBusiness === "no"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              No Business / Freelance Income
            </button>
            <button
              onClick={() => setHasBusiness("presumptive")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasBusiness === "presumptive"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Yes, Presumptive (44AD / 44ADA)
            </button>
            <button
              onClick={() => setHasBusiness("full")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasBusiness === "full"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Yes, Full Books (P&amp;L + Balance Sheet)
            </button>
          </div>
        </div>

        {/* Q4 */}
        <div>
          <span className="font-semibold text-foreground block mb-2">4. Do you hold Foreign Assets, Overseas Accounts, or US RSUs?</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHasForeignAssets("no")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasForeignAssets === "no"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              No Foreign Assets
            </button>
            <button
              onClick={() => setHasForeignAssets("yes")}
              className={`px-3 py-1.5 rounded-md border transition-all interactive-button ${
                hasForeignAssets === "yes"
                  ? "bg-accent text-accent-foreground border-primary/40 font-semibold shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Yes, hold RSUs / Foreign Accounts (Schedule FA)
            </button>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="mt-6 p-4 rounded-lg bg-muted/60 border border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Statutory Recommendation:</span>
          <div className="text-xl font-extrabold text-primary mt-0.5 flex items-center gap-2">
            <FileCheck2 size={20} className="text-primary" /> {formName}
          </div>
          <div className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">{reason}</div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border inline-flex items-center gap-1 ${badgeColor}`}>
            <Sparkles size={12} /> AY 2026-27 Compliant
          </span>
        </div>
      </div>
    </div>
  );
}

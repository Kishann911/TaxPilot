"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, Circle, CheckSquare, RotateCcw, Filter } from "lucide-react";

interface CheckItem {
  id: string;
  title: string;
  desc: string;
  category: "tds" | "ais" | "capital_gains" | "bank" | "filing";
  defaultChecked: boolean;
}

const INITIAL_CHECKS: CheckItem[] = [
  { id: "chk-1", title: "1. Reconcile Form 16 Part A TAN against 26AS", desc: "Ensure employer TAN matches exactly between Part A and Form 26AS to prevent TDS credit rejection.", category: "tds", defaultChecked: true },
  { id: "chk-2", title: "2. Verify AIS Feedback Status (Accept / Dispute)", desc: "Confirm that duplicate or erroneous AIS entries have submitted feedback before filing.", category: "ais", defaultChecked: true },
  { id: "chk-3", title: "3. Aggregate Multi-Broker Capital Gains Statements", desc: "Combine Tax P&L from Zerodha, Groww, Upstox into a single Section 111A and 112A schedule.", category: "capital_gains", defaultChecked: true },
  { id: "chk-4", title: "4. Disclose Savings & FD Interest in Schedule OS", desc: "All bank interest reported in AIS must appear in Schedule Other Sources even if TDS was not deducted.", category: "bank", defaultChecked: true },
  { id: "chk-5", title: "5. Schedule FA Disclosure for Foreign Assets / RSUs", desc: "Mandatory for anyone holding US stocks, RSUs (e.g. ESPP), or overseas bank accounts. Cannot use ITR-1.", category: "filing", defaultChecked: false },
  { id: "chk-6", title: "6. Validate Pre-Validated Bank Account for Refund", desc: "Ensure your active bank account is linked to your PAN and validated for electronic refund credit.", category: "bank", defaultChecked: true },
  { id: "chk-7", title: "7. File Form 10-IEA if Opting for Old Regime (Business)", desc: "Taxpayers with business or freelance income opting out of New Regime must submit Form 10-IEA prior to due date.", category: "filing", defaultChecked: false },
  { id: "chk-8", title: "8. Pay Self-Assessment Tax under Minor Head 300", desc: "Pay any balance tax via e-Pay Tax before clicking Submit on the portal.", category: "tds", defaultChecked: true },
  { id: "chk-9", title: "9. Verify AIS Dividend Reporting against 26AS 194", desc: "Ensure dividend income matches TDS u/s 194 deducted by depository and listed companies.", category: "ais", defaultChecked: true },
  { id: "chk-10", title: "10. E-Verify Return within 30 Days of Submission", desc: "E-verify via Aadhaar OTP, NetBanking, or digital signature to complete filing.", category: "filing", defaultChecked: true },
];

export function AuditChecklist() {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL_CHECKS.map((c) => [c.id, c.defaultChecked]))
  );
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "done">("all");

  const toggleCheck = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markAll = (val: boolean) => {
    setCheckedState(Object.fromEntries(INITIAL_CHECKS.map((c) => [c.id, val])));
  };

  const completedCount = Object.values(checkedState).filter(Boolean).length;
  const totalCount = INITIAL_CHECKS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const displayedChecks = useMemo(() => {
    return INITIAL_CHECKS.filter((item) => {
      const isChecked = !!checkedState[item.id];
      if (filterMode === "pending") return !isChecked;
      if (filterMode === "done") return isChecked;
      return true;
    });
  }, [checkedState, filterMode]);

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm interactive-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border mb-1.5">
            <CheckSquare size={12} className="text-primary" /> Statutory Readiness Audit
          </div>
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">Pre-Filing Compliance &amp; Reconciliation Audit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Review these 10 critical checks to prevent statutory defective notices (u/s 139(9)) from the Income Tax Department.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block font-medium">Compliance Score</span>
            <span className="text-sm font-bold font-mono text-primary tabular-nums">{completedCount} of {totalCount} Passed ({percentage}%)</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-muted border-2 border-primary flex items-center justify-center font-mono text-xs font-bold text-primary tabular-nums shadow-2xs">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <Filter size={12} /> View:
          </span>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 rounded-md transition-all ${filterMode === "all" ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterMode("pending")}
            className={`px-2.5 py-1 rounded-md transition-all ${filterMode === "pending" ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Pending ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilterMode("done")}
            className={`px-2.5 py-1 rounded-md transition-all ${filterMode === "done" ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll(true)}
            className="px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-medium transition-all interactive-button"
          >
            Check All
          </button>
          <button
            onClick={() => markAll(false)}
            className="px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-medium transition-all flex items-center gap-1 interactive-button"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Grid of Checks */}
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        {displayedChecks.map((item) => {
          const isChecked = !!checkedState[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                isChecked
                  ? "bg-accent/25 border-primary/40 text-card-foreground shadow-2xs"
                  : "bg-muted/30 border-border hover:border-muted-foreground/40 text-muted-foreground"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckCircle2 size={16} className="text-primary" />
                ) : (
                  <Circle size={16} className="text-muted-foreground/60" />
                )}
              </div>
              <div>
                <div className={`font-semibold ${isChecked ? "text-foreground" : "text-foreground/80"}`}>
                  {item.title}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

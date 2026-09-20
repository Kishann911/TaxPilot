"use client";

import React, { useState } from "react";
import { Check, X, Layers, Search } from "lucide-react";

export function DeductionsMatrix() {
  const [filter, setFilter] = useState("");

  const items = [
    {
      section: "Standard Deduction",
      purpose: "Salaried employees and pensioners u/s 16(ia) / 57(iia)",
      limit: "₹75,000 / ₹50,000",
      newRegime: "₹75,000",
      oldRegime: "₹50,000",
      newAllowed: true,
      oldAllowed: true,
    },
    {
      section: "Section 80CCD(2)",
      purpose: "Employer contribution to National Pension System (NPS)",
      limit: "14% Govt / 10% Pvt",
      newRegime: "Allowed (14%)",
      oldRegime: "Allowed (10%)",
      newAllowed: true,
      oldAllowed: true,
    },
    {
      section: "Section 80C",
      purpose: "EPF, PPF, ELSS, Life Insurance, Home Loan Principal",
      limit: "₹1,50,000",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 80CCD(1B)",
      purpose: "Voluntary individual contribution to NPS Tier-1",
      limit: "₹50,000",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 24(b)",
      purpose: "Interest on Home Loan (Self-Occupied Property)",
      limit: "₹2,00,000",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 80D",
      purpose: "Health Insurance Mediclaim (Self & Senior Parents)",
      limit: "Up to ₹1,00,000",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 80E",
      purpose: "Interest on Higher Education Loan for self, spouse, children",
      limit: "No Upper Cap (8 Yrs)",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 80TTA / 80TTB",
      purpose: "Savings interest (80TTA: ₹10k) / Senior deposit interest (80TTB: ₹50k)",
      limit: "₹10,00,0 / ₹50,000",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
    {
      section: "Section 10(13A)",
      purpose: "House Rent Allowance (HRA) statutory exemption",
      limit: "Least of 3 Rules",
      newRegime: "Not Allowed",
      oldRegime: "Allowed",
      newAllowed: false,
      oldAllowed: true,
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.section.toLowerCase().includes(filter.toLowerCase()) ||
      item.purpose.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm interactive-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border mb-1.5">
            <Layers size={12} className="text-primary" /> Chapter VI-A Comparison
          </div>
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">Deductions &amp; Exemptions Master Matrix</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Side-by-side comparison of Chapter VI-A deductions and statutory exemptions for AY 2026-27.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search deduction (e.g. 80C, NPS)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-input border border-border rounded-md text-xs text-foreground focus:outline-ring/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3 font-semibold">Section</th>
              <th className="p-3 font-semibold">Statutory Purpose &amp; Instruments</th>
              <th className="p-3 font-semibold font-mono">Max Limit</th>
              <th className="p-3 font-semibold">New Regime (115BAC)</th>
              <th className="p-3 font-semibold">Old Regime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                <td className="p-3 font-mono font-bold text-primary">{item.section}</td>
                <td className="p-3 text-card-foreground">{item.purpose}</td>
                <td className="p-3 font-mono text-muted-foreground">{item.limit}</td>
                <td className="p-3 font-semibold">
                  {item.newAllowed ? (
                    <span className="text-primary flex items-center gap-1">
                      <Check size={14} className="stroke-[2.5]" /> {item.newRegime}
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <X size={14} className="stroke-[2.5]" /> Not Allowed
                    </span>
                  )}
                </td>
                <td className="p-3 font-semibold">
                  {item.oldAllowed ? (
                    <span className="text-primary flex items-center gap-1">
                      <Check size={14} className="stroke-[2.5]" /> {item.oldRegime}
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <X size={14} className="stroke-[2.5]" /> Not Allowed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

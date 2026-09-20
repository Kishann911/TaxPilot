"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Copy, Check, EyeOff } from "lucide-react";

export function PrivacySandbox() {
  const sampleText = `FORM NO. 16 - PART B (Certificate u/s 203)
Assessment Year: 2026-27 | Financial Year: 2025-26
Employee Name: Vikram Aditya Sharma
PAN of Employee: ABCDE1234F
Aadhaar Number: 4532 8901 2345
Employer Name: ACME Tech India Private Limited
TAN of Employer: BLRA99887C
Gross Salary u/s 17(1): Rs. 24,00,000
Tax Deducted at Source (TDS): Rs. 2,65,000
Contact Email: vikram.aditya@acmetech.com | Mobile: +91 98765 43210
Bank Account: 50100234567890 (HDFC Bank)`;

  const [inputVal, setInputVal] = useState(sampleText);
  const [copied, setCopied] = useState(false);

  // Client-side regex scrubber
  const scrubPII = (text: string) => {
    let scrubbed = text;
    let count = 0;

    // PAN
    scrubbed = scrubbed.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, () => {
      count++;
      return "[REDACTED_PAN]";
    });
    // Aadhaar
    scrubbed = scrubbed.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, () => {
      count++;
      return "[REDACTED_AADHAAR]";
    });
    // TAN
    scrubbed = scrubbed.replace(/\b[A-Z]{4}[0-9]{5}[A-Z]\b/g, () => {
      count++;
      return "[REDACTED_TAN]";
    });
    // Email
    scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, () => {
      count++;
      return "[REDACTED_EMAIL]";
    });
    // Phone
    scrubbed = scrubbed.replace(/(?:\+91\s?)?[6-9]\d{4}\s?\d{5}\b/g, () => {
      count++;
      return "[REDACTED_PHONE]";
    });
    // Account Number
    scrubbed = scrubbed.replace(/\b\d{10,18}\b/g, () => {
      count++;
      return "[REDACTED_ACCOUNT]";
    });

    return { scrubbed, count };
  };

  const { scrubbed, count } = scrubPII(inputVal);

  const copyScrubbed = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(scrubbed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm interactive-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border mb-1.5">
            <Lock size={12} className="text-primary" /> Zero-Knowledge Client Scrubber
          </div>
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">Privacy Shield &amp; PII Redaction Sandbox</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Test TaxPilot&apos;s client-side privacy sanitizer that strips PAN, Aadhaar, TAN, accounts, and contact info before model inspection.
          </p>
        </div>
        <div>
          <span className="px-3 py-1.5 rounded-md bg-muted text-primary text-xs font-mono font-bold border border-border inline-flex items-center gap-1.5">
            <EyeOff size={13} /> {count} Identities Redacted · In-Browser Only
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <div className="flex justify-between items-center mb-2 font-sans">
            <span className="font-bold text-foreground">
              1. Raw Form 16 Text / AIS JSON (Contains PII):
            </span>
            <span className="text-[11px] text-muted-foreground">Editable Demo</span>
          </div>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={10}
            className="w-full p-3 bg-input border border-border rounded-lg text-foreground leading-relaxed outline-none focus:outline-ring/50 font-mono resize-y"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 font-sans">
            <span className="font-bold text-primary">
              2. Sanitized Structured Output (Zero PII):
            </span>
            <button
              onClick={copyScrubbed}
              className="text-[11px] font-sans text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border interactive-button"
            >
              {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy Sanitized"}
            </button>
          </div>
          <div className="w-full p-3 bg-muted/60 border border-border rounded-lg text-foreground leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto max-h-[225px] select-all">
            {scrubbed}
          </div>
        </div>
      </div>
    </div>
  );
}

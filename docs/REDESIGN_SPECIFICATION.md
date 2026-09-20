# 2. Frontend Redesign & UI/UX Specification

> **Next-Generation Visual Design System & User Experience Architecture**  
> *Target Aesthetic: Modern Dark Fintech (Linear / Stripe / Zerodha Console Grade)*  
> *Designed & Maintained by Kishan Ojha (`Kishann911/TaxPilot`)*

---

## 1. Visual Design Philosophy & Aesthetic

The redesigned TaxPilot frontend bridges the gap between **high-performance engineering** and **delightful financial consumer software**. Tax filing is inherently stressful and arithmetic-heavy; the interface must convey **absolute mathematical authority, trust, clarity, and speed**.

### Design Principles:
1. **Zero Clutter, High Signal:** Group complex statutory provisions into progressive disclosure tabs, preventing cognitive overload.
2. **Instant Feedback:** Every keystroke recalibrates both regimes in under 5 milliseconds with animated ledger transitions.
3. **Sovereign Privacy Visuals:** Prominently communicate client-side execution—no loading spinners that hint at server data transfers.
4. **Tabular Precision:** Every monetary amount rendered in monospace tabular numbers (`tabular-nums`) to facilitate side-by-side scanning.

---

## 2. Design Tokens & Color System

```css
:root {
  /* Surface & Background Colors */
  --bg-canvas: #07090E;                /* Deep obsidian background */
  --bg-surface: #0D111A;               /* Primary container surface */
  --bg-surface-elevated: #131926;      /* Elevated cards & interactive panels */
  --bg-surface-hover: #1A2336;         /* Hover state on cards */
  --bg-input: #0A0E17;                 /* Recessed input background */

  /* Border & Glassmorphism Gradients */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-focus: #06B6D4;             /* Cyan focus ring */
  --glass-glow: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12), transparent 70%);

  /* Brand & Statutory Semantic Tokens */
  --brand-emerald: #10B981;            /* New Regime Winner & Tax Refund */
  --brand-emerald-glow: rgba(16, 185, 129, 0.25);
  --brand-cyan: #06B6D4;               /* Slab Ledger & Navigation */
  --brand-indigo: #6366F1;             /* AI Co-Pilot & Automation */
  --brand-amber: #F59E0B;              /* Audit Warnings, SFT High Risk, Section 234 Interest */
  --brand-rose: #F43F5E;               /* Disallowed Deductions & Surcharge Cliffs */

  /* Text & Typography */
  --text-primary: #F8FAFC;             /* High contrast headers & numbers */
  --text-secondary: #94A3B8;           /* Descriptive labels & explanations */
  --text-tertiary: #64748B;            /* Footers, notes, placeholders */
  --font-sans: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 3. Core Page Sections & Structural Hierarchy

### 1. Sticky Statutory Status Bar
- **Purpose:** Anchors trust immediately by declaring exact statutory compliance for AY 2026-27 (FY 2025-26).
- **Features:** Live badge with pulse indicator: `● Pinned to AY 2026-27 · Finance (No.2) Act 2024 · 205+ Golden Tests Verified`.

### 2. Glassmorphic Navigation Header
- **Logo:** Clean vector SVG typography with dual-tone emerald accent.
- **Nav Links:** Quick scroll anchors (Tax Studio, Break-Even Radar, AIS SFT Directory, Deductions Matrix, Golden Tests, Privacy Shield, CLI).
- **Actions:**
  - One-click Theme Toggle (System / Dark / Light).
  - GitHub Stars counter.
  - Primary CTA: `⚡ Open Tax Studio`.

### 3. Hero Section & Interactive Terminal Simulator
- **Left Column:**
  - High-impact typography: `"Indian Tax Filing with Mathematical Certainty"`.
  - Subtitle highlighting the zero-LLM arithmetic separation.
  - One-click copy install command (`git clone ... && ./install.sh`).
  - Quick action buttons (Launch Studio / CLI Docs).
- **Right Column:**
  - Animated live terminal emulator rendering real-time `taxpilot compute income.json` output with color-coded syntax and live calculation receipts.
- **Metrics Ribbon:**
  - 4 high-impact counters: `205+ Golden Tests`, `104 Schema Rules`, `18 AIS SFT Codes`, `350,000+ Invariant Fuzz Cycles`.

### 4. Interactive Tax Studio (The Core Engine)
A dual-pane, desktop-optimized workspace:

```
+-----------------------------------------------------------------------------+
| PRESET BAR: [💼 Salaried ₹24L] [💻 Freelancer 44ADA] [👴 Senior Citizen FD] |
+------------------------------------+----------------------------------------+
| LEFT PANE: Smart Input Console     | RIGHT PANE: Real-time Verdict & Ledger |
|                                    |                                        |
| [Salary] [Gains] [Deductions] ...  | +------------------------------------+ |
|                                    | | VERDICT: NEW REGIME RECOMMENDED    | |
| Gross Salary:     [ ₹24,00,000 ]   | | ₹42,811 SAVINGS                    | |
| Exempt Allowances:[   ₹2,40,000 ]  | +------------------------------------+ |
| Professional Tax: [      ₹2,400 ]  |                                        |
| Freelance 44ADA:  [          ₹0 ]  | [NEW REGIME]        [OLD REGIME]       |
| Savings Interest: [     ₹14,500 ]  | Taxable: 25.06L     Taxable: 18.74L    |
| FD Interest:      [     ₹42,000 ]  | Slab Tax: 2.75L     Slab Tax: 3.13L    |
| Dividends:        [      ₹8,200 ]  | Cess: 11,552        Cess: 13,067       |
| Age Category:     [ Regular <60 ]  | -------------------------------------- |
|                                    | Total Tax: 3,00,350 Total Tax: 3,39,730|
| [Live 234A/B/C Interest Bar]       | Net: ₹720           Net: ₹39,730       |
| 234A: ₹0 | 234B: ₹0 | 234C: ₹0     |                                        |
|                                    | [📥 Export Filing Pack] [🖨️ Master Sheet]|
+------------------------------------+----------------------------------------+
```

### 5. Novel Visual Analytics: Regime Break-Even Radar
- **Concept:** A dynamic chart plotting total tax liability across income levels under both regimes.
- **Break-Even Line:** Automatically computes the exact rupee threshold of Chapter VI-A deductions at which the Old Regime becomes more advantageous than the New Regime for the taxpayer's specific income mix.
- **Interactive Slider:** Allows the user to slide hypothetical deduction figures and watch the verdict flip in real-time.

### 6. Interactive AIS SFT Intelligence Classifier
- Searchable directory of 18 statutory Statement of Financial Transaction (SFT) reporting codes.
- Category filters (Banking, Equities, Real Estate, TDS, Crypto).
- Highlights reporting threshold, target ITR schedule, and audit mismatch risk (Low, Medium, High).

### 7. Pre-Filing Audit & Reconciliation Checklist
- 10-point CA-grade compliance verification list.
- Interactive checkboxes with a live SVG circular progress ring (`8/10 Checks Completed - Ready to File`).

### 8. ITR Form Decision Wizard
- 4-step progressive disclosure questionnaire.
- Dynamically resolves to `ITR-1 (Sahaj)`, `ITR-2`, `ITR-3`, or `ITR-4 (Sugam)` with statutory justification.

### 9. Privacy Shield & Zero-Knowledge Sandbox
- Interactive client-side PII scrubbing simulator.
- Live counters for scrubbed PANs, Aadhaar numbers, TANs, emails, phone numbers, and bank accounts.

---

## 4. Accessibility & Animation Standards

- **WCAG 2.1 AA Compliance:** Minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text across all themes.
- **Reduced Motion:** Full support for `prefers-reduced-motion: reduce`.
- **Keyboard Navigation:** Full tab order navigation with distinct cyan focus rings (`outline: 2px solid var(--brand-cyan)`).
- **Tabular Numerics:** All currency numbers rendered with `font-variant-numeric: tabular-nums` to prevent layout shift during calculation updates.

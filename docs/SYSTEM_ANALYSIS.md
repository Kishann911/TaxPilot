# 1. System Architecture Analysis & Codebase Audit

> **TaxPilot Comprehensive Codebase & Statutory Engine Review**  
> *Assessment Year 2026-27 (Financial Year 2025-26)*  
> *Maintained by Kishan Ojha (`Kishann911/TaxPilot`)*

---

## 1. Executive Summary

TaxPilot is an open-source, deterministic Indian Income Tax (ITR) calculation ecosystem for AY 2026-27. Unlike generic AI wrappers that ask an LLM to hallucinate tax arithmetic, TaxPilot enforces a strict boundary:
- **LLMs / Agent Plugins:** Ingest documents (Form 16, AIS, 26AS, broker P&L), conduct deduction interviews, and produce structured JSON fixtures.
- **Deterministic Engine:** Calculates every rupee of slab tax, rebate u/s 87A, surcharge, 4% cess, and statutory interest u/s 234A/B/C/F.
- **Taxpayer:** Retains full sovereign control to inspect calculations, verify receipts, pay advance tax, and e-verify on incometax.gov.in.

---

## 2. Complete Codebase Structure & Component Map

The repository is organized into five distinct layers:

```
TaxPilot/
├── taxpilot/                      # Core Python Engine & CLI Package
│   ├── core/
│   │   ├── tax_engine.py         # 906 lines: Deterministic AY 2026-27 computation core
│   │   ├── validate_income.py    # 440 lines: Statutory schema validator & invariant guard
│   │   └── fuzz_engine.py        # 560 lines: Seeded property-based invariant fuzzer
│   ├── parsers/
│   │   ├── decrypt_ais.py        # AES-128/256 PDF/JSON decryption utility
│   │   ├── blind_copy.py         # Zero-knowledge key/shape extraction without identities
│   │   ├── ais_schema.py         # AIS section & table structure inspector
│   │   ├── extract_tis.py        # Taxpayer Information Summary aggregator
│   │   ├── parse_26as.py         # Form 26AS HTML/JSON parser
│   │   └── unzip_26as.py         # Password-protected 26AS archive unpacker
│   ├── security/
│   │   └── redactor.py           # Client-side PII regex sanitizer (PAN, Aadhaar, TAN, Accounts)
│   └── cli/
│       └── main.py               # Unified CLI: compute, validate, selftest, fuzz, tis, decrypt
│
├── skills/                        # Universal Agent Skills Ecosystem
│   └── taxpilot/
│       ├── SKILL.md              # Open standard Agent Skill definition
│       ├── scripts/              # Standalone test fixtures & automation scripts
│       │   ├── test_tax_engine.py       # 51 Golden statutory test cases
│       │   ├── test_validate_income.py  # 104 Schema validation test cases
│       │   └── test_extraction.py       # 50 Extraction & redaction test cases
│       ├── references/           # Statutory tax guides, schedules, deduction checklists
│       └── assets/               # Sample JSON inputs (e.g. example-income.json)
│
├── .claude-plugin/               # Native marketplace integration for Claude Code
├── .codex-plugin/                # Plugin definition for OpenAI Codex
├── .agents/                      # Gemini / Antigravity workspace integration
│
├── automation/                   # Isolated Docker container runner & repo sync daemon
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── scripts/
│
└── docs/                         # Legacy Single-Page Static Frontend
    ├── index.html                # 1,136 lines monolithic HTML
    ├── app.js                    # 1,232 lines vanilla JS calculation & UI logic
    ├── styles.css                # 1,232 lines custom CSS
    └── assets/                   # SVG logos, flow diagrams, and social graphics
```

---

## 3. Statutory Engine Verification: Python vs Legacy JavaScript

A rigorous comparative audit was conducted between the authoritative Python engine (`taxpilot/core/tax_engine.py`) and the browser JavaScript implementation (`docs/app.js`).

While both implementations correctly handle standard income slabs for AY 2026-27 under the New Regime (0–4L @ 0%, 4–8L @ 5%, 8–12L @ 10%, 12–16L @ 15%, 16–20L @ 20%, 20–24L @ 25%, >24L @ 30%) and standard deductions (₹75,000 New / ₹50,000 Old), **the audit uncovered 10 critical statutory discrepancies and bugs in the legacy JavaScript code:**

### Discrepancy 1: Section 234B Calendar Year Rollover Bug (`docs/app.js:183–184`)
- **Python:** Accurately counts months between FY end (31 March 2026) and filing date across calendar year boundaries using `_months_between()`.
- **Legacy JS:** Computes `monthsB = Math.max(1, filingMonth - 3)` where `filingMonth = date.getMonth() + 1`.
- **Impact:** If a taxpayer files an updated or belated return in **January, February, or March 2027**, `filingMonth` is 1, 2, or 3, causing `monthsB` to evaluate to `Math.max(1, -2) = 1` month instead of 10, 11, or 12 months! This undercharges statutory interest by up to **90%**.

### Discrepancy 2: Unexhausted Basic Exemption Absorption Against Capital Gains (`docs/app.js:135–137`)
- **Python:** Implements provisos to Sections 111A, 112, and 112A allowing resident individuals to absorb unexhausted basic exemption into capital gains (testing all permutation orders for optimal tax outcome).
- **Legacy JS:** Directly multiplies rate by gain without checking basic exemption.
- **Impact:** A resident with ₹0 salary and ₹3,00,000 equity STCG pays ₹0 tax under Indian statutory law (absorbed by ₹4L / ₹2.5L exemption). Legacy JS erroneously demands **₹60,000** in tax!

### Discrepancy 3: 0% Surcharge Loophole on VDA / Crypto above ₹2 Crore (`docs/app.js:147, 300, 304`)
- **Python:** Explicitly includes VDA crypto gains in the surcharged base at 25% (New) or 37% (Old).
- **Legacy JS:** Computes `surcharge = (cgTax * 0.15) + (slabTaxOnly * 0.25)`. `taxVdaNew` is in neither `cgTax` nor `slabTaxOnly`.
- **Impact:** High earners with substantial crypto gains pay **0% surcharge** on crypto profits above ₹2 Crore in the JS frontend.

### Discrepancy 4: Dividend Surcharge Cap Violation (`docs/app.js:147, 304`)
- **Python:** Strictly enforces the statutory 15% surcharge ceiling on dividend income u/s 115BB and First Schedule Part III.
- **Legacy JS:** Leaves dividend income inside `slabTaxOnly`, surcharging dividends at 25% or 37% above ₹2 Crore.
- **Impact:** Illegally overtaxes dividend income for high-net-worth taxpayers.

### Discrepancy 5: Missing Surcharge Marginal Relief in JS
- **Python:** Rigorously computes marginal relief at the ₹50L, ₹1Cr, ₹2Cr, and ₹5Cr cliffs (lines 540–571).
- **Legacy JS:** Omits marginal relief on surcharge completely.
- **Impact:** Taxpayers earning ₹50,10,000 suffer an immediate punitive tax cliff where an extra ₹10,000 of income costs ₹1,30,000+ in extra tax.

### Discrepancy 6: Section 87A Old Regime Qualifier Bug (`docs/app.js:282`)
- **Python:** Tests whether `total_income <= 500,000` (incorporating all heads).
- **Legacy JS:** Tests `taxableSlabIncomeOld <= 500000`.
- **Impact:** A taxpayer with ₹4,00,000 salary and ₹2,50,000 STCG has Total Income of ₹6,50,000 (> ₹5 Lakhs) and is statutory ineligible for 87A rebate. Legacy JS erroneously awards them a **₹12,500 rebate**!

### Discrepancy 7: Senior Citizen Section 207(2) Exemption Missing in JS
- **Python:** Section 207(2) waives advance tax and 234B/234C interest for resident senior citizens without business income.
- **Legacy JS:** Levies 234B and 234C interest on senior citizens regardless of income source.

### Discrepancy 8: Presumptive Taxation Section 234C Installment Violation (`docs/app.js:189–203`)
- **Python:** Presumptive professionals u/s 44AD / 44ADA are required to pay advance tax in a single 100% installment by 15 March (s. 234C(1)(b)).
- **Legacy JS:** Evaluates all 4 quarterly checkpoints (15%, 45%, 75%, 100%), charging unwarranted penalty interest on Q1–Q3 for freelance professionals.

### Discrepancy 9: Missing Belated Return Opt-Out Restriction (s. 115BAC(6))
- **Python:** If a return is filed past the statutory due date (e.g. after 31 July 2026), the taxpayer is legally barred from opting into the Old Regime. Python forces the verdict to the New Regime.
- **Legacy JS:** Allows opting into the Old Regime even when filed late.

### Discrepancy 10: Missing Rule 119A Interest Base Rounding
- **Python:** Applies Rule 119A, flooring every interest shortfall base down to a multiple of ₹100 (`_floor100`).
- **Legacy JS:** Computes interest on unrounded fractional rupees.

---

## 4. Current Web Frontend Limitations & UX Bottlenecks

1. **Dual-Implementation Maintenance Hazard:** Maintaining mathematical code in both Python and vanilla JavaScript creates constant synchronization divergence and statutory bugs.
2. **Dense, Overwhelming Single-Form UX:** The existing web studio displays 30+ input boxes in an intimidating wall of fields. First-time filers have no guidance on which fields apply to them.
3. **Lack of Visual Tax Analytics:** Users are presented only with numbers in tables. There are no visual waterfall charts, regime break-even curves, or visual deduction impact meters.
4. **No Direct Document Ingestion:** Users must manually locate line items on their Form 16 Part B, Zerodha Capital Gains sheet, or AIS and re-type them into the inputs.
5. **Monolithic Architecture:** A single 1,136-line `index.html` and 1,232-line `app.js` lacks modularity, component reusability, unit tests, and type safety.
6. **No Serverless Edge Capability:** The app cannot currently provide serverless API endpoints for programmatic tax calculations, PDF generation, or third-party webhooks.

---

## 5. Architectural Recommendation

To solve these deficiencies, TaxPilot transitions to a **modern, 100% serverless Next.js 16 (App Router) web application**:
1. **Single Source of Truth:** Port the Python statutory calculation core directly into a **type-safe TypeScript engine** (`src/lib/engine/taxEngine.ts`) validated by the exact same 51 Golden Tests.
2. **Fintech-Grade Visual Redesign:** Build a modern, responsive UI using Tailwind CSS v4, OKLCH tokens, Lucide icons, glassmorphic styling, and interactive visualizers.
3. **Client-Side Document Parsing:** Introduce a zero-knowledge drag-and-drop zone for Form 16 PDFs and AIS JSON files, processing documents entirely in-browser.
4. **100% Serverless Deployment:** Deployable to Vercel, Cloudflare Pages, or AWS with zero infrastructure cost, zero cold-starts, and zero maintenance.

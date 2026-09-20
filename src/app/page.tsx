"use client";

import React, { useState, useMemo, useEffect } from "react";
import { computeTax } from "@/lib/engine/taxEngine";
import { formatINR } from "@/lib/engine/formatters";
import type { TaxInputPayload, AgeCategory } from "@/lib/engine/types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Copy,
  Check,
  Sun,
  Moon,
  TrendingUp,
  FileText,
  HelpCircle,
  Terminal,
  Sparkles,
  Search,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { BreakEvenRadar } from "@/components/visualizers/BreakEvenRadar";
import { AuditChecklist } from "@/components/checklist/AuditChecklist";
import { FormWizard } from "@/components/wizard/FormWizard";
import { DeductionsMatrix } from "@/components/matrix/DeductionsMatrix";
import { PrivacySandbox } from "@/components/privacy/PrivacySandbox";

const AIS_SFT_CODES = [
  { code: "SFT-001", category: "banking", threshold: ">= ₹10,00,000", description: "Cash deposit in bank accounts (Aggregate)", schedule: "Schedule OS / Source Verification", risk: "Medium" },
  { code: "SFT-002", category: "banking", threshold: ">= ₹1,00,000", description: "Cash payment for credit card bills", schedule: "Verification / Income Source", risk: "High" },
  { code: "SFT-003", category: "banking", threshold: ">= ₹10,00,000", description: "Purchase of bank drafts / pay orders in cash", schedule: "Cash Flow Audit", risk: "High" },
  { code: "SFT-004", category: "banking", threshold: ">= ₹10,00,000", description: "Time deposit / Fixed Deposit receipts (cumulative)", schedule: "Schedule OS (Interest check)", risk: "Medium" },
  { code: "SFT-005", category: "banking", threshold: ">= ₹10,00,000", description: "Credit card payments via electronic modes", schedule: "Cash Flow Verification", risk: "Medium" },
  { code: "SFT-006", category: "equities", threshold: ">= ₹10,00,000", description: "Purchase / sale of mutual fund units", schedule: "Schedule CG (112A / STCG)", risk: "High" },
  { code: "SFT-008", category: "equities", threshold: ">= ₹10,00,000", description: "Purchase of bonds / debentures", schedule: "Schedule OS / CG", risk: "Medium" },
  { code: "SFT-009", category: "equities", threshold: ">= ₹10,00,000", description: "Buyback of shares from existing shareholders", schedule: "Schedule CG", risk: "High" },
  { code: "SFT-010", category: "equities", threshold: ">= ₹10,00,000", description: "Purchase / allotment of equity shares (IPO / Rights)", schedule: "Schedule CG / Asset Statement", risk: "Medium" },
  { code: "SFT-011", category: "equities", threshold: "All amounts", description: "Dividend received on equity shares / mutual funds", schedule: "Schedule OS (Dividend Income)", risk: "Low" },
  { code: "SFT-012", category: "equities", threshold: ">= ₹10,00,000", description: "Sale / purchase of listed securities on stock exchange", schedule: "Schedule CG (111A / 112A)", risk: "High" },
  { code: "SFT-013", category: "realestate", threshold: ">= ₹30,00,000", description: "Purchase / sale of immovable property", schedule: "Schedule CG (Sec 54 / 50C)", risk: "High" },
  { code: "SFT-014", category: "realestate", threshold: ">= ₹50,00,000", description: "TDS on transfer of immovable property (194-IA)", schedule: "Schedule TDS-2 & CG", risk: "High" },
  { code: "SFT-015", category: "crypto", threshold: "All amounts", description: "Transfer of Virtual Digital Assets / Crypto (194S)", schedule: "Schedule VDA", risk: "High" },
  { code: "TDS-192", category: "tds", threshold: "Above slab", description: "TDS on Salary by Employer (Form 16 Part A)", schedule: "Schedule TDS-1", risk: "Low" },
  { code: "TDS-194A", category: "tds", threshold: ">= ₹40k / ₹50k", description: "TDS on Bank / NBFC Interest Income", schedule: "Schedule TDS-2 & OS", risk: "Low" },
  { code: "TDS-194J", category: "tds", threshold: ">= ₹30,000", description: "TDS on Professional / Freelance Fees (44ADA)", schedule: "Schedule TDS-2 & BP", risk: "Medium" },
  { code: "TDS-194C", category: "tds", threshold: ">= ₹30,000/1L", description: "TDS on Contractor Payments", schedule: "Schedule TDS-2 & BP", risk: "Medium" },
];

export default function HomePage() {
  // Theme State
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Copy state
  const [copied, setCopied] = useState(false);
  const copyCommand = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("git clone https://github.com/Kishann911/TaxSarthi-.git && ./install.sh");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Active Scenario Preset
  const [activePreset, setActivePreset] = useState<"salaried" | "freelancer" | "senior">("salaried");

  // Studio Tab State
  const [activeTab, setActiveTab] = useState<"salary" | "gains" | "deductions" | "advtax" | "slabs">("salary");

  // Form State
  const [salaryGross, setSalaryGross] = useState<number>(2400000);
  const [exemptAllowances, setExemptAllowances] = useState<number>(240000);
  const [professionalTax, setProfessionalTax] = useState<number>(2400);
  const [hra, setHra] = useState<number>(0);
  const [homeLoan24b, setHomeLoan24b] = useState<number>(180000);
  const [freelanceGross, setFreelanceGross] = useState<number>(0);
  const [savingsInterest, setSavingsInterest] = useState<number>(14500);
  const [fdInterest, setFdInterest] = useState<number>(42000);
  const [dividends, setDividends] = useState<number>(8200);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("regular");

  // Capital Gains
  const [stcg111a, setStcg111a] = useState<number>(45000);
  const [ltcg112a, setLtcg112a] = useState<number>(160000);
  const [stcgSlab, setStcgSlab] = useState<number>(12000);
  const [vdaCrypto, setVdaCrypto] = useState<number>(0);

  // Deductions
  const [ded80c, setDed80c] = useState<number>(150000);
  const [ded80ccd1b, setDed80ccd1b] = useState<number>(50000);
  const [ded80ccd2, setDed80ccd2] = useState<number>(100000);
  const [ded80dSelf, setDed80dSelf] = useState<number>(25000);
  const [ded80dParents, setDed80dParents] = useState<number>(0);
  const [ded80e, setDed80e] = useState<number>(0);
  const [ded80g, setDed80g] = useState<number>(0);

  // Taxes Paid & Advance Tax
  const [tdsSalary, setTdsSalary] = useState<number>(265000);
  const [tdsOther, setTdsOther] = useState<number>(15000);
  const [advQ1, setAdvQ1] = useState<number>(5000);
  const [advQ2, setAdvQ2] = useState<number>(5000);
  const [advQ3, setAdvQ3] = useState<number>(5000);
  const [advQ4, setAdvQ4] = useState<number>(5000);
  const [dueDate, setDueDate] = useState<string>("2026-07-31");
  const [filingDate, setFilingDate] = useState<string>("2026-07-28");

  // Presets
  const applyPreset = (type: "salaried" | "freelancer" | "senior") => {
    setActivePreset(type);
    if (type === "salaried") {
      setSalaryGross(2400000);
      setExemptAllowances(240000);
      setProfessionalTax(2400);
      setHra(0);
      setHomeLoan24b(180000);
      setFreelanceGross(0);
      setStcg111a(45000);
      setLtcg112a(160000);
      setStcgSlab(12000);
      setVdaCrypto(0);
      setSavingsInterest(14500);
      setFdInterest(42000);
      setDividends(8200);
      setDed80c(150000);
      setDed80ccd1b(50000);
      setDed80ccd2(100000);
      setDed80dSelf(25000);
      setDed80dParents(0);
      setDed80e(0);
      setDed80g(0);
      setTdsSalary(265000);
      setTdsOther(15000);
      setAgeCategory("regular");
    } else if (type === "freelancer") {
      setSalaryGross(0);
      setExemptAllowances(0);
      setProfessionalTax(0);
      setHra(0);
      setHomeLoan24b(0);
      setFreelanceGross(2200000);
      setStcg111a(85000);
      setLtcg112a(240000);
      setStcgSlab(0);
      setVdaCrypto(60000);
      setSavingsInterest(18000);
      setFdInterest(0);
      setDividends(5000);
      setDed80c(150000);
      setDed80ccd1b(50000);
      setDed80ccd2(0);
      setDed80dSelf(25000);
      setDed80dParents(25000);
      setDed80e(0);
      setDed80g(0);
      setTdsSalary(0);
      setTdsOther(110000);
      setAgeCategory("regular");
    } else {
      setSalaryGross(0);
      setExemptAllowances(0);
      setProfessionalTax(0);
      setHra(0);
      setHomeLoan24b(0);
      setFreelanceGross(0);
      setStcg111a(0);
      setLtcg112a(90000);
      setStcgSlab(0);
      setVdaCrypto(0);
      setSavingsInterest(35000);
      setFdInterest(480000);
      setDividends(25000);
      setDed80c(150000);
      setDed80ccd1b(0);
      setDed80ccd2(0);
      setDed80dSelf(50000);
      setDed80dParents(0);
      setDed80e(0);
      setDed80g(10000);
      setTdsSalary(0);
      setTdsOther(48000);
      setAgeCategory("senior");
    }
  };

  // Build Payload & Compute Real-Time
  const computation = useMemo(() => {
    const payload: TaxInputPayload = {
      assessment_year: "2026-27",
      financial_year: "2025-26",
      age_category: ageCategory,
      due_date: dueDate,
      filing_date: filingDate,
      income: {
        salary: {
          gross: salaryGross,
          exempt_allowances: exemptAllowances,
          professional_tax: professionalTax,
          hra: hra,
        },
        house_property: homeLoan24b > 0 ? [{ type: "self_occupied", interest_paid: homeLoan24b }] : [],
        business_presumptive_income: freelanceGross * 0.5,
        capital_gains: {
          stcg_111a: stcg111a,
          ltcg_112a: ltcg112a,
          stcg_slab: stcgSlab,
          vda: vdaCrypto,
        },
        other_sources: {
          savings_interest: savingsInterest,
          fd_interest: fdInterest,
          dividends: dividends,
        },
      },
      deductions: {
        "80c": ded80c,
        "80ccd_1b": ded80ccd1b,
        "80ccd_2": ded80ccd2,
        "80d_self": ded80dSelf,
        "80d_parents": ded80dParents,
        "80e": ded80e,
        "80g": ded80g,
      },
      taxes_paid: {
        tds_salary: tdsSalary,
        tds_other: tdsOther,
        advance_tax: [
          { date: "2025-06-15", amount: advQ1 },
          { date: "2025-09-15", amount: advQ2 },
          { date: "2025-12-15", amount: advQ3 },
          { date: "2026-03-15", amount: advQ4 },
        ],
      },
    };

    return computeTax(payload);
  }, [
    salaryGross,
    exemptAllowances,
    professionalTax,
    hra,
    homeLoan24b,
    freelanceGross,
    stcg111a,
    ltcg112a,
    stcgSlab,
    vdaCrypto,
    savingsInterest,
    fdInterest,
    dividends,
    ded80c,
    ded80ccd1b,
    ded80ccd2,
    ded80dSelf,
    ded80dParents,
    ded80e,
    ded80g,
    tdsSalary,
    tdsOther,
    advQ1,
    advQ2,
    advQ3,
    advQ4,
    ageCategory,
    dueDate,
    filingDate,
  ]);

  const newReg = computation.new!;
  const oldReg = computation.old!;

  // AIS SFT Filter State
  const [sftSearch, setSftSearch] = useState("");
  const [sftCat, setSftCat] = useState("all");
  const filteredSft = useMemo(() => {
    return AIS_SFT_CODES.filter((item) => {
      const matchCat = sftCat === "all" || item.category === sftCat;
      const matchSearch =
        !sftSearch ||
        item.code.toLowerCase().includes(sftSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(sftSearch.toLowerCase()) ||
        item.schedule.toLowerCase().includes(sftSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [sftSearch, sftCat]);

  // Export Filing Pack
  const downloadFilingPack = () => {
    const data = {
      product: "TaxPilot v2.0 (Serverless Next.js Edition)",
      assessment_year: "2026-27",
      financial_year: "2025-26",
      generated_at: new Date().toISOString(),
      statutory_compliance: "Income-tax Act, 1961 (as amended for AY 2026-27)",
      computation: computation,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taxpilot-filing-pack-ay2026-27.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 1. Status Bar */}
      <div className="border-b border-border bg-muted/60 text-xs py-2 px-4 text-center text-muted-foreground font-medium">
        <span>
          🛡️ Pinned to <strong className="text-foreground">AY 2026-27 (FY 2025-26)</strong> · Section 87A Marginal Relief, 112A LTCG @ 12.5%, Surcharge 15% Cap &amp; 234A/B/C Verified
        </span>
      </div>

      {/* 2. Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs">
              ₹
            </div>
            <span className="font-bold tracking-tight text-lg">
              TaxPilot <span className="text-xs font-normal text-muted-foreground border border-border px-2 py-0.5 rounded-full ml-1">Next.js v2.0</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#studio" className="hover:text-foreground transition-colors">Tax Studio</a>
            <a href="#radar" className="hover:text-foreground transition-colors">Break-Even Radar</a>
            <a href="#matrix" className="hover:text-foreground transition-colors">Deductions Matrix</a>
            <a href="#checklist" className="hover:text-foreground transition-colors">Audit Checklist</a>
            <a href="#wizard" className="hover:text-foreground transition-colors">ITR Wizard</a>
            <a href="#sft" className="hover:text-foreground transition-colors">AIS SFT</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-all interactive-button"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="https://github.com/Kishann911/TaxSarthi-"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex text-xs font-mono px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-all interactive-button"
            >
              GitHub
            </a>
            <a
              href="#studio"
              className="text-xs font-semibold px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xs interactive-button"
            >
              Open Studio
            </a>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="py-14 md:py-20 border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-accent text-accent-foreground border border-border mb-5">
              <Sparkles size={13} className="text-primary" />
              <span>100% Serverless · Zero-Arithmetic Policy · AY 2026-27</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5">
              Indian tax filing with <br />
              <span className="text-primary underline decoration-primary/30 decoration-wavy">
                mathematical certainty.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-7 max-w-xl">
              TaxPilot establishes a strict separation: AI models ingest documents (Form 16, AIS JSON) with full privacy, while our <strong>deterministic engine</strong> computes every rupee of slab tax, 87A relief, surcharge, and Section 234 interest.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <a
                href="#studio"
                className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs transition-all shadow-xs flex items-center gap-2 interactive-button"
              >
                Launch Tax Studio <ArrowRight size={14} />
              </a>
              <button
                onClick={copyCommand}
                className="px-3.5 py-2.5 rounded-md bg-card hover:bg-muted text-card-foreground font-mono text-xs border border-border transition-all flex items-center gap-2 interactive-button"
              >
                <span>$ git clone ...</span>
                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/60 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-foreground">205+</div>
                <div className="text-[11px] text-muted-foreground">Statutory Tests</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-foreground">104</div>
                <div className="text-[11px] text-muted-foreground">Validator Rules</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-foreground">18</div>
                <div className="text-[11px] text-muted-foreground">AIS SFT Codes</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-foreground">350k+</div>
                <div className="text-[11px] text-muted-foreground">Fuzz Cycles</div>
              </div>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="md:col-span-5 rounded-xl bg-card border border-border shadow-md p-4 font-mono text-xs interactive-card">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3 text-muted-foreground">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
              </div>
              <span className="text-[11px]">taxpilot compute income.json</span>
              <span className="text-primary font-semibold">● AY 2026-27</span>
            </div>
            <div className="space-y-1.5 text-card-foreground">
              <p><span className="text-primary">taxpilot@studio:~$</span> compute --regime=both</p>
              <div className="text-muted-foreground pt-1">[NEW REGIME u/s 115BAC]</div>
              <div className="flex justify-between"><span>Gross Total:</span><span className="tabular-nums">{formatINR(newReg.gross_total_income)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Standard Deduction:</span><span className="tabular-nums">-₹75,000</span></div>
              <div className="flex justify-between"><span>Taxable Slab:</span><span className="tabular-nums">{formatINR(newReg.tax.slab_income)}</span></div>
              <div className="flex justify-between"><span>Slab Tax:</span><span className="tabular-nums">{formatINR(newReg.tax.slab_tax)}</span></div>
              <div className="flex justify-between"><span>Health Cess (4%):</span><span className="tabular-nums">{formatINR(newReg.tax.cess)}</span></div>
              <div className="flex justify-between border-t border-border pt-1 font-bold text-primary">
                <span>TOTAL TAX:</span><span className="tabular-nums">{formatINR(newReg.tax.total_tax_liability)}</span>
              </div>
              <div className="mt-2.5 p-2 rounded-md bg-muted text-foreground text-center font-semibold text-[11px]">
                OPTIMAL: {computation.recommended_regime === "new" ? "NEW REGIME" : "OLD REGIME"} (Saves {formatINR(computation.savings)})
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Tax Studio */}
      <section id="studio" className="py-14 max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Interactive Tax Studio</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Real-time side-by-side computation with instant statutory breakdown for AY 2026-27.</p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border">
            <button
              onClick={() => applyPreset("salaried")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activePreset === "salaried" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              💼 Salaried ₹24L
            </button>
            <button
              onClick={() => applyPreset("freelancer")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activePreset === "freelancer" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              💻 Freelancer 44ADA
            </button>
            <button
              onClick={() => applyPreset("senior")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activePreset === "senior" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              👴 Senior Citizen FD
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Console: Inputs */}
          <div className="lg:col-span-7 rounded-xl bg-card border border-border p-5 shadow-sm">
            {/* Tab Switcher */}
            <div className="flex gap-1.5 border-b border-border pb-3 mb-5 overflow-x-auto text-xs font-medium">
              {[
                { id: "salary", label: "Salary & Income" },
                { id: "gains", label: "Capital Gains" },
                { id: "deductions", label: "Deductions" },
                { id: "advtax", label: "Advance Tax & 234" },
                { id: "slabs", label: "Slab Breakdown" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pane 1: Salary */}
            {activeTab === "salary" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-semibold text-foreground">
                    <span>Gross Salary (Form 16 Part B)</span>
                    <span className="text-muted-foreground font-normal">Std. Ded. ₹75k (New) / ₹50k (Old)</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={salaryGross}
                      onChange={(e) => setSalaryGross(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono focus:outline-ring/50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Exempt Allowances <span className="text-muted-foreground font-normal">(s. 10 Old only)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={exemptAllowances}
                        onChange={(e) => setExemptAllowances(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Professional Tax <span className="text-muted-foreground font-normal">(s. 16(iii))</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={professionalTax}
                        onChange={(e) => setProfessionalTax(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Freelance Gross (44ADA) <span className="text-muted-foreground font-normal">(50% deemed taxable)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={freelanceGross}
                        onChange={(e) => setFreelanceGross(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Savings Bank Interest <span className="text-muted-foreground font-normal">(80TTA eligible)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={savingsInterest}
                        onChange={(e) => setSavingsInterest(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      FD / Term Deposit Interest <span className="text-muted-foreground font-normal">(Slab rate)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={fdInterest}
                        onChange={(e) => setFdInterest(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Age Category <span className="text-muted-foreground font-normal">(Old basic exemption)</span>
                    </label>
                    <select
                      value={ageCategory}
                      onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
                      className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-foreground text-xs"
                    >
                      <option value="regular">Regular (&lt;60 yrs) — Exemption ₹2.5L</option>
                      <option value="senior">Senior (60-79 yrs) — Exemption ₹3.0L</option>
                      <option value="super_senior">Super Senior (80+ yrs) — Exemption ₹5.0L</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 2: Capital Gains */}
            {activeTab === "gains" && (
              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Equity STCG u/s 111A <span className="text-muted-foreground font-normal">(Taxed @ 20%)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={stcg111a}
                        onChange={(e) => setStcg111a(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Equity LTCG u/s 112A <span className="text-muted-foreground font-normal">(12.5% above ₹1.25L)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ltcg112a}
                        onChange={(e) => setLtcg112a(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Normal STCG (Debt / Unlisted) <span className="text-muted-foreground font-normal">(Slab rate)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={stcgSlab}
                        onChange={(e) => setStcgSlab(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      VDA / Crypto Gains <span className="text-muted-foreground font-normal">(Flat 30% u/s 115BBH)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={vdaCrypto}
                        onChange={(e) => setVdaCrypto(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 3: Deductions */}
            {activeTab === "deductions" && (
              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Section 80C <span className="text-muted-foreground font-normal">(EPF, PPF, ELSS · Max 1.5L)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ded80c}
                        onChange={(e) => setDed80c(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      80CCD(1B) Self NPS <span className="text-muted-foreground font-normal">(Additional ₹50,000)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ded80ccd1b}
                        onChange={(e) => setDed80ccd1b(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      80CCD(2) Employer NPS <span className="text-primary font-normal">(Allowed in BOTH regimes)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ded80ccd2}
                        onChange={(e) => setDed80ccd2(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      24(b) Home Loan Interest <span className="text-muted-foreground font-normal">(Self-occupied · Max 2L)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={homeLoan24b}
                        onChange={(e) => setHomeLoan24b(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      80D Health Insurance (Self) <span className="text-muted-foreground font-normal">(Max ₹25k / ₹50k)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ded80dSelf}
                        onChange={(e) => setDed80dSelf(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      80D Health Insurance (Parents) <span className="text-muted-foreground font-normal">(Max ₹50k senior)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={ded80dParents}
                        onChange={(e) => setDed80dParents(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 4: Advance Tax */}
            {activeTab === "advtax" && (
              <div className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">TDS on Salary (Form 16)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={tdsSalary}
                        onChange={(e) => setTdsSalary(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">TDS Other (Banks / AIS)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={tdsOther}
                        onChange={(e) => setTdsOther(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/60 border border-border">
                  <div className="font-semibold text-foreground mb-2">Quarterly Advance Tax Paid (Challan 280):</div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-1">Q1 (15 Jun)</span>
                      <input
                        type="number"
                        value={advQ1}
                        onChange={(e) => setAdvQ1(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-input border border-border rounded text-center font-mono text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Q2 (15 Sep)</span>
                      <input
                        type="number"
                        value={advQ2}
                        onChange={(e) => setAdvQ2(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-input border border-border rounded text-center font-mono text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Q3 (15 Dec)</span>
                      <input
                        type="number"
                        value={advQ3}
                        onChange={(e) => setAdvQ3(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-input border border-border rounded text-center font-mono text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Q4 (15 Mar)</span>
                      <input
                        type="number"
                        value={advQ4}
                        onChange={(e) => setAdvQ4(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-input border border-border rounded text-center font-mono text-foreground text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 234 Diagnostics */}
                <div className="p-3.5 rounded-lg bg-accent/40 border border-border text-xs space-y-1">
                  <div className="font-semibold text-accent-foreground mb-1">Statutory Interest &amp; Fee Breakdown:</div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Interest u/s 234A (Delay in filing):</span>
                    <span className="tabular-nums font-semibold text-foreground">{formatINR(newReg.interest_and_fees["234A"])}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Interest u/s 234B (Shortfall in Advance Tax):</span>
                    <span className="tabular-nums font-semibold text-foreground">{formatINR(newReg.interest_and_fees["234B"])}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Interest u/s 234C (Deferment of Installments):</span>
                    <span className="tabular-nums font-semibold text-foreground">{formatINR(newReg.interest_and_fees["234C"])}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Late Filing Fee u/s 234F:</span>
                    <span className="tabular-nums font-semibold text-foreground">{formatINR(newReg.interest_and_fees["234F"])}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 5: Slab Ledger */}
            {activeTab === "slabs" && (
              <div className="text-xs">
                <div className="text-muted-foreground mb-3">Breakdown of taxable income across statutory tax brackets:</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="pb-2">New Regime Tier</th>
                        <th className="pb-2">Taxable Amount</th>
                        <th className="pb-2 text-right">Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {newReg.slab_breakdown.map((t, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="py-2 text-foreground font-sans">{t.label} ({t.rate})</td>
                          <td className="py-2 text-muted-foreground tabular-nums">{formatINR(t.taxableAmount)}</td>
                          <td className="py-2 text-right text-primary font-semibold tabular-nums">{formatINR(t.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Console: Verdict & Dual Ledger */}
          <div className="lg:col-span-5 space-y-4">
            {/* Verdict Card */}
            <div className="p-5 rounded-xl bg-card border border-primary/40 shadow-sm interactive-card">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    RECOMMENDED VERDICT
                  </span>
                  <div className="text-xl font-extrabold mt-2 text-foreground">
                    {computation.recommended_regime === "new" ? "New Regime (u/s 115BAC)" : "Old Regime (Optional)"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Statutory optimal choice for AY 2026-27
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary tabular-nums">
                    {formatINR(computation.savings)}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">SAVINGS</div>
                </div>
              </div>
            </div>

            {/* Comparison Columns */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* New Regime */}
              <div className={`p-4 rounded-xl border ${computation.recommended_regime === "new" ? "bg-card border-primary/60 shadow-xs" : "bg-card/50 border-border"}`}>
                <div className="font-bold text-primary pb-2 border-b border-border mb-2">New Regime</div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><span>Gross Total:</span><span className="tabular-nums text-foreground">{formatINR(newReg.gross_total_income)}</span></div>
                  <div className="flex justify-between"><span>Std Ded:</span><span className="tabular-nums">-₹75,000</span></div>
                  <div className="flex justify-between"><span>Taxable:</span><span className="tabular-nums text-foreground">{formatINR(newReg.tax.slab_income)}</span></div>
                  <div className="flex justify-between"><span>Slab Tax:</span><span className="tabular-nums text-foreground">{formatINR(newReg.tax.slab_tax)}</span></div>
                  <div className="flex justify-between"><span>87A Relief:</span><span className="tabular-nums text-primary">-{formatINR(newReg.tax.rebate_87a + newReg.tax.marginal_relief_87a)}</span></div>
                  <div className="flex justify-between"><span>Special CG:</span><span className="tabular-nums text-foreground">{formatINR(newReg.tax.special_tax)}</span></div>
                  <div className="flex justify-between"><span>Cess (4%):</span><span className="tabular-nums text-foreground">{formatINR(newReg.tax.cess)}</span></div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Total Tax:</span><span className="tabular-nums text-primary">{formatINR(newReg.tax.total_tax_liability)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1">
                    <span>Prepaid:</span><span className="tabular-nums">-{formatINR(newReg.interest_and_fees.total_prepaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 text-foreground">
                    <span>Net:</span>
                    <span className="tabular-nums text-primary">
                      {newReg.interest_and_fees.final_payable_or_refund < 0 ? `Refund ${formatINR(Math.abs(newReg.interest_and_fees.final_payable_or_refund))}` : formatINR(newReg.interest_and_fees.final_payable_or_refund)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Old Regime */}
              <div className={`p-4 rounded-xl border ${computation.recommended_regime === "old" ? "bg-card border-primary/60 shadow-xs" : "bg-card/50 border-border"}`}>
                <div className="font-bold text-foreground pb-2 border-b border-border mb-2">Old Regime</div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><span>Gross Total:</span><span className="tabular-nums text-foreground">{formatINR(oldReg.gross_total_income)}</span></div>
                  <div className="flex justify-between"><span>Exemptions:</span><span className="tabular-nums">-{formatINR(oldReg.gross_total_income - oldReg.total_income - oldReg.deductions_total)}</span></div>
                  <div className="flex justify-between"><span>Deductions:</span><span className="tabular-nums">-{formatINR(oldReg.deductions_total)}</span></div>
                  <div className="flex justify-between"><span>Taxable:</span><span className="tabular-nums text-foreground">{formatINR(oldReg.total_income)}</span></div>
                  <div className="flex justify-between"><span>Slab Tax:</span><span className="tabular-nums text-foreground">{formatINR(oldReg.tax.slab_tax)}</span></div>
                  <div className="flex justify-between"><span>87A Rebate:</span><span className="tabular-nums">-{formatINR(oldReg.tax.rebate_87a)}</span></div>
                  <div className="flex justify-between"><span>Special CG:</span><span className="tabular-nums text-foreground">{formatINR(oldReg.tax.special_tax)}</span></div>
                  <div className="flex justify-between"><span>Cess (4%):</span><span className="tabular-nums text-foreground">{formatINR(oldReg.tax.cess)}</span></div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Total Tax:</span><span className="tabular-nums">{formatINR(oldReg.tax.total_tax_liability)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1">
                    <span>Prepaid:</span><span className="tabular-nums">-{formatINR(oldReg.interest_and_fees.total_prepaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 text-foreground">
                    <span>Net:</span>
                    <span className="tabular-nums">
                      {oldReg.interest_and_fees.final_payable_or_refund < 0 ? `Refund ${formatINR(Math.abs(oldReg.interest_and_fees.final_payable_or_refund))}` : formatINR(oldReg.interest_and_fees.final_payable_or_refund)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => typeof window !== "undefined" && window.print()}
                className="flex-1 py-2 px-3 rounded-md bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-secondary-foreground flex items-center justify-center gap-1.5 transition-all interactive-button"
              >
                <Printer size={13} /> Print Master Sheet
              </button>
              <button
                onClick={downloadFilingPack}
                className="flex-1 py-2 px-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs interactive-button"
              >
                <Download size={13} /> Export JSON Pack
              </button>
            </div>
          </div>
        </div>

        {/* 5. Dynamic Break-Even Radar */}
        <div id="radar" className="mt-10">
          <BreakEvenRadar
            grossSalary={salaryGross}
            currentOldDeductions={ded80c + ded80ccd1b + ded80dSelf + ded80dParents + homeLoan24b + hra}
            currentSavings={computation.savings}
            recommended={computation.recommended_regime}
          />
        </div>
      </section>

      {/* 6. Statutory Deductions & Exemptions Matrix */}
      <section id="matrix" className="py-12 border-t border-border max-w-7xl mx-auto px-4">
        <DeductionsMatrix />
      </section>

      {/* 7. Pre-Filing Compliance Audit Checklist */}
      <section id="checklist" className="py-12 border-t border-border max-w-7xl mx-auto px-4">
        <AuditChecklist />
      </section>

      {/* 8. ITR Form Decision Wizard */}
      <section id="wizard" className="py-12 border-t border-border max-w-7xl mx-auto px-4">
        <FormWizard />
      </section>

      {/* 9. Privacy Shield Sandbox */}
      <section id="privacy" className="py-12 border-t border-border max-w-7xl mx-auto px-4">
        <PrivacySandbox />
      </section>

      {/* 10. AIS SFT Code Classifier */}
      <section id="sft" className="py-14 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">AIS SFT Intelligence Classifier</h2>
              <p className="text-muted-foreground text-xs mt-0.5">Search 18 Statement of Financial Transaction reporting codes mapped directly to ITR schedules.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search code (e.g. SFT-006, Mutual Funds)..."
                value={sftSearch}
                onChange={(e) => setSftSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-input border border-border rounded-md text-xs text-foreground w-full"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 text-xs font-medium">
            {["all", "banking", "equities", "realestate", "tds", "crypto"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSftCat(cat)}
                className={`px-3 py-1 rounded-full capitalize transition-all ${sftCat === cat ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "bg-card text-muted-foreground hover:text-foreground border border-border"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card text-xs shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">SFT / TDS Code</th>
                  <th className="p-3 font-semibold">Transaction Description &amp; Threshold</th>
                  <th className="p-3 font-semibold">Target ITR Schedule</th>
                  <th className="p-3 font-semibold text-right">Audit Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSft.map((item) => (
                  <tr key={item.code} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{item.code}</td>
                    <td className="p-3">
                      <div className="text-foreground font-medium">{item.description}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Threshold: {item.threshold}</div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{item.schedule}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.risk === "High" ? "bg-destructive/15 text-destructive border border-destructive/30" : item.risk === "Medium" ? "bg-accent/30 text-accent-foreground border border-accent/40" : "bg-muted text-muted-foreground border border-border"}`}>
                        {item.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="py-10 border-t border-border text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-medium text-foreground">
            TaxPilot · Open-Source Indian Income Tax Return Engine &amp; AI Filing Co-Pilot
          </p>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Statutory Disclaimer: TaxPilot does not provide chartered accountancy or financial advice. Final verification, payment, and submission on incometax.gov.in remain the sole responsibility of the individual taxpayer.
          </p>
          <div className="pt-2 text-muted-foreground">
            © 2026 Kishan Ojha &amp; TaxPilot Contributors · MIT License · 100% Serverless Next.js Edition
          </div>
        </div>
      </footer>
    </div>
  );
}

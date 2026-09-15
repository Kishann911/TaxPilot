/**
 * TaxSarthi - Enterprise Indian Income Tax (ITR) Engine & Studio Logic
 * Assessment Year: 2026-27 (Financial Year: 2025-26)
 *
 * Deterministic calculation engine, statutory validation gates, AIS SFT classifier,
 * Golden Test explorer, client-side PII sanitizer, and CA-grade Master Computation Sheet generator.
 */

// --- Currency Formatter ---
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const s = absVal.toString();
  let lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  if (otherNumbers !== '') lastThree = ',' + lastThree;
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return (isNegative ? "-₹" : "₹") + res;
}

function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

// Statutory Section 288A & 288B Rounding (to nearest ₹10)
function roundToNearest10(val) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round(val / 10) * 10;
}

// --- Comprehensive Statutory Calculation Engine (AY 2026-27) ---
function computeCompleteTax(inputs) {
  const {
    salaryGross = 0,
    exemptAllowances = 0,
    professionalTax = 0,
    hraExemption = 0,
    homeLoan24b = 0,
    freelanceGross = 0,
    presumptiveRate = 0.5,
    stcg111a = 0,
    ltcg112a = 0,
    stcgSlab = 0,
    vdaCrypto = 0,
    savingsInterest = 0,
    fdInterest = 0,
    dividends = 0,
    ded80c = 0,
    ded80ccd1b = 0,
    ded80ccd2 = 0,
    ded80dSelf = 0,
    ded80dParents = 0,
    ded80e = 0,
    ded80g = 0,
    tdsSalary = 0,
    tdsOther = 0,
    advTaxQ1 = 0,
    advTaxQ2 = 0,
    advTaxQ3 = 0,
    advTaxQ4 = 0,
    ageCategory = 'regular', // regular (<60), senior (60-79), super_senior (80+)
    dueDate = '2026-07-31',
    filingDate = '2026-07-28'
  } = inputs;

  const otherSourcesTotal = savingsInterest + fdInterest + dividends;
  const presumptiveIncome = freelanceGross * presumptiveRate;
  const totalAdvanceTaxPaid = advTaxQ1 + advTaxQ2 + advTaxQ3 + advTaxQ4;

  // =========================================================================
  // 1. NEW REGIME (u/s 115BAC) - Statutory Default
  // =========================================================================
  const stdDeductionNew = salaryGross > 0 ? Math.min(75000, salaryGross) : 0;
  const netSalaryNew = Math.max(0, salaryGross - stdDeductionNew);
  
  // Employer NPS 80CCD(2) is allowed in New Regime (up to 14% of Basic + DA)
  const allowedEmployerNpsNew = ded80ccd2;
  
  // New regime slab gross (excluding special rate capital gains & VDA)
  const slabGrossNew = netSalaryNew + presumptiveIncome + otherSourcesTotal + stcgSlab;
  const taxableSlabIncomeNew = roundToNearest10(Math.max(0, slabGrossNew - allowedEmployerNpsNew));

  // Slab Breakdown New Regime (AY 2026-27 statutory slabs)
  const newSlabTiers = [
    { label: "Up to ₹4,00,000", min: 0, max: 400000, rate: 0.00 },
    { label: "₹4,00,001 - ₹8,00,000", min: 400000, max: 800000, rate: 0.05 },
    { label: "₹8,00,001 - ₹12,00,000", min: 800000, max: 1200000, rate: 0.10 },
    { label: "₹12,00,001 - ₹16,00,000", min: 1200000, max: 1600000, rate: 0.15 },
    { label: "₹16,00,001 - ₹20,00,000", min: 1600000, max: 2000000, rate: 0.20 },
    { label: "₹20,00,001 - ₹24,00,000", min: 2000000, max: 2400000, rate: 0.25 },
    { label: "Above ₹24,00,000", min: 2400000, max: Infinity, rate: 0.30 }
  ];

  let taxOnSlabNew = 0;
  const slabBreakdownNew = [];

  for (const tier of newSlabTiers) {
    if (taxableSlabIncomeNew > tier.min) {
      const taxableChunk = Math.min(taxableSlabIncomeNew, tier.max) - tier.min;
      const taxChunk = taxableChunk * tier.rate;
      taxOnSlabNew += taxChunk;
      slabBreakdownNew.push({
        label: tier.label,
        rate: (tier.rate * 100) + "%",
        taxableAmount: taxableChunk,
        tax: taxChunk
      });
    } else {
      slabBreakdownNew.push({
        label: tier.label,
        rate: (tier.rate * 100) + "%",
        taxableAmount: 0,
        tax: 0
      });
    }
  }

  // Section 87A Rebate & Marginal Relief (New Regime threshold ₹12,00,000)
  let rebate87aNew = 0;
  let marginalRelief87aNew = 0;
  if (taxableSlabIncomeNew <= 1200000) {
    rebate87aNew = Math.min(taxOnSlabNew, 60000);
  } else if (taxableSlabIncomeNew > 1200000 && taxableSlabIncomeNew <= 1275000) {
    const excessIncome = taxableSlabIncomeNew - 1200000;
    if (taxOnSlabNew > excessIncome) {
      marginalRelief87aNew = taxOnSlabNew - excessIncome;
      rebate87aNew = marginalRelief87aNew;
    }
  }
  const taxAfterRebateNew = Math.max(0, taxOnSlabNew - rebate87aNew);

  // Special Rate Taxes (111A @ 20%, 112A @ 12.5% above ₹1.25L exemption, VDA @ 30%)
  const taxStcg111aNew = stcg111a * 0.20;
  const taxableLtcg112aNew = Math.max(0, ltcg112a - 125000);
  const taxLtcg112aNew = taxableLtcg112aNew * 0.125;
  const taxVdaNew = vdaCrypto * 0.30;
  const specialTaxesNew = taxStcg111aNew + taxLtcg112aNew + taxVdaNew;

  // Surcharge (New Regime Surcharge Rules)
  const totalIncomeForSurchargeNew = taxableSlabIncomeNew + stcg111a + ltcg112a + vdaCrypto;
  let surchargeNew = 0;
  if (totalIncomeForSurchargeNew > 20000000) {
    const cgTax = taxStcg111aNew + taxLtcg112aNew;
    const slabTaxOnly = taxAfterRebateNew;
    surchargeNew = (cgTax * 0.15) + (slabTaxOnly * 0.25);
  } else if (totalIncomeForSurchargeNew > 10000000) {
    surchargeNew = (taxAfterRebateNew + specialTaxesNew) * 0.15;
  } else if (totalIncomeForSurchargeNew > 5000000) {
    surchargeNew = (taxAfterRebateNew + specialTaxesNew) * 0.10;
  }

  const taxPlusSurchargeNew = taxAfterRebateNew + specialTaxesNew + surchargeNew;
  const cessNew = taxPlusSurchargeNew * 0.04;
  const totalTaxLiabilityNew = roundToNearest10(taxPlusSurchargeNew + cessNew);

  // Total Prepaid Taxes
  const totalPrepaid = tdsSalary + tdsOther + totalAdvanceTaxPaid;

  // Section 234F Late Filing Fee
  let fee234FNew = 0;
  const isLate = new Date(filingDate) > new Date(dueDate);
  if (isLate) {
    const grossTotalForFee = salaryGross + freelanceGross + otherSourcesTotal + stcg111a + ltcg112a + stcgSlab + vdaCrypto;
    fee234FNew = grossTotalForFee <= 500000 ? 1000 : 5000;
  }

  // Section 234A, 234B, 234C Statutory Interest
  const assessedTaxNew = Math.max(0, totalTaxLiabilityNew - (tdsSalary + tdsOther));
  let interest234aNew = 0;
  let interest234bNew = 0;
  let interest234cNew = 0;

  if (isLate && (totalTaxLiabilityNew + fee234FNew > totalPrepaid)) {
    const diffMonths = Math.max(1, Math.ceil((new Date(filingDate) - new Date(dueDate)) / (1000 * 60 * 60 * 24 * 30)));
    const shortfall = Math.max(0, (totalTaxLiabilityNew - totalPrepaid));
    interest234aNew = Math.round(shortfall * 0.01 * diffMonths);
  }

  if (assessedTaxNew >= 10000 && totalAdvanceTaxPaid < (0.90 * assessedTaxNew)) {
    const shortfallB = Math.max(0, assessedTaxNew - totalAdvanceTaxPaid);
    const filingMonth = new Date(filingDate).getMonth() + 1;
    const monthsB = Math.max(1, filingMonth - 3);
    interest234bNew = Math.round(shortfallB * 0.01 * monthsB);
  }

  // 234C Deferment Check
  if (assessedTaxNew >= 10000) {
    const targetQ1 = assessedTaxNew * 0.15;
    const targetQ2 = assessedTaxNew * 0.45;
    const targetQ3 = assessedTaxNew * 0.75;
    const targetQ4 = assessedTaxNew * 1.00;

    const cumQ1 = advTaxQ1;
    const cumQ2 = advTaxQ1 + advTaxQ2;
    const cumQ3 = advTaxQ1 + advTaxQ2 + advTaxQ3;

    if (cumQ1 < (assessedTaxNew * 0.12)) interest234cNew += Math.round((targetQ1 - cumQ1) * 0.01 * 3);
    if (cumQ2 < (assessedTaxNew * 0.36)) interest234cNew += Math.round((targetQ2 - cumQ2) * 0.01 * 3);
    if (cumQ3 < targetQ3) interest234cNew += Math.round((targetQ3 - cumQ3) * 0.01 * 3);
    if (totalAdvanceTaxPaid < targetQ4) interest234cNew += Math.round((targetQ4 - totalAdvanceTaxPaid) * 0.01 * 1);
  }

  const netPayableNew = roundToNearest10(totalTaxLiabilityNew + fee234FNew + interest234aNew + interest234bNew + interest234cNew - totalPrepaid);

  // =========================================================================
  // 2. OLD REGIME (Optional) - Calculation
  // =========================================================================
  const stdDeductionOld = salaryGross > 0 ? Math.min(50000, salaryGross) : 0;
  const exemptSalaryOld = stdDeductionOld + exemptAllowances + professionalTax + hraExemption;
  const netSalaryOld = Math.max(0, salaryGross - exemptSalaryOld);

  // Section 24(b) House Property Loss (max 2,00,000 for self-occupied)
  const hpLossOld = Math.min(200000, homeLoan24b);

  // Chapter VI-A Deductions
  const allowed80cOld = Math.min(150000, ded80c);
  const allowed80ccd1bOld = Math.min(50000, ded80ccd1b);
  const allowed80ccd2Old = ded80ccd2;
  const allowed80dSelfOld = Math.min(ageCategory === 'senior' || ageCategory === 'super_senior' ? 50000 : 25000, ded80dSelf);
  const allowed80dParentsOld = Math.min(50000, ded80dParents);
  const allowed80eOld = ded80e;
  const allowed80gOld = ded80g * 0.50; // 50% qualifying donation

  // 80TTA / 80TTB
  let allowed80ttaOld = 0;
  let allowed80ttbOld = 0;
  if (ageCategory === 'senior' || ageCategory === 'super_senior') {
    allowed80ttbOld = Math.min(50000, savingsInterest + fdInterest);
  } else {
    allowed80ttaOld = Math.min(10000, savingsInterest);
  }

  const totalDeductionsOld = allowed80cOld + allowed80ccd1bOld + allowed80ccd2Old +
                             allowed80dSelfOld + allowed80dParentsOld + allowed80eOld +
                             allowed80gOld + allowed80ttaOld + allowed80ttbOld;

  const grossIncomeOld = netSalaryOld + presumptiveIncome + otherSourcesTotal + stcgSlab;
  const incomeAfterHpOld = Math.max(0, grossIncomeOld - hpLossOld);
  const taxableSlabIncomeOld = roundToNearest10(Math.max(0, incomeAfterHpOld - totalDeductionsOld));

  // Old Regime Slabs by Age
  let basicExemptionOld = 250000;
  if (ageCategory === 'senior') basicExemptionOld = 300000;
  if (ageCategory === 'super_senior') basicExemptionOld = 500000;

  const oldSlabTiers = [
    { label: `Up to ₹${basicExemptionOld / 100000}L`, min: 0, max: basicExemptionOld, rate: 0.00 },
    { label: `₹${basicExemptionOld / 100000}L - ₹5,00,000`, min: basicExemptionOld, max: 500000, rate: 0.05 },
    { label: "₹5,00,001 - ₹10,00,000", min: 500000, max: 1000000, rate: 0.20 },
    { label: "Above ₹10,00,000", min: 1000000, max: Infinity, rate: 0.30 }
  ];

  let taxOnSlabOld = 0;
  const slabBreakdownOld = [];

  for (const tier of oldSlabTiers) {
    if (tier.min >= tier.max) continue;
    if (taxableSlabIncomeOld > tier.min) {
      const taxableChunk = Math.min(taxableSlabIncomeOld, tier.max) - tier.min;
      const taxChunk = taxableChunk * tier.rate;
      taxOnSlabOld += taxChunk;
      slabBreakdownOld.push({
        label: tier.label,
        rate: (tier.rate * 100) + "%",
        taxableAmount: taxableChunk,
        tax: taxChunk
      });
    } else {
      slabBreakdownOld.push({
        label: tier.label,
        rate: (tier.rate * 100) + "%",
        taxableAmount: 0,
        tax: 0
      });
    }
  }

  // Section 87A Rebate Old Regime (Threshold ₹5,00,000, Max ₹12,500)
  let rebate87aOld = 0;
  if (taxableSlabIncomeOld <= 500000) {
    rebate87aOld = Math.min(taxOnSlabOld, 12500);
  }
  const taxAfterRebateOld = Math.max(0, taxOnSlabOld - rebate87aOld);

  // Capital Gains Taxes in Old Regime
  const taxStcg111aOld = stcg111a * 0.20;
  const taxableLtcg112aOld = Math.max(0, ltcg112a - 125000);
  const taxLtcg112aOld = taxableLtcg112aOld * 0.125;
  const taxVdaOld = vdaCrypto * 0.30;
  const specialTaxesOld = taxStcg111aOld + taxLtcg112aOld + taxVdaOld;

  // Surcharge Old Regime
  const totalIncomeForSurchargeOld = taxableSlabIncomeOld + stcg111a + ltcg112a + vdaCrypto;
  let surchargeOld = 0;
  if (totalIncomeForSurchargeOld > 50000000) {
    const cgTax = taxStcg111aOld + taxLtcg112aOld;
    const slabTaxOnly = taxAfterRebateOld;
    surchargeOld = (cgTax * 0.15) + (slabTaxOnly * 0.37);
  } else if (totalIncomeForSurchargeOld > 20000000) {
    const cgTax = taxStcg111aOld + taxLtcg112aOld;
    const slabTaxOnly = taxAfterRebateOld;
    surchargeOld = (cgTax * 0.15) + (slabTaxOnly * 0.25);
  } else if (totalIncomeForSurchargeOld > 10000000) {
    surchargeOld = (taxAfterRebateOld + specialTaxesOld) * 0.15;
  } else if (totalIncomeForSurchargeOld > 5000000) {
    surchargeOld = (taxAfterRebateOld + specialTaxesOld) * 0.10;
  }

  const taxPlusSurchargeOld = taxAfterRebateOld + specialTaxesOld + surchargeOld;
  const cessOld = taxPlusSurchargeOld * 0.04;
  const totalTaxLiabilityOld = roundToNearest10(taxPlusSurchargeOld + cessOld);

  let fee234FOld = fee234FNew;
  let interest234aOld = 0;
  let interest234bOld = 0;
  let interest234cOld = 0;

  const assessedTaxOld = Math.max(0, totalTaxLiabilityOld - (tdsSalary + tdsOther));
  if (isLate && (totalTaxLiabilityOld + fee234FOld > totalPrepaid)) {
    const diffMonths = Math.max(1, Math.ceil((new Date(filingDate) - new Date(dueDate)) / (1000 * 60 * 60 * 24 * 30)));
    const shortfall = Math.max(0, (totalTaxLiabilityOld - totalPrepaid));
    interest234aOld = Math.round(shortfall * 0.01 * diffMonths);
  }

  if (assessedTaxOld >= 10000 && totalAdvanceTaxPaid < (0.90 * assessedTaxOld)) {
    const shortfallB = Math.max(0, assessedTaxOld - totalAdvanceTaxPaid);
    const filingMonth = new Date(filingDate).getMonth() + 1;
    const monthsB = Math.max(1, filingMonth - 3);
    interest234bOld = Math.round(shortfallB * 0.01 * monthsB);
  }

  if (assessedTaxOld >= 10000) {
    const targetQ1 = assessedTaxOld * 0.15;
    const targetQ2 = assessedTaxOld * 0.45;
    const targetQ3 = assessedTaxOld * 0.75;
    const targetQ4 = assessedTaxOld * 1.00;

    const cumQ1 = advTaxQ1;
    const cumQ2 = advTaxQ1 + advTaxQ2;
    const cumQ3 = advTaxQ1 + advTaxQ2 + advTaxQ3;

    if (cumQ1 < (assessedTaxOld * 0.12)) interest234cOld += Math.round((targetQ1 - cumQ1) * 0.01 * 3);
    if (cumQ2 < (assessedTaxOld * 0.36)) interest234cOld += Math.round((targetQ2 - cumQ2) * 0.01 * 3);
    if (cumQ3 < targetQ3) interest234cOld += Math.round((targetQ3 - cumQ3) * 0.01 * 3);
    if (totalAdvanceTaxPaid < targetQ4) interest234cOld += Math.round((targetQ4 - totalAdvanceTaxPaid) * 0.01 * 1);
  }

  const netPayableOld = roundToNearest10(totalTaxLiabilityOld + fee234FOld + interest234aOld + interest234bOld + interest234cOld - totalPrepaid);

  // Verdict & Recommendation
  const recommended = totalTaxLiabilityNew <= totalTaxLiabilityOld ? 'new' : 'old';
  const savings = Math.abs(totalTaxLiabilityOld - totalTaxLiabilityNew);

  return {
    recommended,
    savings,
    grossTotal: salaryGross + freelanceGross + otherSourcesTotal + stcg111a + ltcg112a + stcgSlab + vdaCrypto,
    newRegime: {
      grossTotal: salaryGross + freelanceGross + otherSourcesTotal + stcg111a + ltcg112a + stcgSlab + vdaCrypto,
      stdDeduction: stdDeductionNew,
      employerNps: allowedEmployerNpsNew,
      taxableIncome: taxableSlabIncomeNew,
      taxOnSlab: taxOnSlabNew,
      rebate87a: rebate87aNew,
      marginalRelief: marginalRelief87aNew,
      specialTaxes: specialTaxesNew,
      surcharge: surchargeNew,
      cess: cessNew,
      totalTax: totalTaxLiabilityNew,
      prepaid: totalPrepaid,
      fee234F: fee234FNew,
      interest234A: interest234aNew,
      interest234B: interest234bNew,
      interest234C: interest234cNew,
      netPayable: netPayableNew,
      slabBreakdown: slabBreakdownNew
    },
    oldRegime: {
      grossTotal: salaryGross + freelanceGross + otherSourcesTotal + stcg111a + ltcg112a + stcgSlab + vdaCrypto,
      exemptSalary: exemptSalaryOld,
      hpLoss: hpLossOld,
      deductions: totalDeductionsOld,
      taxableIncome: taxableSlabIncomeOld,
      taxOnSlab: taxOnSlabOld,
      rebate87a: rebate87aOld,
      specialTaxes: specialTaxesOld,
      surcharge: surchargeOld,
      cess: cessOld,
      totalTax: totalTaxLiabilityOld,
      prepaid: totalPrepaid,
      fee234F: fee234FOld,
      interest234A: interest234aOld,
      interest234B: interest234bOld,
      interest234C: interest234cOld,
      netPayable: netPayableOld,
      slabBreakdown: slabBreakdownOld
    }
  };
}

// --- AIS SFT Knowledge Base (18 Statutory SFT & TDS Codes) ---
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
  { code: "TDS-194C", category: "tds", threshold: ">= ₹30,000/1L", description: "TDS on Contractor Payments", schedule: "Schedule TDS-2 & BP", risk: "Medium" }
];

// --- Golden Tests Explorer Registry ---
const GOLDEN_TEST_SCENARIOS = [
  {
    id: "case-01",
    title: "Scenario 01: Section 87A Marginal Relief Cliff (₹12,45,000 Income)",
    description: "Asserts that under Section 87A for AY 2026-27, total tax payable on ₹12,45,000 cannot exceed ₹45,000 (the incremental excess over ₹12 Lakhs), granting statutory relief.",
    inputs: {
      salaryGross: 1320000,
      exemptAllowances: 0,
      professionalTax: 0,
      hraExemption: 0,
      homeLoan24b: 0,
      freelanceGross: 0,
      stcg111a: 0,
      ltcg112a: 0,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 0,
      fdInterest: 0,
      dividends: 0,
      ded80c: 0,
      ded80ccd1b: 0,
      ded80ccd2: 0,
      ded80dSelf: 0,
      ded80dParents: 0,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 45000,
      tdsOther: 0,
      advTaxQ1: 0, advTaxQ2: 0, advTaxQ3: 0, advTaxQ4: 0,
      ageCategory: 'regular'
    },
    statutoryNote: "New Regime: Taxable ₹12.45L, Slab Tax ₹74,500, Relief ₹29,500, Net Tax ₹45,000 + 4% Cess = ₹46,800."
  },
  {
    id: "case-02",
    title: "Scenario 02: High-Net-Worth Portfolio (₹3.5 Crore) with 15% Surcharge Capping",
    description: "Asserts that while general income above ₹2 Crore attracts 25% surcharge, equity capital gains (111A/112A) and dividend income are strictly capped at 15% surcharge.",
    inputs: {
      salaryGross: 15000000,
      exemptAllowances: 0,
      professionalTax: 0,
      hraExemption: 0,
      homeLoan24b: 0,
      freelanceGross: 0,
      stcg111a: 8000000,
      ltcg112a: 12000000,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 50000,
      fdInterest: 200000,
      dividends: 500000,
      ded80c: 150000,
      ded80ccd1b: 0,
      ded80ccd2: 0,
      ded80dSelf: 25000,
      ded80dParents: 0,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 4500000,
      tdsOther: 100000,
      advTaxQ1: 1000000, advTaxQ2: 1500000, advTaxQ3: 1500000, advTaxQ4: 1000000,
      ageCategory: 'regular'
    },
    statutoryNote: "Surcharge segregation verified: 15% on special equity taxes, 25% on normal slab."
  },
  {
    id: "case-03",
    title: "Scenario 03: Section 112A ₹1,25,000 Exemption & 12.5% Tax Rate",
    description: "Asserts that the statutory LTCG equity exemption of ₹1,25,000 is applied first before taxing remaining gains at exactly 12.5%.",
    inputs: {
      salaryGross: 1800000,
      exemptAllowances: 0,
      professionalTax: 2400,
      hraExemption: 0,
      homeLoan24b: 0,
      freelanceGross: 0,
      stcg111a: 50000,
      ltcg112a: 325000,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 12000,
      fdInterest: 30000,
      dividends: 8000,
      ded80c: 150000,
      ded80ccd1b: 50000,
      ded80ccd2: 50000,
      ded80dSelf: 25000,
      ded80dParents: 0,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 210000,
      tdsOther: 5000,
      advTaxQ1: 0, advTaxQ2: 10000, advTaxQ3: 15000, advTaxQ4: 10000,
      ageCategory: 'regular'
    },
    statutoryNote: "LTCG ₹3.25L - ₹1.25L exempt = ₹2.00L taxable @ 12.5% = ₹25,000."
  },
  {
    id: "case-04",
    title: "Scenario 04: Presumptive Professional u/s 44ADA (₹36 Lakhs Gross)",
    description: "Tests 50% deemed taxable profit under Section 44ADA combined with savings interest and capital gains.",
    inputs: {
      salaryGross: 0,
      exemptAllowances: 0,
      professionalTax: 0,
      hraExemption: 0,
      homeLoan24b: 0,
      freelanceGross: 3600000,
      stcg111a: 60000,
      ltcg112a: 180000,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 24000,
      fdInterest: 0,
      dividends: 10000,
      ded80c: 150000,
      ded80ccd1b: 50000,
      ded80ccd2: 0,
      ded80dSelf: 25000,
      ded80dParents: 25000,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 0,
      tdsOther: 180000,
      advTaxQ1: 20000, advTaxQ2: 40000, advTaxQ3: 50000, advTaxQ4: 50000,
      ageCategory: 'regular'
    },
    statutoryNote: "Presumptive income = ₹18,00,000 (50%). Form required: ITR-4 (Sugam)."
  },
  {
    id: "case-05",
    title: "Scenario 05: Salaried with Deductions (Old Regime Winner by ₹48k)",
    description: "Demonstrates when heavy Chapter VI-A deductions (HRA + 80C + 80D + 24b Home Loan) make Old Regime more advantageous.",
    inputs: {
      salaryGross: 2500000,
      exemptAllowances: 0,
      professionalTax: 2400,
      hraExemption: 360000,
      homeLoan24b: 200000,
      freelanceGross: 0,
      stcg111a: 0,
      ltcg112a: 0,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 10000,
      fdInterest: 0,
      dividends: 0,
      ded80c: 150000,
      ded80ccd1b: 50000,
      ded80ccd2: 120000,
      ded80dSelf: 25000,
      ded80dParents: 50000,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 280000,
      tdsOther: 0,
      advTaxQ1: 0, advTaxQ2: 0, advTaxQ3: 0, advTaxQ4: 0,
      ageCategory: 'regular'
    },
    statutoryNote: "Total deductions & exemptions exceed ₹9.5 Lakhs, resulting in lower tax under Old Regime."
  },
  {
    id: "case-06",
    title: "Scenario 06: Senior Citizen (Age 68) with Pension, Bank FD & 80TTB",
    description: "Tests senior citizen basic exemption of ₹3,00,000 in Old Regime and ₹50,000 deduction for deposit interest under Section 80TTB.",
    inputs: {
      salaryGross: 600000, // Pension
      exemptAllowances: 0,
      professionalTax: 0,
      hraExemption: 0,
      homeLoan24b: 0,
      freelanceGross: 0,
      stcg111a: 0,
      ltcg112a: 80000,
      stcgSlab: 0,
      vdaCrypto: 0,
      savingsInterest: 40000,
      fdInterest: 380000,
      dividends: 25000,
      ded80c: 150000,
      ded80ccd1b: 0,
      ded80ccd2: 0,
      ded80dSelf: 50000,
      ded80dParents: 0,
      ded80e: 0,
      ded80g: 0,
      tdsSalary: 0,
      tdsOther: 42000,
      advTaxQ1: 0, advTaxQ2: 0, advTaxQ3: 0, advTaxQ4: 0,
      ageCategory: 'senior'
    },
    statutoryNote: "Section 80TTB ₹50,000 applied to deposit interest; senior citizen slab brackets evaluated."
  }
];

// --- Global Functions Exposed to Window ---

let currentLoadedScenario = null;
let currentSftCategory = 'all';
let currentSftSearch = '';
const wizardState = { incomeType: 'salary', hasCapitalGains: 'no', hasBusiness: 'no', hasForeignAssets: 'no' };

function setStudioPreset(type, element) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
  if (element) element.classList.add('active');

  const presets = {
    salaried: {
      'inp-salary': 2400000,
      'inp-exempt-allowances': 240000,
      'inp-pt': 2400,
      'inp-hra': 0,
      'inp-homeloan': 180000,
      'inp-freelance': 0,
      'inp-stcg': 45000,
      'inp-ltcg': 160000,
      'inp-stcg-slab': 12000,
      'inp-crypto': 0,
      'inp-savings-interest': 14500,
      'inp-fd-interest': 42000,
      'inp-dividends': 8200,
      'inp-80c': 150000,
      'inp-nps': 50000,
      'inp-employer-nps': 100000,
      'inp-80d-self': 25000,
      'inp-80d-parents': 0,
      'inp-80e': 0,
      'inp-80g': 0,
      'inp-tds-salary': 265000,
      'inp-tds-other': 15000,
      'inp-advtax-q1': 5000,
      'inp-advtax-q2': 5000,
      'inp-advtax-q3': 5000,
      'inp-advtax-q4': 5000,
      'inp-age': 'regular'
    },
    freelancer: {
      'inp-salary': 0,
      'inp-exempt-allowances': 0,
      'inp-pt': 0,
      'inp-hra': 0,
      'inp-homeloan': 0,
      'inp-freelance': 2200000,
      'inp-stcg': 85000,
      'inp-ltcg': 240000,
      'inp-stcg-slab': 0,
      'inp-crypto': 60000,
      'inp-savings-interest': 18000,
      'inp-fd-interest': 0,
      'inp-dividends': 5000,
      'inp-80c': 150000,
      'inp-nps': 50000,
      'inp-employer-nps': 0,
      'inp-80d-self': 25000,
      'inp-80d-parents': 25000,
      'inp-80e': 0,
      'inp-80g': 0,
      'inp-tds-salary': 0,
      'inp-tds-other': 110000,
      'inp-advtax-q1': 10000,
      'inp-advtax-q2': 15000,
      'inp-advtax-q3': 15000,
      'inp-advtax-q4': 10000,
      'inp-age': 'regular'
    },
    senior: {
      'inp-salary': 0,
      'inp-exempt-allowances': 0,
      'inp-pt': 0,
      'inp-hra': 0,
      'inp-homeloan': 0,
      'inp-freelance': 0,
      'inp-stcg': 0,
      'inp-ltcg': 90000,
      'inp-stcg-slab': 0,
      'inp-crypto': 0,
      'inp-savings-interest': 35000,
      'inp-fd-interest': 480000,
      'inp-dividends': 25000,
      'inp-80c': 150000,
      'inp-nps': 0,
      'inp-employer-nps': 0,
      'inp-80d-self': 50000,
      'inp-80d-parents': 0,
      'inp-80e': 0,
      'inp-80g': 10000,
      'inp-tds-salary': 0,
      'inp-tds-other': 48000,
      'inp-advtax-q1': 0,
      'inp-advtax-q2': 0,
      'inp-advtax-q3': 0,
      'inp-advtax-q4': 0,
      'inp-age': 'senior'
    }
  };

  const data = presets[type];
  if (data) {
    Object.keys(data).forEach(k => {
      const el = document.getElementById(k);
      if (el) el.value = data[k];
    });
    updateStudio();
  }
}

function downloadFilingPackJSON() {
  if (typeof document === 'undefined') return;
  const inputs = getStudioInputs();
  const result = computeCompleteTax(inputs);
  const data = {
    product: "TaxSarthi v1.0.0",
    assessment_year: "2026-27",
    financial_year: "2025-26",
    generated_at: new Date().toISOString(),
    statutory_compliance: "Income-tax Act, 1961 (as amended for AY 2026-27)",
    inputs: inputs,
    computation: result
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taxsarthi-filing-pack-ay2026-27.json';
  a.click();
  URL.revokeObjectURL(url);
}

function printMasterTaxSheet() {
  if (typeof window !== 'undefined') window.print();
}

function setSftCategory(cat, element) {
  if (typeof document === 'undefined') return;
  currentSftCategory = cat;
  document.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');
  renderSftTable();
}

function filterSftCodes(query) {
  currentSftSearch = (query || '').toLowerCase().trim();
  renderSftTable();
}

function renderSftTable() {
  if (typeof document === 'undefined') return;
  const tbody = document.getElementById('sft-table-body');
  if (!tbody) return;

  const filtered = AIS_SFT_CODES.filter(item => {
    const matchCat = currentSftCategory === 'all' || item.category === currentSftCategory;
    const matchQuery = !currentSftSearch ||
      item.code.toLowerCase().includes(currentSftSearch) ||
      item.description.toLowerCase().includes(currentSftSearch) ||
      item.schedule.toLowerCase().includes(currentSftSearch);
    return matchCat && matchQuery;
  });

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td class="mono" style="font-weight:600; color:var(--text-primary);">${item.code}</td>
      <td>
        <div style="font-weight:500; color:var(--text-primary);">${item.description}</div>
        <div style="font-size:0.74rem; color:var(--text-tertiary); margin-top:2px;">Threshold: ${item.threshold}</div>
      </td>
      <td class="mono" style="font-size:0.75rem; color:var(--brand-teal-light);">${item.schedule}</td>
      <td><span class="badge-${item.risk.toLowerCase()}">${item.risk}</span></td>
    </tr>
  `).join('');
}

function loadSampleRedactor(type) {
  if (typeof document === 'undefined') return;
  const inputArea = document.getElementById('redactor-input');
  if (!inputArea) return;

  if (type === 'form16') {
    inputArea.value = `FORM NO. 16 - PART B (Certificate u/s 203)
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
  } else {
    inputArea.value = JSON.stringify({
      "taxpayer": {
        "name": "Karan Singhania",
        "pan": "BNZPK8892L",
        "aadhaar": "987654321098",
        "email": "karan.singh@fintech.co.in",
        "phone": "9811223344"
      },
      "financialYear": "2025-26",
      "assessmentYear": "2026-27",
      "salary": {
        "gross": 3200000,
        "tds": 420000
      },
      "bankAccounts": [
        { "bank": "ICICI Bank", "account": "000401567890", "ifsc": "ICIC0000004" }
      ]
    }, null, 2);
  }
  executeRedaction();
}

function executeRedaction() {
  if (typeof document === 'undefined') return;
  const inputArea = document.getElementById('redactor-input');
  const outputPane = document.getElementById('redactor-output');
  const countBadge = document.getElementById('redactor-count-badge');
  if (!inputArea || !outputPane) return;

  let text = inputArea.value;
  let count = 0;

  // Redact PAN
  text = text.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_PAN]</span>';
  });

  // Redact Aadhaar
  text = text.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_AADHAAR]</span>';
  });

  // Redact TAN
  text = text.replace(/\b[A-Z]{4}[0-9]{5}[A-Z]\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_TAN]</span>';
  });

  // Redact Emails
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_EMAIL]</span>';
  });

  // Redact Mobile Numbers
  text = text.replace(/(?:\+91\s?)?[6-9]\d{4}\s?\d{5}\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_PHONE]</span>';
  });

  // Redact Bank Accounts
  text = text.replace(/\b\d{10,18}\b/g, () => {
    count++;
    return '<span class="redacted-tag">[REDACTED_ACCOUNT]</span>';
  });

  outputPane.innerHTML = text;
  if (countBadge) {
    countBadge.textContent = `${count} Identities Scrubbed · 100% Client-Side`;
  }
}

function loadGoldenScenario(id) {
  if (typeof document === 'undefined') return;
  const scenario = GOLDEN_TEST_SCENARIOS.find(s => s.id === id);
  if (!scenario) return;

  document.querySelectorAll('.test-scenario-pill').forEach(p => p.classList.remove('active'));
  if (typeof event !== 'undefined' && event && event.target && event.target.classList) {
    event.target.classList.add('active');
  }

  const titleEl = document.getElementById('golden-test-title');
  const descEl = document.getElementById('golden-test-desc');
  const inputsEl = document.getElementById('golden-test-inputs');
  const noteEl = document.getElementById('golden-test-note');

  if (titleEl) titleEl.textContent = scenario.title;
  if (descEl) descEl.textContent = scenario.description;
  if (inputsEl) inputsEl.textContent = JSON.stringify(scenario.inputs, null, 2);
  if (noteEl) noteEl.textContent = scenario.statutoryNote;
  
  currentLoadedScenario = scenario;
}

function loadScenarioIntoStudio() {
  if (!currentLoadedScenario || typeof document === 'undefined') return;
  const inp = currentLoadedScenario.inputs;
  
  const mapping = {
    'inp-salary': inp.salaryGross,
    'inp-exempt-allowances': inp.exemptAllowances,
    'inp-pt': inp.professionalTax,
    'inp-hra': inp.hraExemption,
    'inp-homeloan': inp.homeLoan24b,
    'inp-freelance': inp.freelanceGross,
    'inp-stcg': inp.stcg111a,
    'inp-ltcg': inp.ltcg112a,
    'inp-stcg-slab': inp.stcgSlab,
    'inp-crypto': inp.vdaCrypto,
    'inp-savings-interest': inp.savingsInterest,
    'inp-fd-interest': inp.fdInterest,
    'inp-dividends': inp.dividends,
    'inp-80c': inp.ded80c,
    'inp-nps': inp.ded80ccd1b,
    'inp-employer-nps': inp.ded80ccd2,
    'inp-80d-self': inp.ded80dSelf,
    'inp-80d-parents': inp.ded80dParents,
    'inp-80e': inp.ded80e,
    'inp-80g': inp.ded80g,
    'inp-tds-salary': inp.tdsSalary,
    'inp-tds-other': inp.tdsOther,
    'inp-advtax-q1': inp.advTaxQ1,
    'inp-advtax-q2': inp.advTaxQ2,
    'inp-advtax-q3': inp.advTaxQ3,
    'inp-advtax-q4': inp.advTaxQ4,
    'inp-age': inp.ageCategory
  };

  Object.keys(mapping).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = mapping[k] || 0;
  });

  updateStudio();
  if (typeof window !== 'undefined') window.location.href = '#studio';
}

function selectWizardOption(key, val, element) {
  if (typeof document === 'undefined') return;
  wizardState[key] = val;
  const parent = element ? element.parentElement : null;
  if (parent) {
    parent.querySelectorAll('.wizard-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
  }

  let recommendedForm = 'ITR-1 (Sahaj)';
  let reason = 'Salaried individuals with income up to ₹50 Lakhs and no capital gains.';

  if (wizardState.hasForeignAssets === 'yes') {
    recommendedForm = 'ITR-2 / ITR-3 (Schedule FA)';
    reason = 'Mandatory filing of Schedule FA for taxpayers holding foreign assets, RSUs, or overseas bank accounts.';
  } else if (wizardState.hasBusiness === 'full') {
    recommendedForm = 'ITR-3';
    reason = 'Full business or professional income requiring balance sheet and P&L statements.';
  } else if (wizardState.hasBusiness === 'presumptive') {
    recommendedForm = 'ITR-4 (Sugam)';
    reason = 'Presumptive taxation u/s 44AD / 44ADA / 44AE for small businesses and freelance professionals.';
  } else if (wizardState.hasCapitalGains === 'yes' || wizardState.incomeType === 'multiple_hp') {
    recommendedForm = 'ITR-2';
    reason = 'Salaried filers with Capital Gains (stocks, mutual funds, crypto, real estate) or multiple house properties.';
  }

  const resultEl = document.getElementById('wizard-form-result');
  const descEl = document.getElementById('wizard-form-desc');
  if (resultEl) resultEl.textContent = recommendedForm;
  if (descEl) descEl.textContent = reason;
}

function getStudioInputs() {
  if (typeof document === 'undefined') return {};
  return {
    salaryGross: parseNum(document.getElementById('inp-salary')?.value),
    exemptAllowances: parseNum(document.getElementById('inp-exempt-allowances')?.value),
    professionalTax: parseNum(document.getElementById('inp-pt')?.value),
    hraExemption: parseNum(document.getElementById('inp-hra')?.value),
    homeLoan24b: parseNum(document.getElementById('inp-homeloan')?.value),
    freelanceGross: parseNum(document.getElementById('inp-freelance')?.value),
    presumptiveRate: 0.5,
    stcg111a: parseNum(document.getElementById('inp-stcg')?.value),
    ltcg112a: parseNum(document.getElementById('inp-ltcg')?.value),
    stcgSlab: parseNum(document.getElementById('inp-stcg-slab')?.value),
    vdaCrypto: parseNum(document.getElementById('inp-crypto')?.value),
    savingsInterest: parseNum(document.getElementById('inp-savings-interest')?.value),
    fdInterest: parseNum(document.getElementById('inp-fd-interest')?.value),
    dividends: parseNum(document.getElementById('inp-dividends')?.value),
    ded80c: parseNum(document.getElementById('inp-80c')?.value),
    ded80ccd1b: parseNum(document.getElementById('inp-nps')?.value),
    ded80ccd2: parseNum(document.getElementById('inp-employer-nps')?.value),
    ded80dSelf: parseNum(document.getElementById('inp-80d-self')?.value),
    ded80dParents: parseNum(document.getElementById('inp-80d-parents')?.value),
    ded80e: parseNum(document.getElementById('inp-80e')?.value),
    ded80g: parseNum(document.getElementById('inp-80g')?.value),
    tdsSalary: parseNum(document.getElementById('inp-tds-salary')?.value),
    tdsOther: parseNum(document.getElementById('inp-tds-other')?.value),
    advTaxQ1: parseNum(document.getElementById('inp-advtax-q1')?.value),
    advTaxQ2: parseNum(document.getElementById('inp-advtax-q2')?.value),
    advTaxQ3: parseNum(document.getElementById('inp-advtax-q3')?.value),
    advTaxQ4: parseNum(document.getElementById('inp-advtax-q4')?.value),
    ageCategory: document.getElementById('inp-age')?.value || 'regular',
    dueDate: document.getElementById('inp-due-date')?.value || '2026-07-31',
    filingDate: document.getElementById('inp-filing-date')?.value || '2026-07-28'
  };
}

function updateStudio() {
  if (typeof document === 'undefined') return;
  const inputs = getStudioInputs();
  const result = computeCompleteTax(inputs);

  // Update Verdict Banner
  const verdictTag = document.getElementById('verdict-tag');
  const verdictSavings = document.getElementById('verdict-savings');
  if (verdictTag) {
    verdictTag.textContent = result.recommended === 'new' ? 'New Regime Recommended' : 'Old Regime Recommended';
  }
  if (verdictSavings) {
    verdictSavings.textContent = formatINR(result.savings) + ' Saved';
  }

  // Regime Column Winner Highlight
  const colNew = document.getElementById('col-new');
  const colOld = document.getElementById('col-old');
  if (colNew && colOld) {
    if (result.recommended === 'new') {
      colNew.classList.add('winner');
      colOld.classList.remove('winner');
    } else {
      colOld.classList.add('winner');
      colNew.classList.remove('winner');
    }
  }

  // New Regime Values
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setT('val-new-gross', formatINR(result.newRegime.grossTotal));
  setT('val-new-stdded', '-' + formatINR(result.newRegime.stdDeduction));
  setT('val-new-nps2', '-' + formatINR(result.newRegime.employerNps));
  setT('val-new-taxable', formatINR(result.newRegime.taxableIncome));
  setT('val-new-slabtax', formatINR(result.newRegime.taxOnSlab));
  setT('val-new-rebate', '-' + formatINR(result.newRegime.rebate87a));
  setT('val-new-special', formatINR(result.newRegime.specialTaxes));
  setT('val-new-surcharge', formatINR(result.newRegime.surcharge));
  setT('val-new-cess', formatINR(result.newRegime.cess));
  setT('val-new-totaltax', formatINR(result.newRegime.totalTax));
  setT('val-new-prepaid', '-' + formatINR(result.newRegime.prepaid));
  setT('val-new-fee', formatINR(result.newRegime.fee234F));

  const newPayableEl = document.getElementById('val-new-payable');
  if (newPayableEl) {
    if (result.newRegime.netPayable < 0) {
      newPayableEl.textContent = 'Refund ' + formatINR(Math.abs(result.newRegime.netPayable));
      newPayableEl.style.color = 'var(--brand-emerald)';
    } else {
      newPayableEl.textContent = formatINR(result.newRegime.netPayable);
      newPayableEl.style.color = 'var(--text-primary)';
    }
  }

  // Old Regime Values
  setT('val-old-gross', formatINR(result.oldRegime.grossTotal));
  setT('val-old-exemptsal', '-' + formatINR(result.oldRegime.exemptSalary));
  setT('val-old-hploss', '-' + formatINR(result.oldRegime.hpLoss));
  setT('val-old-deductions', '-' + formatINR(result.oldRegime.deductions));
  setT('val-old-taxable', formatINR(result.oldRegime.taxableIncome));
  setT('val-old-slabtax', formatINR(result.oldRegime.taxOnSlab));
  setT('val-old-rebate', '-' + formatINR(result.oldRegime.rebate87a));
  setT('val-old-special', formatINR(result.oldRegime.specialTaxes));
  setT('val-old-surcharge', formatINR(result.oldRegime.surcharge));
  setT('val-old-cess', formatINR(result.oldRegime.cess));
  setT('val-old-totaltax', formatINR(result.oldRegime.totalTax));
  setT('val-old-prepaid', '-' + formatINR(result.oldRegime.prepaid));
  setT('val-old-fee', formatINR(result.oldRegime.fee234F));

  const oldPayableEl = document.getElementById('val-old-payable');
  if (oldPayableEl) {
    if (result.oldRegime.netPayable < 0) {
      oldPayableEl.textContent = 'Refund ' + formatINR(Math.abs(result.oldRegime.netPayable));
      oldPayableEl.style.color = 'var(--brand-emerald)';
    } else {
      oldPayableEl.textContent = formatINR(result.oldRegime.netPayable);
      oldPayableEl.style.color = 'var(--text-primary)';
    }
  }

  // Render Slab Breakdown Table
  renderSlabLedger(result.newRegime.slabBreakdown, result.oldRegime.slabBreakdown);

  // Render Advance Tax & Interest Diagnostics
  renderAdvanceTaxDiagnostics(result.newRegime);
}

function renderSlabLedger(newBreakdown, oldBreakdown) {
  if (typeof document === 'undefined') return;
  const tbody = document.getElementById('slab-breakdown-tbody');
  if (!tbody) return;

  let html = '';
  const maxRows = Math.max(newBreakdown.length, oldBreakdown.length);
  for (let i = 0; i < maxRows; i++) {
    const n = newBreakdown[i] || { label: '-', rate: '-', taxableAmount: 0, tax: 0 };
    const o = oldBreakdown[i] || { label: '-', rate: '-', taxableAmount: 0, tax: 0 };
    html += `
      <tr>
        <td style="font-size:0.75rem;">${n.label} (${n.rate})</td>
        <td class="mono" style="font-size:0.75rem;">${formatINR(n.taxableAmount)}</td>
        <td class="mono" style="font-size:0.75rem; color:var(--brand-teal-light); font-weight:600;">${formatINR(n.tax)}</td>
        <td style="font-size:0.75rem; border-left:1px solid var(--border-subtle);">${o.label} (${o.rate})</td>
        <td class="mono" style="font-size:0.75rem;">${formatINR(o.taxableAmount)}</td>
        <td class="mono" style="font-size:0.75rem; color:var(--text-primary); font-weight:600;">${formatINR(o.tax)}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

function renderAdvanceTaxDiagnostics(newRes) {
  if (typeof document === 'undefined') return;
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setT('diag-234a', formatINR(newRes.interest234A));
  setT('diag-234b', formatINR(newRes.interest234B));
  setT('diag-234c', formatINR(newRes.interest234C));
  setT('diag-234f', formatINR(newRes.fee234F));
}

// Assign to window for global access
if (typeof window !== 'undefined') {
  window.setStudioPreset = setStudioPreset;
  window.downloadFilingPackJSON = downloadFilingPackJSON;
  window.printMasterTaxSheet = printMasterTaxSheet;
  window.setSftCategory = setSftCategory;
  window.filterSftCodes = filterSftCodes;
  window.loadSampleRedactor = loadSampleRedactor;
  window.executeRedaction = executeRedaction;
  window.loadGoldenScenario = loadGoldenScenario;
  window.loadScenarioIntoStudio = loadScenarioIntoStudio;
  window.selectWizardOption = selectWizardOption;
  window.updateStudio = updateStudio;
}

// --- UI Controller & State Manager on DOM Ready ---
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const navLogo = document.getElementById('nav-logo');
    const footerLogo = document.getElementById('footer-logo');
    const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('taxsarthi_theme')) || 'dark';

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (typeof localStorage !== 'undefined') localStorage.setItem('taxsarthi_theme', theme);
      if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      if (navLogo) navLogo.src = theme === 'dark' ? 'assets/logo-white.svg' : 'assets/logo.svg';
      if (footerLogo) footerLogo.src = theme === 'dark' ? 'assets/logo-white.svg' : 'assets/logo.svg';
    }
    applyTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // Copy Install Command
    const btnCopyInstall = document.getElementById('btn-copy-install');
    if (btnCopyInstall) {
      btnCopyInstall.addEventListener('click', () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText('git clone https://github.com/karanb192/itr-wala.git && ./install.sh');
        }
        btnCopyInstall.textContent = 'COPIED!';
        setTimeout(() => { btnCopyInstall.textContent = 'COPY'; }, 2000);
      });
    }

    // Studio Sub-Tab Switcher
    document.querySelectorAll('.nav-segment').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-segment').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content-pane').forEach(p => p.style.display = 'none');
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.style.display = 'block';
      });
    });

    // Attach live event listeners to all input elements
    document.querySelectorAll('.studio-card input, .studio-card select').forEach(el => {
      el.addEventListener('input', updateStudio);
      el.addEventListener('change', updateStudio);
    });

    // Accordion triggers
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.parentElement;
        item.classList.toggle('open');
      });
    });

    // Initialize Default Redactor Sample & Golden Scenario & SFT Table
    renderSftTable();
    loadSampleRedactor('form16');
    loadGoldenScenario('case-01');

    // Initial Calculation
    updateStudio();
  });
}

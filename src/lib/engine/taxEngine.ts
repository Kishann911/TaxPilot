/**
 * TaxPilot - Authoritative TypeScript Statutory Calculation Engine
 * FY 2025-26 (AY 2026-27) - Resident Individuals
 *
 * 100% Deterministic Mathematical Parity with core tax engine
 * Built & Maintained by Kishan Ojha
 */

import {
  FY,
  AY,
  NEW_REGIME,
  OLD_REGIME,
  RATE_STCG_111A,
  RATE_LTCG_112A,
  LTCG_112A_EXEMPT,
  RATE_LTCG_OTHER,
  RATE_VDA,
  RATE_WINNINGS,
  SURCHARGE_CAP_SPECIAL,
  CESS_RATE,
  CAP_57IIA_NEW,
  CAP_57IIA_OLD,
  CAP_80C,
  CAP_80CCD_1B,
  CAP_80TTA,
  CAP_80TTB,
  CAP_HP_LOSS_SETOFF,
  CAP_PROFESSIONAL_TAX,
  FEE_234F_HIGH,
  FEE_234F_LOW,
  FEE_234F_INCOME_CUTOFF,
  ADVANCE_TAX_MIN,
} from "./constants";

import type {
  TaxInputPayload,
  RegimeComputation,
  TaxComputationResult,
  SlabTierBreakdown,
  SpecialTaxBreakdown,
  RegimeChoice,
  AgeCategory,
} from "./types";

// --- Statutory Helper Functions ---

/** Round to nearest 10 (s. 288A/288B), half-up with float residue quantization */
export function roundTo10(x: number): number {
  const roundedPaisa = Math.round((x + Number.EPSILON) * 100) / 100;
  return Math.floor((roundedPaisa + 5) / 10) * 10;
}

/** Rule 119A: interest base rounded down to a multiple of 100 */
export function floorTo100(x: number): number {
  const roundedPaisa = Math.round((x + Number.EPSILON) * 100) / 100;
  return Math.floor(roundedPaisa / 100) * 100;
}

export function pos(x: number | undefined | null): number {
  return Math.max(0, Number(x) || 0);
}

function parseDate(dStr?: string): Date | null {
  if (!dStr) return null;
  const parts = dStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return null;
}

/**
 * Months between two dates for 234A/234B.
 * Every whole month or part of a month counts as 1 full month.
 */
function monthsBetween(start: Date, end: Date): number {
  if (end <= start) return 0;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() > start.getDate()) {
    months += 1;
  }
  return Math.max(1, months);
}

// --- Slabs Calculation ---

function computeSlabTax(
  income: number,
  slabs: { max: number | null; rate: number; label: string }[]
): { totalTax: number; breakdown: SlabTierBreakdown[] } {
  let tax = 0;
  let lower = 0;
  const breakdown: SlabTierBreakdown[] = [];

  for (const tier of slabs) {
    const upper = tier.max;
    const rate = tier.rate;

    if (upper === null || income <= upper) {
      const taxable = pos(income - lower);
      const tierTax = taxable * rate;
      tax += tierTax;
      breakdown.push({
        label: tier.label,
        rate: `${rate * 100}%`,
        taxableAmount: taxable,
        tax: tierTax,
      });
      break;
    } else {
      const taxable = upper - lower;
      const tierTax = taxable * rate;
      tax += tierTax;
      breakdown.push({
        label: tier.label,
        rate: `${rate * 100}%`,
        taxableAmount: taxable,
        tax: tierTax,
      });
      lower = upper;
    }
  }

  return { totalTax: tax, breakdown };
}

// --- Heads of Income Computations ---

function computeSalary(inp: TaxInputPayload, regime: RegimeChoice, warnings: string[]) {
  const sal = inp.income?.salary || {};
  const gross = pos(sal.gross);
  if (gross === 0) {
    return { net: 0, gross: 0, stdDeduction: 0, exempt: 0 };
  }

  // Retirement exemptions: gratuity, commuted pension, leave encashment
  const retExempt =
    pos(sal.gratuity_exempt) +
    pos(sal.commuted_pension_exempt) +
    pos(sal.leave_encashment_exempt);

  let exemptAllowances = 0;
  let pt = 0;
  let stdDed = 0;

  if (regime === "new") {
    // Under s.115BAC, allowances are non-exempt, but retirement exemptions survive
    const base = pos(gross - retExempt);
    stdDed = Math.min(base, NEW_REGIME.standard_deduction);
    const net = pos(base - stdDed);
    return { net, gross, stdDeduction: stdDed, exempt: retExempt };
  } else {
    // Old regime
    exemptAllowances = pos(sal.exempt_allowances) + pos(sal.hra);
    pt = Math.min(pos(sal.professional_tax), CAP_PROFESSIONAL_TAX);
    const totalExempt = retExempt + exemptAllowances + pt;
    const afterExempt = pos(gross - totalExempt);
    stdDed = Math.min(afterExempt, OLD_REGIME.standard_deduction);
    const net = pos(afterExempt - stdDed);
    return { net, gross, stdDeduction: stdDed, exempt: totalExempt };
  }
}

function computeHouseProperty(inp: TaxInputPayload, regime: RegimeChoice, warnings: string[]) {
  const props = inp.income?.house_property || [];
  if (!props.length) return { income: 0, loss: 0 };

  let totalIncome = 0;
  let totalLoss = 0;

  for (const p of props) {
    if (p.type === "self_occupied") {
      const intPaid = pos(p.interest_paid);
      if (regime === "new") {
        if (intPaid > 0) {
          warnings.push("New regime: s.24(b) deduction on self-occupied house property is NOT allowed.");
        }
      } else {
        const allowedInt = Math.min(intPaid, 200000);
        totalLoss += allowedInt;
      }
    } else {
      // Let-out property
      const rent = pos(p.rent_received);
      const muni = pos(p.municipal_taxes);
      const nav = pos(rent - muni);
      const std30 = nav * 0.3;
      const intPaid = pos(p.interest_paid);
      const propIncome = nav - std30 - intPaid;

      if (propIncome < 0) {
        totalLoss += Math.abs(propIncome);
      } else {
        totalIncome += propIncome;
      }
    }
  }

  const rawNet = totalIncome - totalLoss;
  if (regime === "new") {
    // s.71(2A): loss from house property cannot be set off against any other head under new regime
    return { income: Math.max(0, rawNet), loss: 0 };
  } else {
    // Old regime: capped inter-head set-off at 2,00,000 u/s 71(3A)
    const net = rawNet < -CAP_HP_LOSS_SETOFF ? -CAP_HP_LOSS_SETOFF : rawNet;
    return { income: net, loss: rawNet < 0 ? Math.min(Math.abs(rawNet), CAP_HP_LOSS_SETOFF) : 0 };
  }
}

function computeCapitalGains(inp: TaxInputPayload) {
  const cg = inp.income?.capital_gains || {};
  return {
    stcg_111a: pos(cg.stcg_111a),
    ltcg_112a: pos(cg.ltcg_112a),
    ltcg_other: pos(cg.ltcg_other),
    stcg_slab: pos(cg.stcg_slab),
    vda: pos(cg.vda),
  };
}

function computeOtherSources(inp: TaxInputPayload, regime: RegimeChoice, warnings: string[]) {
  const os = inp.income?.other_sources || {};
  const savings = pos(os.savings_interest);
  const fd = pos(os.fd_interest);
  const dividends = pos(os.dividends);
  const other = pos(os.other);
  const winnings = pos(os.winnings);
  const fpGross = pos(os.family_pension);

  let fpDed = 0;
  if (fpGross > 0) {
    const oneThird = fpGross / 3.0;
    const cap = regime === "new" ? CAP_57IIA_NEW : CAP_57IIA_OLD;
    fpDed = Math.min(oneThird, cap);
  }
  const fpNet = pos(fpGross - fpDed);

  const slabTotal = savings + fd + dividends + other + fpNet;
  return {
    savings_interest: savings,
    fd_interest: fd,
    dividends,
    other,
    family_pension_net: fpNet,
    total_slab: slabTotal,
    winnings,
  };
}

function computeAllowedDeductions(
  inp: TaxInputPayload,
  regime: RegimeChoice,
  otherSources: { savings_interest: number; fd_interest: number },
  warnings: string[]
): Record<string, number> {
  const d = inp.deductions || {};
  const salGross = pos(inp.income?.salary?.gross);
  const age = inp.age_category || "regular";

  if (regime === "new") {
    // Only s.80CCD(2) allowed under New Regime (up to 14% of salary)
    const npsClaim = pos(d["80ccd_2"]);
    const maxNps = salGross > 0 ? salGross * NEW_REGIME.nps_80ccd2_pct : npsClaim;
    const allowed = Math.min(npsClaim, maxNps);
    return allowed > 0 ? { "80ccd_2": allowed } : {};
  }

  // Old Regime Deductions
  const out: Record<string, number> = {};

  // 80C
  const c = pos(d["80c"]);
  out["80c"] = Math.min(c, CAP_80C);

  // 80CCD(1B) Self NPS
  out["80ccd_1b"] = Math.min(pos(d["80ccd_1b"]), CAP_80CCD_1B);

  // 80CCD(2) Employer NPS (10% Old regime private)
  const nps2 = pos(d["80ccd_2"]);
  const maxNpsOld = salGross > 0 ? salGross * OLD_REGIME.nps_80ccd2_pct : nps2;
  out["80ccd_2"] = Math.min(nps2, maxNpsOld);

  // 80D Mediclaim
  const dSelf = pos(d["80d_self"]) || pos(d["80d"]);
  const dParents = pos(d["80d_parents"]);
  const maxSelf = age === "senior" || age === "super_senior" ? 50000 : 25000;
  out["80d"] = Math.min(dSelf, maxSelf) + Math.min(dParents, 50000);

  // 80TTA / 80TTB
  const savings = otherSources.savings_interest;
  const fd = otherSources.fd_interest;
  if (age === "senior" || age === "super_senior") {
    out["80tta_ttb"] = Math.min(pos(d["80tta_ttb"]) || savings + fd, CAP_80TTB, savings + fd);
  } else {
    out["80tta_ttb"] = Math.min(pos(d["80tta_ttb"]) || savings, CAP_80TTA, savings);
  }

  // 80E, 80G, other
  if (pos(d["80e"])) out["80e"] = pos(d["80e"]);
  if (pos(d["80g"])) out["80g"] = pos(d["80g"]) * 0.5; // 50% qualifying
  if (pos(d.other)) out["other"] = pos(d.other);

  return Object.fromEntries(Object.entries(out).filter(([_, v]) => v > 0));
}

// --- Surcharge Computation with Capping & Marginal Relief ---

function computeSurcharge(
  regime: RegimeChoice,
  totalIncome: number,
  taxAfterRebate: number,
  specials: SpecialTaxBreakdown[],
  dividends: number
) {
  const cap = regime === "new" ? NEW_REGIME.surcharge_cap : OLD_REGIME.surcharge_cap;
  const specialCappedIncome = specials.filter((s) => s.rate <= RATE_STCG_111A).reduce((acc, s) => acc + s.income, 0);
  const exclIncome = pos(totalIncome - dividends - specialCappedIncome);

  const T50 = 5000000;
  const T1CR = 10000000;
  const T2CR = 20000000;
  const T5CR = 50000000;

  if (totalIncome <= T50) {
    return { surcharge: 0, relief: 0, rate: 0 };
  }

  let rate = 0;
  let belowRate = 0;
  let threshold = T50;

  if (exclIncome > T5CR) {
    rate = Math.min(0.37, cap);
    belowRate = 0.25;
    threshold = T5CR;
  } else if (exclIncome > T2CR) {
    rate = 0.25;
    belowRate = 0.15;
    threshold = T2CR;
  } else if (totalIncome > T1CR) {
    rate = 0.15;
    belowRate = 0.10;
    threshold = T1CR;
  } else {
    rate = 0.10;
    belowRate = 0.0;
    threshold = T50;
  }

  // Calculate surcharged tax respecting 15% ceiling on CG/dividends
  let surcharge = 0;
  for (const s of specials) {
    const sRate = s.section.includes("111A") || s.section.includes("112") ? Math.min(rate, SURCHARGE_CAP_SPECIAL) : rate;
    surcharge += s.tax * sRate;
  }
  // Slab tax portion: dividends capped at 15%
  const divTaxEstimate = Math.min(dividends * 0.3, taxAfterRebate);
  const slabTaxRest = pos(taxAfterRebate - divTaxEstimate);
  surcharge += divTaxEstimate * Math.min(rate, SURCHARGE_CAP_SPECIAL) + slabTaxRest * rate;

  // Marginal relief on surcharge
  let relief = 0;
  const excess = totalIncome - threshold;
  if (excess > 0 && belowRate >= 0) {
    const taxAtThreshold = taxAfterRebate * (1 + belowRate);
    const taxCurrent = taxAfterRebate + surcharge;
    if (taxCurrent - taxAtThreshold > excess) {
      relief = taxCurrent - taxAtThreshold - excess;
    }
  }

  return {
    surcharge: Math.max(0, surcharge),
    relief: Math.max(0, relief),
    rate,
  };
}

// --- Core Single-Regime Computation Engine ---

function computeSingleRegime(inp: TaxInputPayload, regime: RegimeChoice): RegimeComputation {
  const warnings: string[] = [];
  const age = inp.age_category || "regular";
  const slabs = regime === "new" ? NEW_REGIME.slabs : OLD_REGIME.slabs_by_age[age];
  const basicExemption = regime === "new" ? NEW_REGIME.basic_exemption : slabs[0].max!;

  // 1. Compute Heads
  const sal = computeSalary(inp, regime, warnings);
  const hp = computeHouseProperty(inp, regime, warnings);
  const cg = computeCapitalGains(inp);
  const os = computeOtherSources(inp, regime, warnings);
  const business = pos(inp.income?.business_presumptive_income);

  const specialTotal = cg.stcg_111a + cg.ltcg_112a + cg.ltcg_other + cg.vda + os.winnings;
  const slabGrossRaw = sal.net + hp.income + cg.stcg_slab + os.total_slab + business;

  // Set-off house property loss against capital gains if slabRaw < 0
  const hpResidual = pos(-slabGrossRaw);
  const slabGross = pos(slabGrossRaw);
  let setoff = 0;
  const rem = { "111a": cg.stcg_111a, "112a": cg.ltcg_112a, "112": cg.ltcg_other };

  if (hpResidual > 0) {
    for (const k of ["111a", "112a", "112"] as const) {
      const room = hpResidual - setoff;
      if (room <= 0) break;
      const take = Math.min(room, rem[k]);
      rem[k] -= take;
      setoff += take;
    }
  }
  const specialTotalNet = pos(specialTotal - setoff);

  // 2. Deductions
  const deductionsMap = computeAllowedDeductions(inp, regime, os, warnings);
  let deductionsTotal = Object.values(deductionsMap).reduce((a, b) => a + b, 0);
  deductionsTotal = Math.min(deductionsTotal, slabGross); // Chapter VI-A cannot offset special CG
  const taxableSlabIncome = pos(slabGross - deductionsTotal);
  const totalIncome = roundTo10(taxableSlabIncome + specialTotalNet);

  // 3. Slab Tax & Unexhausted Basic Exemption Absorption
  const { totalTax: rawSlabTax, breakdown: slabBreakdown } = computeSlabTax(taxableSlabIncome, slabs);
  const unusedBasicExemption = pos(basicExemption - taxableSlabIncome);

  // Absorption helper
  function evaluateAbsorption(order: ("111a" | "112a" | "112")[]) {
    const t = {
      "111a": rem["111a"],
      "112a": pos(rem["112a"] - LTCG_112A_EXEMPT),
      "112": rem["112"],
    };
    let ube = unusedBasicExemption;
    for (const key of order) {
      if (ube <= 0) break;
      const take = Math.min(ube, t[key]);
      t[key] -= take;
      ube -= take;
    }

    const specials: SpecialTaxBreakdown[] = [
      { section: "111A STCG (equity 20%)", income: cg.stcg_111a, taxable: t["111a"], rate: RATE_STCG_111A, tax: t["111a"] * RATE_STCG_111A },
      { section: "112A LTCG (equity 12.5%)", income: cg.ltcg_112a, taxable: t["112a"], rate: RATE_LTCG_112A, tax: t["112a"] * RATE_LTCG_112A },
      { section: "112 LTCG (other 12.5%)", income: cg.ltcg_other, taxable: t["112"], rate: RATE_LTCG_OTHER, tax: t["112"] * RATE_LTCG_OTHER },
      { section: "115BBH VDA/crypto (30%)", income: cg.vda, taxable: cg.vda, rate: RATE_VDA, tax: cg.vda * RATE_VDA },
      { section: "115BB Winnings (30%)", income: os.winnings, taxable: os.winnings, rate: RATE_WINNINGS, tax: os.winnings * RATE_WINNINGS },
    ].filter((s) => s.income > 0);

    const specialTaxTotal = specials.reduce((acc, s) => acc + s.tax, 0);

    // Section 87A Rebate & Marginal Relief
    let rebate87a = 0;
    let marginalRelief87a = 0;

    if (regime === "new") {
      const slabR = roundTo10(taxableSlabIncome);
      if (slabR <= NEW_REGIME.rebate_87a_limit) {
        rebate87a = Math.min(rawSlabTax, NEW_REGIME.rebate_87a_max);
      } else if (slabR <= 1275000) {
        const excess = slabR - NEW_REGIME.rebate_87a_limit;
        if (rawSlabTax > excess) {
          marginalRelief87a = rawSlabTax - excess;
        }
      }
    } else {
      if (totalIncome <= OLD_REGIME.rebate_87a_limit) {
        // Old regime: 87A applies to slab + 111A/112 tax (excludes 112A and VDA)
        const tax112a = specials.find((s) => s.section.includes("112A"))?.tax || 0;
        const taxVda = specials.find((s) => s.section.includes("115BBH"))?.tax || 0;
        const taxEligible = pos(rawSlabTax + specialTaxTotal - tax112a - taxVda);
        rebate87a = Math.min(taxEligible, OLD_REGIME.rebate_87a_max);
      }
    }

    const netTaxAfterRebate = pos(rawSlabTax + specialTaxTotal - rebate87a - marginalRelief87a);
    return { specials, specialTaxTotal, rebate87a, marginalRelief87a, netTaxAfterRebate };
  }

  // Permutation test for optimal absorption in Old Regime
  let chosen = evaluateAbsorption(["111a", "112a", "112"]);
  if (regime === "old" && unusedBasicExemption > 0) {
    const orders: ("111a" | "112a" | "112")[][] = [
      ["111a", "112a", "112"],
      ["111a", "112", "112a"],
      ["112a", "111a", "112"],
      ["112a", "112", "111a"],
      ["112", "111a", "112a"],
      ["112", "112a", "111a"],
    ];
    for (const ord of orders) {
      const cand = evaluateAbsorption(ord);
      if (cand.netTaxAfterRebate < chosen.netTaxAfterRebate - 0.005) {
        chosen = cand;
      }
    }
  }

  // 4. Surcharge & Cess
  const surchargeCalc = computeSurcharge(
    regime,
    totalIncome,
    chosen.netTaxAfterRebate,
    chosen.specials,
    os.dividends
  );

  const taxBeforeCess = chosen.netTaxAfterRebate + surchargeCalc.surcharge - surchargeCalc.relief;
  const cess = taxBeforeCess * CESS_RATE;
  const relief89 = pos(inp.relief_89);
  const totalTaxLiability = roundTo10(pos(taxBeforeCess + cess - relief89));

  // 5. Taxes Paid, TDS, Advance Tax & Section 234 Interest
  const tp = inp.taxes_paid || {};
  const tds = pos(tp.tds) || (pos(tp.tds_salary) + pos(tp.tds_other));
  const tcs = pos(tp.tcs);
  const tdsTcs = tds + tcs;

  const advanceList = tp.advance_tax || [];
  const advanceTotal = advanceList.reduce((acc, a) => acc + pos(a.amount), 0);
  const totalPrepaid = tdsTcs + advanceTotal;

  const dueDate = parseDate(inp.due_date) || new Date(2026, 6, 31);
  const filingDate = parseDate(inp.filing_date) || new Date(2026, 6, 28);
  const isLate = filingDate > dueDate;

  // Section 234F Late Filing Fee
  let fee234F = 0;
  if (isLate && totalIncome > basicExemption) {
    fee234F = totalIncome <= FEE_234F_INCOME_CUTOFF ? FEE_234F_LOW : FEE_234F_HIGH;
  }

  // Section 234A/B/C Interest
  const assessedTax = pos(totalTaxLiability - relief89 - tdsTcs);
  let interest234A = 0;
  let interest234B = 0;
  let interest234C = 0;

  // Senior citizen exemption u/s 207(2)
  const isSeniorExempt = (age === "senior" || age === "super_senior") && business === 0;

  if (isLate && assessedTax > advanceTotal) {
    const m = monthsBetween(dueDate, filingDate);
    interest234A = Math.round(floorTo100(assessedTax - advanceTotal) * 0.01 * m);
  }

  if (assessedTax >= ADVANCE_TAX_MIN && !isSeniorExempt) {
    // 234B: shortfall below 90% of assessed tax
    if (advanceTotal < 0.9 * assessedTax) {
      const fyEnd = new Date(2026, 2, 31);
      const m = monthsBetween(fyEnd, filingDate);
      interest234B = Math.round(floorTo100(assessedTax - advanceTotal) * 0.01 * m);
    }

    // 234C: deferment installments
    if (business > 0 && sal.gross === 0 && cg.stcg_111a === 0 && cg.ltcg_112a === 0) {
      // Presumptive-only filers: single 15 March 100% installment (s. 234C(1)(b))
      if (advanceTotal < assessedTax) {
        interest234C = Math.round(floorTo100(assessedTax - advanceTotal) * 0.01 * 1);
      }
    } else {
      const checkpoints = [
        { pct: 0.15, safe: 0.12, months: 3 },
        { pct: 0.45, safe: 0.36, months: 3 },
        { pct: 0.75, safe: 0.75, months: 3 },
        { pct: 1.00, safe: 1.00, months: 1 },
      ];
      let cumPaid = 0;
      for (let i = 0; i < 4; i++) {
        const advPaidInQ = pos(advanceList[i]?.amount);
        cumPaid += advPaidInQ;
        const target = assessedTax * checkpoints[i].pct;
        const safe = assessedTax * checkpoints[i].safe;
        if (cumPaid < safe) {
          interest234C += Math.round(floorTo100(target - cumPaid) * 0.01 * checkpoints[i].months);
        }
      }
    }
  }

  const finalPayableOrRefund = roundTo10(
    totalTaxLiability + fee234F + interest234A + interest234B + interest234C - totalPrepaid
  );

  return {
    regime,
    gross_total_income: roundTo10(slabGross + specialTotalNet),
    deductions_total: deductionsTotal,
    total_income: totalIncome,
    tax: {
      slab_income: taxableSlabIncome,
      slab_tax: roundTo10(rawSlabTax),
      special: chosen.specials,
      special_tax: roundTo10(chosen.specialTaxTotal),
      rebate_87a: roundTo10(chosen.rebate87a),
      marginal_relief_87a: roundTo10(chosen.marginalRelief87a),
      tax_after_rebate: roundTo10(chosen.netTaxAfterRebate),
      surcharge_rate: surchargeCalc.rate,
      surcharge: roundTo10(surchargeCalc.surcharge),
      surcharge_marginal_relief: roundTo10(surchargeCalc.relief),
      cess: roundTo10(cess),
      relief_89: relief89,
      total_tax_liability: totalTaxLiability,
    },
    interest_and_fees: {
      assessed_tax: assessedTax,
      advance_tax_total: advanceTotal,
      tds_tcs_total: tdsTcs,
      total_prepaid: totalPrepaid,
      "234A": interest234A,
      "234B": interest234B,
      "234C": interest234C,
      "234F": fee234F,
      final_payable_or_refund: finalPayableOrRefund,
    },
    slab_breakdown: slabBreakdown,
    warnings,
  };
}

/**
 * Authoritative Universal Tax Calculation Entrypoint
 */
export function computeTax(inp: TaxInputPayload): TaxComputationResult {
  const dueDate = parseDate(inp.due_date) || new Date(2026, 6, 31);
  const filingDate = parseDate(inp.filing_date) || new Date(2026, 6, 28);
  const isBelated = filingDate > dueDate;

  const resNew = computeSingleRegime(inp, "new");
  const resOld = computeSingleRegime(inp, "old");

  let recommended: RegimeChoice = "new";
  if (isBelated) {
    // Under s.115BAC(6), cannot opt out into old regime after statutory due date
    recommended = "new";
  } else {
    recommended = resNew.tax.total_tax_liability <= resOld.tax.total_tax_liability ? "new" : "old";
  }

  const savings = Math.abs(resOld.tax.total_tax_liability - resNew.tax.total_tax_liability);

  return {
    assessment_year: AY,
    financial_year: FY,
    recommended_regime: recommended,
    savings,
    is_belated: isBelated,
    new: resNew,
    old: resOld,
  };
}

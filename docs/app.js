/**
 * TaxSarthi - Deterministic Indian Income Tax (ITR) Web Engine & Interactive Studio
 * Assessment Year: 2026-27 (Financial Year: 2025-26)
 */

// --- Indian Rupee Formatter ---
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const s = absVal.toString();
  let lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  if (otherNumbers !== '') lastThree = ',' + lastThree;
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return (isNegative ? "-₹" : "₹") + res;
}

// --- Deterministic Tax Calculation Core (FY 2025-26 / AY 2026-27) ---
function calculateTaxes(inputs) {
  const {
    salaryGross = 0,
    hraExemption = 0,
    freelanceGross = 0,
    presumptiveRate = 0.5,
    stcg111a = 0,
    ltcg112a = 0,
    vdaCrypto = 0,
    interestSavings = 0,
    interestFd = 0,
    ded80c = 0,
    ded80d = 0,
    dedNps = 0,
    homeLoan24b = 0,
    tdsPaid = 0,
    advanceTaxPaid = 0,
    ageCategory = 'regular' // regular (<60), senior (60-79), super_senior (80+)
  } = inputs;

  const presumptiveIncome = freelanceGross * presumptiveRate;
  const otherSources = interestSavings + interestFd;

  // ----------------------------------------------------
  // 1. NEW REGIME (Default u/s 115BAC)
  // ----------------------------------------------------
  const stdDeductionNew = salaryGross > 0 ? Math.min(75000, salaryGross) : 0;
  const netSalaryNew = Math.max(0, salaryGross - stdDeductionNew);
  
  // Total Slab Income (excluding special rate capital gains & crypto)
  const slabGrossNew = netSalaryNew + presumptiveIncome + otherSources;
  
  // New regime does not allow 80C, 80D, 80CCD(1B) or 24(b) self-occupied
  const taxableSlabIncomeNew = Math.max(0, slabGrossNew);

  // New Regime Slabs AY 2026-27
  let taxOnSlabNew = 0;
  const slabsNew = [
    { limit: 400000, rate: 0.00 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 }
  ];

  let prevLimit = 0;
  for (const slab of slabsNew) {
    if (taxableSlabIncomeNew > prevLimit) {
      const taxableChunk = Math.min(taxableSlabIncomeNew, slab.limit) - prevLimit;
      taxOnSlabNew += taxableChunk * slab.rate;
      prevLimit = slab.limit;
    } else {
      break;
    }
  }

  // Section 87A Rebate & Marginal Relief (New Regime threshold 12,00,000)
  let rebate87aNew = 0;
  if (taxableSlabIncomeNew <= 1200000) {
    rebate87aNew = Math.min(taxOnSlabNew, 60000);
  } else if (taxableSlabIncomeNew > 1200000 && taxableSlabIncomeNew <= 1275000) {
    // Marginal relief: Tax on slab cannot exceed (taxableSlabIncome - 12,00,000)
    const excessIncome = taxableSlabIncomeNew - 1200000;
    if (taxOnSlabNew > excessIncome) {
      rebate87aNew = taxOnSlabNew - excessIncome;
    }
  }

  const taxAfterRebateNew = Math.max(0, taxOnSlabNew - rebate87aNew);

  // Special Rate Taxes:
  // 111A STCG @ 20%
  const taxStcg111a = stcg111a * 0.20;
  
  // 112A LTCG @ 12.5% with 1.25L statutory exemption
  const exemptLtcg112a = Math.min(ltcg112a, 125000);
  const taxableLtcg112a = Math.max(0, ltcg112a - exemptLtcg112a);
  const taxLtcg112a = taxableLtcg112a * 0.125;

  // VDA / Crypto @ 30%
  const taxVda = vdaCrypto * 0.30;

  const totalSpecialTax = taxStcg111a + taxLtcg112a + taxVda;
  const baseTaxLiabilityNew = taxAfterRebateNew + totalSpecialTax;

  // Surcharge New Regime: >50L: 10%, >1Cr: 15%, >2Cr: 25% (Cap 25%)
  const totalIncomeNew = taxableSlabIncomeNew + taxableLtcg112a + stcg111a + vdaCrypto;
  let surchargeRateNew = 0;
  if (totalIncomeNew > 20000000) surchargeRateNew = 0.25;
  else if (totalIncomeNew > 10000000) surchargeRateNew = 0.15;
  else if (totalIncomeNew > 5000000) surchargeRateNew = 0.10;

  const surchargeNew = baseTaxLiabilityNew * surchargeRateNew;
  const cessNew = (baseTaxLiabilityNew + surchargeNew) * 0.04;
  
  // Section 288B Rounding
  const finalTaxNew = Math.round((baseTaxLiabilityNew + surchargeNew + cessNew) / 10) * 10;
  const totalTaxesPaid = tdsPaid + advanceTaxPaid;
  const netPayableNew = finalTaxNew - totalTaxesPaid;

  // ----------------------------------------------------
  // 2. OLD REGIME (Optional with Deductions)
  // ----------------------------------------------------
  const stdDeductionOld = salaryGross > 0 ? Math.min(50000, salaryGross) : 0;
  const netSalaryOld = Math.max(0, salaryGross - stdDeductionOld - hraExemption);
  
  // Deductions Chapter VI-A
  const claim80c = Math.min(150000, ded80c);
  const claim80d = Math.min(100000, ded80d);
  const claimNps = Math.min(50000, dedNps);
  const claim24b = Math.min(200000, homeLoan24b);
  
  // 80TTA / 80TTB
  const claimTta = ageCategory === 'senior' ? Math.min(50000, otherSources) : Math.min(10000, interestSavings);

  const totalDeductionsOld = claim80c + claim80d + claimNps + claim24b + claimTta;

  const slabGrossOld = netSalaryOld + presumptiveIncome + otherSources;
  const taxableSlabIncomeOld = Math.max(0, slabGrossOld - totalDeductionsOld);

  // Old Regime Slabs by Age
  let basicExemptionOld = 250000;
  if (ageCategory === 'senior') basicExemptionOld = 300000;
  if (ageCategory === 'super_senior') basicExemptionOld = 500000;

  let taxOnSlabOld = 0;
  if (ageCategory === 'super_senior') {
    if (taxableSlabIncomeOld > 1000000) {
      taxOnSlabOld = (500000 * 0.20) + ((taxableSlabIncomeOld - 1000000) * 0.30);
    } else if (taxableSlabIncomeOld > 500000) {
      taxOnSlabOld = (taxableSlabIncomeOld - 500000) * 0.20;
    }
  } else if (ageCategory === 'senior') {
    if (taxableSlabIncomeOld > 1000000) {
      taxOnSlabOld = (200000 * 0.05) + (500000 * 0.20) + ((taxableSlabIncomeOld - 1000000) * 0.30);
    } else if (taxableSlabIncomeOld > 500000) {
      taxOnSlabOld = (200000 * 0.05) + ((taxableSlabIncomeOld - 500000) * 0.20);
    } else if (taxableSlabIncomeOld > 300000) {
      taxOnSlabOld = (taxableSlabIncomeOld - 300000) * 0.05;
    }
  } else {
    // Regular (<60)
    if (taxableSlabIncomeOld > 1000000) {
      taxOnSlabOld = (250000 * 0.05) + (500000 * 0.20) + ((taxableSlabIncomeOld - 1000000) * 0.30);
    } else if (taxableSlabIncomeOld > 500000) {
      taxOnSlabOld = (250000 * 0.05) + ((taxableSlabIncomeOld - 500000) * 0.20);
    } else if (taxableSlabIncomeOld > 250000) {
      taxOnSlabOld = (taxableSlabIncomeOld - 250000) * 0.05;
    }
  }

  // Rebate 87A Old Regime (Max 12,500 up to 5,00,000)
  let rebate87aOld = 0;
  if (taxableSlabIncomeOld <= 500000) {
    rebate87aOld = Math.min(taxOnSlabOld, 12500);
  }

  const taxAfterRebateOld = Math.max(0, taxOnSlabOld - rebate87aOld);
  const baseTaxLiabilityOld = taxAfterRebateOld + totalSpecialTax;

  const totalIncomeOld = taxableSlabIncomeOld + taxableLtcg112a + stcg111a + vdaCrypto;
  let surchargeRateOld = 0;
  if (totalIncomeOld > 50000000) surchargeRateOld = 0.37;
  else if (totalIncomeOld > 20000000) surchargeRateOld = 0.25;
  else if (totalIncomeOld > 10000000) surchargeRateOld = 0.15;
  else if (totalIncomeOld > 5000000) surchargeRateOld = 0.10;

  const surchargeOld = baseTaxLiabilityOld * surchargeRateOld;
  const cessOld = (baseTaxLiabilityOld + surchargeOld) * 0.04;
  const finalTaxOld = Math.round((baseTaxLiabilityOld + surchargeOld + cessOld) / 10) * 10;
  const netPayableOld = finalTaxOld - totalTaxesPaid;

  const savings = Math.abs(finalTaxOld - finalTaxNew);
  const recommended = finalTaxNew <= finalTaxOld ? 'new' : 'old';

  return {
    newRegime: {
      grossTotal: salaryGross + freelanceGross + otherSources + stcg111a + ltcg112a + vdaCrypto,
      stdDeduction: stdDeductionNew,
      taxableIncome: totalIncomeNew,
      taxOnSlab: taxOnSlabNew,
      rebate87a: rebate87aNew,
      specialTaxes: totalSpecialTax,
      surcharge: surchargeNew,
      cess: cessNew,
      totalTax: finalTaxNew,
      netPayable: netPayableNew
    },
    oldRegime: {
      grossTotal: salaryGross + freelanceGross + otherSources + stcg111a + ltcg112a + vdaCrypto,
      stdDeduction: stdDeductionOld,
      hraExemption: hraExemption,
      totalDeductions: totalDeductionsOld,
      taxableIncome: totalIncomeOld,
      taxOnSlab: taxOnSlabOld,
      rebate87a: rebate87aOld,
      specialTaxes: totalSpecialTax,
      surcharge: surchargeOld,
      cess: cessOld,
      totalTax: finalTaxOld,
      netPayable: netPayableOld
    },
    recommended,
    savings
  };
}

// --- UI Interaction & Studio Binding ---
document.addEventListener('DOMContentLoaded', () => {
  // Theme management
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('taxsarthi_theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('taxsarthi_theme', next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  // Input listeners
  const inputIds = [
    'inp-salary', 'inp-hra', 'inp-freelance', 'inp-stcg',
    'inp-ltcg', 'inp-crypto', 'inp-interest', 'inp-80c',
    'inp-80d', 'inp-nps', 'inp-homeloan', 'inp-tds', 'inp-advtax'
  ];

  function getInputs() {
    return {
      salaryGross: parseFloat(document.getElementById('inp-salary')?.value) || 0,
      hraExemption: parseFloat(document.getElementById('inp-hra')?.value) || 0,
      freelanceGross: parseFloat(document.getElementById('inp-freelance')?.value) || 0,
      stcg111a: parseFloat(document.getElementById('inp-stcg')?.value) || 0,
      ltcg112a: parseFloat(document.getElementById('inp-ltcg')?.value) || 0,
      vdaCrypto: parseFloat(document.getElementById('inp-crypto')?.value) || 0,
      interestSavings: parseFloat(document.getElementById('inp-interest')?.value) || 0,
      ded80c: parseFloat(document.getElementById('inp-80c')?.value) || 0,
      ded80d: parseFloat(document.getElementById('inp-80d')?.value) || 0,
      dedNps: parseFloat(document.getElementById('inp-nps')?.value) || 0,
      homeLoan24b: parseFloat(document.getElementById('inp-homeloan')?.value) || 0,
      tdsPaid: parseFloat(document.getElementById('inp-tds')?.value) || 0,
      advanceTaxPaid: parseFloat(document.getElementById('inp-advtax')?.value) || 0
    };
  }

  function updateStudio() {
    const inputs = getInputs();
    const result = calculateTaxes(inputs);

    // Update Winner Banner
    const winnerRegimeEl = document.getElementById('res-winner-regime');
    const winnerSavingsEl = document.getElementById('res-winner-savings');
    if (winnerRegimeEl) {
      winnerRegimeEl.textContent = result.recommended === 'new' ? 'NEW REGIME RECOMMENDED' : 'OLD REGIME RECOMMENDED';
    }
    if (winnerSavingsEl) {
      winnerSavingsEl.textContent = `Saves ${formatINR(result.savings)}`;
    }

    // Update New Regime Box
    const newBox = document.getElementById('regime-new-box');
    const oldBox = document.getElementById('regime-old-box');
    if (newBox && oldBox) {
      if (result.recommended === 'new') {
        newBox.classList.add('winner');
        oldBox.classList.remove('winner');
      } else {
        oldBox.classList.add('winner');
        newBox.classList.remove('winner');
      }
    }

    // New Regime values
    document.getElementById('val-new-gross').textContent = formatINR(result.newRegime.grossTotal);
    document.getElementById('val-new-taxable').textContent = formatINR(result.newRegime.taxableIncome);
    document.getElementById('val-new-slabtax').textContent = formatINR(result.newRegime.taxOnSlab);
    document.getElementById('val-new-rebate').textContent = `-${formatINR(result.newRegime.rebate87a)}`;
    document.getElementById('val-new-special').textContent = formatINR(result.newRegime.specialTaxes);
    document.getElementById('val-new-cess').textContent = formatINR(result.newRegime.cess);
    document.getElementById('val-new-totaltax').textContent = formatINR(result.newRegime.totalTax);
    
    const newPayableEl = document.getElementById('val-new-netpayable');
    newPayableEl.textContent = formatINR(result.newRegime.netPayable);
    newPayableEl.style.color = result.newRegime.netPayable <= 0 ? '#34d399' : '#f87171';

    // Old Regime values
    document.getElementById('val-old-gross').textContent = formatINR(result.oldRegime.grossTotal);
    document.getElementById('val-old-deductions').textContent = `-${formatINR(result.oldRegime.totalDeductions + result.oldRegime.stdDeduction + result.oldRegime.hraExemption)}`;
    document.getElementById('val-old-taxable').textContent = formatINR(result.oldRegime.taxableIncome);
    document.getElementById('val-old-slabtax').textContent = formatINR(result.oldRegime.taxOnSlab);
    document.getElementById('val-old-rebate').textContent = `-${formatINR(result.oldRegime.rebate87a)}`;
    document.getElementById('val-old-special').textContent = formatINR(result.oldRegime.specialTaxes);
    document.getElementById('val-old-cess').textContent = formatINR(result.oldRegime.cess);
    document.getElementById('val-old-totaltax').textContent = formatINR(result.oldRegime.totalTax);
    
    const oldPayableEl = document.getElementById('val-old-netpayable');
    oldPayableEl.textContent = formatINR(result.oldRegime.netPayable);
    oldPayableEl.style.color = result.oldRegime.netPayable <= 0 ? '#34d399' : '#f87171';
  }

  // Attach change listeners
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateStudio);
    }
  });

  // Preset loader
  window.loadPreset = function(type) {
    const presets = {
      salaried: {
        'inp-salary': 2400000,
        'inp-hra': 0,
        'inp-freelance': 0,
        'inp-stcg': 45000,
        'inp-ltcg': 160000,
        'inp-crypto': 0,
        'inp-interest': 76700,
        'inp-80c': 150000,
        'inp-80d': 25000,
        'inp-nps': 50000,
        'inp-homeloan': 180000,
        'inp-tds': 280000,
        'inp-advtax': 20000
      },
      freelancer: {

        'inp-salary': 0,
        'inp-hra': 0,
        'inp-freelance': 1800000,
        'inp-stcg': 80000,
        'inp-ltcg': 240000,
        'inp-crypto': 50000,
        'inp-interest': 15000,
        'inp-80c': 150000,
        'inp-80d': 25000,
        'inp-nps': 50000,
        'inp-homeloan': 180000,
        'inp-tds': 90000,
        'inp-advtax': 40000
      },
      senior: {
        'inp-salary': 0,
        'inp-hra': 0,
        'inp-freelance': 0,
        'inp-stcg': 0,
        'inp-ltcg': 80000,
        'inp-crypto': 0,
        'inp-interest': 420000,
        'inp-80c': 100000,
        'inp-80d': 50000,
        'inp-nps': 0,
        'inp-homeloan': 0,
        'inp-tds': 42000,
        'inp-advtax': 0
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
  };

  // Export computation pack as JSON
  window.exportComputationJSON = function() {
    const inputs = getInputs();
    const result = calculateTaxes(inputs);
    const exportData = {
      generator: "TaxSarthi v1.0.0",
      assessment_year: "2026-27",
      financial_year: "2025-26",
      generated_at: new Date().toISOString(),
      inputs,
      computation: result
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "taxsarthi-computation-ay2026-27.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Tab switching in Studio
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabTarget = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === tabTarget ? 'block' : 'none';
      });
    });
  });

  // Initial calculation
  updateStudio();
});

/**
 * TaxPilot - Statutory Constants for FY 2025-26 (AY 2026-27)
 * Authoritative statutory parameters based on the Income-tax Act, 1961
 * as amended by Finance (No. 2) Act 2024. Built & Maintained by Kishan Ojha.
 */

export const FY = "2025-26";
export const AY = "2026-27";

export const NEW_REGIME = {
  slabs: [
    { max: 400000, rate: 0.00, label: "Up to ₹4,00,000" },
    { max: 800000, rate: 0.05, label: "₹4,00,001 - ₹8,00,000" },
    { max: 1200000, rate: 0.10, label: "₹8,00,001 - ₹12,00,000" },
    { max: 1600000, rate: 0.15, label: "₹12,00,001 - ₹16,00,000" },
    { max: 2000000, rate: 0.20, label: "₹16,00,001 - ₹20,00,000" },
    { max: 2400000, rate: 0.25, label: "₹20,00,001 - ₹24,00,000" },
    { max: null, rate: 0.30, label: "Above ₹24,00,000" },
  ],
  standard_deduction: 75000,
  rebate_87a_limit: 1200000, // taxable slab-rate income threshold
  rebate_87a_max: 60000,
  basic_exemption: 400000,
  surcharge_cap: 0.25, // 37% tier does not apply in new regime
  nps_80ccd2_pct: 0.14, // 14% of basic + DA
};

export const OLD_REGIME = {
  slabs_by_age: {
    regular: [
      { max: 250000, rate: 0.00, label: "Up to ₹2,50,000" },
      { max: 500000, rate: 0.05, label: "₹2,50,001 - ₹5,00,000" },
      { max: 1000000, rate: 0.20, label: "₹5,00,001 - ₹10,00,000" },
      { max: null, rate: 0.30, label: "Above ₹10,00,000" },
    ],
    senior: [
      { max: 300000, rate: 0.00, label: "Up to ₹3,00,000" },
      { max: 500000, rate: 0.05, label: "₹3,00,001 - ₹5,00,000" },
      { max: 1000000, rate: 0.20, label: "₹5,00,001 - ₹10,00,000" },
      { max: null, rate: 0.30, label: "Above ₹10,00,000" },
    ],
    super_senior: [
      { max: 500000, rate: 0.00, label: "Up to ₹5,00,000" },
      { max: 1000000, rate: 0.20, label: "₹5,00,001 - ₹10,00,000" },
      { max: null, rate: 0.30, label: "Above ₹10,00,000" },
    ],
  },
  standard_deduction: 50000,
  rebate_87a_limit: 500000,
  rebate_87a_max: 12500,
  surcharge_cap: 0.37,
  nps_80ccd2_pct: 0.10, // private-sector employer in old regime
};

// Special-rate incomes, FY 2025-26
export const RATE_STCG_111A = 0.20; // STT-paid equity short-term gains
export const RATE_LTCG_112A = 0.125; // STT-paid equity long-term gains
export const LTCG_112A_EXEMPT = 125000; // First 1.25L of 112A gains exempt
export const RATE_LTCG_OTHER = 0.125; // s.112 (property/unlisted, transfers on/after 23-Jul-2024)
export const RATE_VDA = 0.30; // s.115BBH crypto/VDA - no basic-exemption set-off, no 87A
export const RATE_WINNINGS = 0.30; // s.115BB lottery / s.115BBJ online games

export const SURCHARGE_CAP_SPECIAL = 0.15; // ceiling on 111A/112A/112/dividend surcharge
export const CESS_RATE = 0.04; // 4% Health & Education Cess

// s.57(iia): family pension deduction, 1/3rd capped at:
export const CAP_57IIA_NEW = 25000;
export const CAP_57IIA_OLD = 15000;

// Chapter VI-A statutory caps (old regime)
export const CAP_80C = 150000;
export const CAP_80CCD_1B = 50000;
export const CAP_80TTA = 10000;
export const CAP_80TTB = 50000;
export const CAP_HP_LOSS_SETOFF = 200000; // s.71(3A) max let-out loss set-off
export const CAP_PROFESSIONAL_TAX = 5000; // constitutional ceiling (art. 276(2))

// Section 234F Late Filing Fee
export const FEE_234F_HIGH = 5000;
export const FEE_234F_LOW = 1000;
export const FEE_234F_INCOME_CUTOFF = 500000;

export const ADVANCE_TAX_MIN = 10000; // below this net liability, no 234B/234C

/**
 * TaxPilot - TypeScript Statutory Engine Types (AY 2026-27 / FY 2025-26)
 * Built & Maintained by Kishan Ojha
 */

export type AgeCategory = 'regular' | 'senior' | 'super_senior';
export type RegimeChoice = 'new' | 'old';

export interface SalaryInput {
  gross?: number;
  exempt_allowances?: number;
  professional_tax?: number;
  hra?: number;
  gratuity_exempt?: number;
  commuted_pension_exempt?: number;
  leave_encashment_exempt?: number;
}

export interface HousePropertyItem {
  type: 'self_occupied' | 'let_out';
  rent_received?: number;
  municipal_taxes?: number;
  interest_paid?: number;
}

export interface CapitalGainsInput {
  stcg_111a?: number;
  ltcg_112a?: number;
  ltcg_other?: number;
  stcg_slab?: number;
  vda?: number;
}

export interface OtherSourcesInput {
  savings_interest?: number;
  fd_interest?: number;
  dividends?: number;
  family_pension?: number;
  winnings?: number;
  other?: number;
}

export interface DeductionsInput {
  "80c"?: number;
  "80ccd_1b"?: number;
  "80ccd_2"?: number;
  "80d"?: number;
  "80d_self"?: number;
  "80d_parents"?: number;
  "80e"?: number;
  "80g"?: number;
  "80tta_ttb"?: number;
  other?: number;
}

export interface AdvanceTaxEntry {
  date: string;
  amount: number;
}

export interface TaxesPaidInput {
  tds?: number;
  tds_salary?: number;
  tds_other?: number;
  tcs?: number;
  advance_tax?: AdvanceTaxEntry[];
  self_assessment?: AdvanceTaxEntry[];
}

export interface TaxInputPayload {
  assessment_year?: string;
  financial_year?: string;
  regime?: 'both' | 'new' | 'old';
  age_category?: AgeCategory;
  due_date?: string;
  filing_date?: string;
  relief_89?: number;
  income?: {
    salary?: SalaryInput;
    house_property?: HousePropertyItem[];
    capital_gains?: CapitalGainsInput;
    other_sources?: OtherSourcesInput;
    business_presumptive_income?: number;
  };
  deductions?: DeductionsInput;
  taxes_paid?: TaxesPaidInput;
}

export interface SlabTierBreakdown {
  label: string;
  rate: string;
  taxableAmount: number;
  tax: number;
}

export interface SpecialTaxBreakdown {
  section: string;
  income: number;
  taxable: number;
  rate: number;
  tax: number;
}

export interface RegimeComputation {
  regime: RegimeChoice;
  gross_total_income: number;
  deductions_total: number;
  total_income: number;
  tax: {
    slab_income: number;
    slab_tax: number;
    special: SpecialTaxBreakdown[];
    special_tax: number;
    rebate_87a: number;
    marginal_relief_87a: number;
    tax_after_rebate: number;
    surcharge_rate: number;
    surcharge: number;
    surcharge_marginal_relief: number;
    cess: number;
    relief_89: number;
    total_tax_liability: number;
  };
  interest_and_fees: {
    assessed_tax: number;
    advance_tax_total: number;
    tds_tcs_total: number;
    total_prepaid: number;
    "234A": number;
    "234B": number;
    "234C": number;
    "234F": number;
    final_payable_or_refund: number;
  };
  slab_breakdown: SlabTierBreakdown[];
  warnings: string[];
}

export interface TaxComputationResult {
  assessment_year: string;
  financial_year: string;
  recommended_regime: RegimeChoice;
  savings: number;
  is_belated: boolean;
  new?: RegimeComputation;
  old?: RegimeComputation;
}

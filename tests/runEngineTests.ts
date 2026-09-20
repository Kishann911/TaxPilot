/**
 * TaxPilot - TypeScript Engine Verification Suite
 * Runs against Golden Scenarios to verify statutory math parity
 */

import assert from "node:assert";
import { computeTax } from "../src/lib/engine/taxEngine.js";

console.log("=================================================");
console.log("Running TaxPilot TypeScript Statutory Engine Tests");
console.log("=================================================");

function testMarginalRelief() {
  console.log("Test 1: Section 87A Marginal Relief Cliff (₹12,45,000 income)...");
  const res = computeTax({
    income: {
      salary: { gross: 1320000 },
    },
  });

  const n = res.new!;
  assert.strictEqual(n.total_income, 1245000, "Total income should be 12.45L");
  assert.strictEqual(n.tax.slab_tax, 66750, "Raw slab tax should be 66,750");
  assert.strictEqual(n.tax.marginal_relief_87a, 21750, "Marginal relief should be 21,750");
  assert.strictEqual(n.tax.tax_after_rebate, 45000, "Tax after rebate should be 45,000");
  assert.strictEqual(n.tax.total_tax_liability, 46800, "Total tax with cess should be 46,800");
  console.log("  ✅ PASS: 87A Marginal Relief Cliff verified!");
}

function testCapitalGainsExemption() {
  console.log("Test 2: Section 112A LTCG 1.25L Exemption and 12.5% Rate...");
  const res = computeTax({
    income: {
      salary: { gross: 1800000 },
      capital_gains: {
        stcg_111a: 50000,
        ltcg_112a: 325000,
      },
    },
  });

  const n = res.new!;
  const sp112a = n.tax.special.find((s) => s.section.includes("112A"));
  assert.strictEqual(sp112a?.taxable, 200000, "Taxable 112A should be 2,00,000 after 1.25L exemption");
  assert.strictEqual(sp112a?.tax, 25000, "112A tax should be exactly 25,000 (12.5% of 2L)");

  const sp111a = n.tax.special.find((s) => s.section.includes("111A"));
  assert.strictEqual(sp111a?.taxable, 50000, "111A taxable should be 50,000");
  assert.strictEqual(sp111a?.tax, 10000, "111A tax should be 10,000 (20% of 50k)");
  console.log("  ✅ PASS: Capital Gains 112A and 111A verified!");
}

function testUnexhaustedBasicExemption() {
  console.log("Test 3: Unexhausted Basic Exemption Absorption against Capital Gains...");
  const res = computeTax({
    income: {
      capital_gains: {
        stcg_111a: 300000,
      },
    },
  });

  const n = res.new!;
  assert.strictEqual(n.tax.special_tax, 0, "3L STCG absorbed by 4L basic exemption");
  assert.strictEqual(n.tax.total_tax_liability, 0, "Total liability is 0");
  console.log("  ✅ PASS: Basic exemption absorption verified!");
}

function testSeniorCitizen207() {
  console.log("Test 4: Senior Citizen Section 207(2) Immunity from Advance Tax...");
  const res = computeTax({
    age_category: "senior",
    income: {
      other_sources: {
        fd_interest: 1500000,
      },
    },
    due_date: "2026-07-31",
    filing_date: "2026-07-30",
  });

  assert.strictEqual(res.new!.interest_and_fees["234B"], 0, "No 234B for senior without business");
  assert.strictEqual(res.new!.interest_and_fees["234C"], 0, "No 234C for senior without business");
  console.log("  ✅ PASS: Section 207(2) senior immunity verified!");
}

try {
  testMarginalRelief();
  testCapitalGainsExemption();
  testUnexhaustedBasicExemption();
  testSeniorCitizen207();
  console.log("\n🎉 ALL TYPESCRIPT STATUTORY ENGINE TESTS PASSED WITH 100% PARITY!");
  process.exit(0);
} catch (err: any) {
  console.error("\n❌ TEST FAILED:", err.message);
  console.error(err.stack);
  process.exit(1);
}

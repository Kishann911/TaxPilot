import assert from "node:assert";
import { POST as computeHandler } from "../src/app/api/compute/route";
import { POST as validateHandler } from "../src/app/api/validate/route";
import { NextRequest } from "next/server";

async function runApiTests() {
  console.log("=================================================");
  console.log("Running Next.js Serverless API Endpoint Tests");
  console.log("=================================================");

  // 1. Test /api/compute with valid payload
  console.log("Test 1: POST /api/compute with standard salaried payload...");
  const validPayload = {
    assessment_year: "2026-27",
    financial_year: "2025-26",
    age_category: "regular",
    income: {
      salary: {
        gross: 2400000,
        exempt_allowances: 0,
        professional_tax: 2400,
        hra: 0,
      },
      capital_gains: {
        stcg_111a: 50000,
        ltcg_112a: 150000,
      },
    },
    deductions: {
      "80c": 150000,
    },
  };

  const req1 = new NextRequest("http://localhost:3000/api/compute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });

  const res1 = await computeHandler(req1);
  assert.strictEqual(res1.status, 200, "Compute API should return status 200");
  const json1 = await res1.json();
  assert.strictEqual(json1.success, true, "Compute API response should indicate success");
  assert.ok(json1.data.new, "Compute API response should contain New Regime data");
  assert.ok(json1.data.old, "Compute API response should contain Old Regime data");
  assert.ok(json1.data.recommended_regime, "Compute API should return recommended regime");
  console.log("  ✅ PASS: /api/compute returned valid statutory computation!");

  // 2. Test /api/compute error handling with invalid payload
  console.log("Test 2: POST /api/compute with invalid malformed input...");
  const req2 = new NextRequest("http://localhost:3000/api/compute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid-json",
  });
  const res2 = await computeHandler(req2);
  assert.strictEqual(res2.status, 400, "Compute API should return status 400 for invalid JSON");
  const json2 = await res2.json();
  assert.strictEqual(json2.success, false, "Compute API should return success: false");
  console.log("  ✅ PASS: /api/compute handled invalid JSON gracefully!");

  // 3. Test /api/validate with clean payload
  console.log("Test 3: POST /api/validate with clean payload...");
  const req3 = new NextRequest("http://localhost:3000/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });
  const res3 = await validateHandler(req3);
  assert.strictEqual(res3.status, 200, "Validate API should return status 200");
  const json3 = await res3.json();
  assert.strictEqual(json3.valid, true, "Validate API should mark clean payload as valid");
  console.log("  ✅ PASS: /api/validate verified valid payload!");

  // 4. Test /api/validate with negative salary error
  console.log("Test 4: POST /api/validate with negative salary...");
  const invalidPayload = {
    income: {
      salary: { gross: -50000 },
    },
    deductions: {
      "80c": 200000, // triggers warning
    },
  };
  const req4 = new NextRequest("http://localhost:3000/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidPayload),
  });
  const res4 = await validateHandler(req4);
  assert.strictEqual(res4.status, 400, "Validate API should return status 400 for negative salary");
  const json4 = await res4.json();
  assert.strictEqual(json4.valid, false, "Validate API should mark negative salary as invalid");
  assert.ok(json4.errors.length > 0, "Errors array should contain negative salary error");
  assert.ok(json4.warnings.length > 0, "Warnings array should contain 80C cap warning");
  console.log("  ✅ PASS: /api/validate caught errors and warnings correctly!");

  console.log("\n🎉 ALL NEXT.JS API ENDPOINTS VERIFIED SUCCESSFULLY!");
}

runApiTests().catch((err) => {
  console.error("❌ API Endpoint Test Failed:", err);
  process.exit(1);
});

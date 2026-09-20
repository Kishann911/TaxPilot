import { NextRequest, NextResponse } from "next/server";
import type { TaxInputPayload } from "@/lib/engine/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TaxInputPayload;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic Schema & Type validation
    if (!body || typeof body !== "object") {
      errors.push("Payload must be a valid JSON object.");
    }

    const sal = body.income?.salary;
    if (sal && sal.gross !== undefined && sal.gross < 0) {
      errors.push("Salary gross cannot be negative.");
    }

    const cg = body.income?.capital_gains;
    if (cg) {
      if (cg.stcg_111a !== undefined && cg.stcg_111a < 0) errors.push("111A STCG cannot be negative.");
      if (cg.ltcg_112a !== undefined && cg.ltcg_112a < 0) errors.push("112A LTCG cannot be negative.");
      if (cg.vda !== undefined && cg.vda < 0) errors.push("VDA gains cannot be negative.");
    }

    const ded = body.deductions;
    if (ded) {
      if (ded["80c"] !== undefined && ded["80c"] > 150000) {
        warnings.push("Section 80C deduction exceeds statutory cap of ₹1,50,000 (will be clamped).");
      }
      if (ded["80ccd_1b"] !== undefined && ded["80ccd_1b"] > 50000) {
        warnings.push("Section 80CCD(1B) NPS deduction exceeds statutory cap of ₹50,000 (will be clamped).");
      }
    }

    const valid = errors.length === 0;

    return NextResponse.json(
      {
        valid,
        errors,
        warnings,
      },
      { status: valid ? 200 : 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        valid: false,
        errors: ["Malformed JSON payload: " + (err?.message || String(err))],
        warnings: [],
      },
      { status: 400 }
    );
  }
}

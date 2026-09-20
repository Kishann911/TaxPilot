import { NextRequest, NextResponse } from "next/server";
import { computeTax } from "@/lib/engine/taxEngine";
import type { TaxInputPayload } from "@/lib/engine/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TaxInputPayload;
    const computation = computeTax(body);

    return NextResponse.json(
      {
        success: true,
        data: computation,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Deterministic computation failed",
        message: err?.message || String(err),
      },
      { status: 400 }
    );
  }
}

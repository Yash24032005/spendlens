import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { rateLimit } from "@/lib/rate-limit";
import { AuditInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  try {
    const body: AuditInput = await request.json();

    if (!body.tools || body.tools.length === 0) {
      return NextResponse.json({ error: "At least one tool is required." }, { status: 400 });
    }

    if (!body.teamSize || body.teamSize < 1) {
      return NextResponse.json({ error: "Team size must be at least 1." }, { status: 400 });
    }

    const result = runAudit(body);

    // Store the audit in Supabase if configured
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const sb = getServiceClient();
      await sb.from("audits").insert({
        id: result.id,
        input: result.input,
        recommendations: result.recommendations,
        total_monthly_spend: result.totalMonthlySpend,
        total_monthly_savings: result.totalMonthlySavings,
        total_annual_savings: result.totalAnnualSavings,
        created_at: result.createdAt,
      });
    } catch (dbErr) {
      // Non-fatal: audit still works without DB
      console.error("DB write failed (non-fatal):", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Failed to process audit." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { LeadCapture } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(ip, 3, 60_000)) {
    return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 });
  }

  try {
    const body = await request.json();

    // Honeypot check — bots fill hidden fields
    if (body._hp_field) {
      // Silent accept to not alert bots
      return NextResponse.json({ ok: true });
    }

    const { email, auditId, companyName, role, teamSize } = body as LeadCapture & { _hp_field?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID required." }, { status: 400 });
    }

    // Store lead in Supabase
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const sb = getServiceClient();
      await sb.from("leads").insert({
        audit_id: auditId,
        email,
        company_name: companyName ?? null,
        role: role ?? null,
        team_size: teamSize ?? null,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error("DB lead write failed:", dbErr);
      // Continue — try email anyway
    }

    // Send confirmation email via Resend
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "SpendLens by Credex <audit@spendlens.credex.rocks>",
          to: email,
          subject: "Your AI spend audit is ready — SpendLens",
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Your audit is saved.</h1>
              <p style="color: #555; margin-bottom: 24px;">
                Thanks for using SpendLens. Your AI spend audit report has been captured and we'll keep it on file.
              </p>
              <p style="color: #555; margin-bottom: 24px;">
                If your audit surfaced meaningful savings, the Credex team will reach out within 2 business days 
                to walk you through how discounted AI credits work and whether you're a good fit.
              </p>
              <p style="color: #555;">
                — The Credex team
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
              <p style="color: #999; font-size: 12px;">
                SpendLens is a free tool by <a href="https://credex.rocks" style="color: #1a1a1a;">Credex</a> — 
                discounted AI infrastructure credits for startups.
              </p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error("Email send failed (non-fatal):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json({ error: "Failed to save your details." }, { status: 500 });
  }
}

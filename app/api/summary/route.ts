import { NextRequest, NextResponse } from "next/server";
import { AuditResult } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

function buildPrompt(audit: AuditResult): string {
  const { recommendations, totalMonthlySpend, totalMonthlySavings, input } = audit;
  const topSavings = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3);

  return `You are an expert AI infrastructure analyst writing a concise, plain-English audit summary for a startup.

Here is the audit data:
- Team size: ${input.teamSize} people
- Primary use case: ${input.useCase}
- Total current AI spend: $${totalMonthlySpend}/month
- Total potential savings: $${totalMonthlySavings}/month
- Tools audited: ${recommendations.map((r) => r.toolName).join(", ")}
- Top saving opportunities:
${topSavings.map((r) => `  • ${r.toolName}: save $${r.monthlySavings.toFixed(0)}/mo by ${r.recommendedAction === "downgrade" ? "downgrading" : r.recommendedAction === "switch" ? "switching" : "using discounted credits"}`).join("\n")}

Write a ~100-word personalized summary paragraph for this team. Be direct, specific, and practical. Mention the biggest saving opportunity by name. Don't use generic filler. Don't use bullet points — prose only. Don't start with "I" or "Your team". Tone: confident financial advisor, not cheerleader.`;
}

function templateFallback(audit: AuditResult): string {
  const { totalMonthlySpend, totalMonthlySavings, input } = audit;
  const topTool = audit.recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  if (totalMonthlySavings < 50) {
    return `Based on this audit, your team of ${input.teamSize} is running a reasonably optimized AI stack at $${totalMonthlySpend}/month. The tools you've chosen are broadly appropriate for your ${input.useCase} use case, and there are no glaring overspends. Small gains may be possible through plan-level adjustments, but the overall picture is solid. Keep an eye on usage growth — as your team scales, the economics will shift and another audit will be worthwhile.`;
  }

  return `This audit identified $${totalMonthlySavings.toFixed(0)}/month in potential savings for your ${input.teamSize}-person team, with the largest opportunity in ${topTool?.toolName ?? "your current stack"}. The core issue: your current plan mix doesn't match your actual usage patterns. Fixing this requires no change to your workflow — just a tier adjustment and, for your API spend, switching to discounted pre-purchased credits. Annualized, these changes represent $${(totalMonthlySavings * 12).toFixed(0)} that stays in your operating budget.`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: "Rate limited." }, { status: 429 });
  }

  try {
    const audit: AuditResult = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: templateFallback(audit), source: "template" });
    }

    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(audit) }],
      });

      const summary = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      return NextResponse.json({ summary, source: "ai" });
    } catch (aiErr) {
      console.error("Anthropic API error, falling back to template:", aiErr);
      return NextResponse.json({ summary: templateFallback(audit), source: "template" });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate summary." }, { status: 500 });
  }
}

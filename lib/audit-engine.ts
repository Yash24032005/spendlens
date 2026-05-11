
import { AuditInput, AuditResult, ToolEntry, ToolRecommendation } from "./types";
import { v4 as uuidv4 } from "uuid";

// Local TOOL_NAMES mapping
const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf"
};

function auditCursor(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = entry;
  let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
  let recommendedPlan: string | undefined;
  let projectedSpend = monthlySpend;
  let msg = `Cursor ${plan} is appropriately priced for your team size.`;

  if (plan === "business" && seats <= 3) {
    recommendedPlan = "Pro";
    projectedSpend = seats * 20;
    recommendedAction = "downgrade";
    msg = `Cursor Business vs Pro: At ${seats} seats, you're paying for admin tools you don't need. Save $${(monthlySpend - projectedSpend).toFixed(0)}/mo.`;
  } else if (plan === "enterprise" && seats < 10) {
    recommendedPlan = "Business";
    projectedSpend = seats * 40;
    recommendedAction = "downgrade";
    msg = `Enterprise is overkill for ${seats} seats. Business plan covers everything you need.`;
  }

  return {
    toolId: "cursor" as any, // Cast to any to bypass ToolId union strictness
    toolName: TOOL_NAMES.cursor,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    projectedSpend,
    monthlySavings: monthlySpend - projectedSpend,
    message: msg,
    reason: msg, // Added 'reason' to satisfy types.ts
  };
}

function auditGithubCopilot(entry: ToolEntry): ToolRecommendation {
  const { plan, monthlySpend, seats } = entry;
  let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
  let recommendedPlan: string | undefined;
  let projectedSpend = monthlySpend;
  let msg = `GitHub Copilot ${plan} aligns with your team size.`;

  if (plan === "business" && seats <= 2) {
    recommendedPlan = "Individual";
    projectedSpend = seats * 10;
    recommendedAction = "downgrade";
    msg = `Copilot Business is $19/seat. For 1-2 devs, Individual ($10) is functionally identical.`;
  }

  return {
    toolId: "github_copilot" as any,
    toolName: TOOL_NAMES.github_copilot,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    projectedSpend,
    monthlySavings: monthlySpend - projectedSpend,
    message: msg,
    reason: msg, // Satisfy types.ts
  };
}

function auditClaude(entry: ToolEntry): ToolRecommendation {
  const { plan, monthlySpend, seats } = entry;
  let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
  let recommendedPlan: string | undefined;
  let projectedSpend = monthlySpend;
  let msg = `Claude ${plan} is well-optimized for your usage.`;

  if (plan === "team" && seats < 5) {
    projectedSpend = seats * 20;
    recommendedAction = "downgrade";
    recommendedPlan = "Pro";
    msg = `Claude Team has a 5-seat minimum ($150). Switch to Pro ($20/seat) to save on unused seats.`;
  }

  return {
    toolId: "claude" as any,
    toolName: TOOL_NAMES.claude,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    projectedSpend,
    monthlySavings: monthlySpend - projectedSpend,
    message: msg,
    reason: msg,
  };
}

function auditChatGPT(entry: ToolEntry): ToolRecommendation {
  const { plan, monthlySpend, seats } = entry;
  let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
  let recommendedPlan: string | undefined;
  let projectedSpend = monthlySpend;
  let msg = `ChatGPT ${plan} is currently your best option.`;

  if (plan === "team" && seats <= 2) {
    recommendedPlan = "Plus";
    projectedSpend = seats * 20;
    recommendedAction = "downgrade";
    msg = `Team plan is $30/seat with a 2-seat minimum. Individual Plus ($20) is cheaper for your size.`;
  }

  return {
    toolId: "chatgpt" as any,
    toolName: TOOL_NAMES.chatgpt,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    projectedSpend,
    monthlySavings: monthlySpend - projectedSpend,
    message: msg,
    reason: msg,
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;
  const recommendations: ToolRecommendation[] = [];

  for (const entry of tools) {
    let rec: ToolRecommendation;
    switch (entry.toolId) {
      case "cursor": rec = auditCursor(entry, teamSize, useCase); break;
      case "github_copilot": rec = auditGithubCopilot(entry); break;
      case "claude": rec = auditClaude(entry); break;
      case "chatgpt": rec = auditChatGPT(entry); break;
      default:
        rec = {
          toolId: entry.toolId as any,
          toolName: entry.toolId,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          recommendedAction: "keep",
          projectedSpend: entry.monthlySpend,
          monthlySavings: 0,
          message: "No specific optimization rules found.",
          reason: "No optimization found.",
        };
    }
    recommendations.push(rec);
  }

  const totalMonthlySpend = recommendations.reduce((s, r) => s + r.currentSpend, 0);
  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.monthlySavings, 0);

  return {
    id: uuidv4(),
    input,
    recommendations,
    totalMonthlySpend,
    totalProjectedSpend: totalMonthlySpend - totalMonthlySavings,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    createdAt: new Date().toISOString(),
  };
}
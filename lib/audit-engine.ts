// import { AuditInput, AuditResult, ToolEntry, ToolRecommendation } from "./types";
// import { PRICING, TOOL_NAMES } from "./pricing";


// /**
//  * Core audit logic — deterministic rules, no AI.
//  * Each rule has a finance-defensible reason.
//  */

// function auditCursor(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;
//   const perSeat = seats > 0 ? monthlySpend / seats : monthlySpend;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";
//   let credexNote: string | undefined;

//   // Rule 1: Business plan for ≤3 devs is overkill — Pro is identical for small teams
//   if (plan === "business" && seats <= 3) {
//     recommendedPlan = "Pro";
//     projectedSpend = seats * 20;
//     recommendedAction = "downgrade";
//     reason = `Cursor Business ($40/seat) vs Pro ($20/seat): at ${seats} seats the only meaningful Business extras are centralized billing and usage analytics — not worth $${(monthlySpend - projectedSpend).toFixed(0)}/mo for a team this small. Downgrade to Pro, revisit at 10+ seats.`;
//   }
//   // Rule 2: Enterprise for < 10 seats is almost always over-engineered
//   else if (plan === "enterprise" && seats < 10) {
//     recommendedPlan = "Business";
//     projectedSpend = seats * 40;
//     recommendedAction = "downgrade";
//     reason = `Cursor Enterprise at ${seats} seats means you're paying for SSO, SLA, and dedicated support you likely don't need yet. Business plan ($40/seat) covers all functional features at a fraction of the cost.`;
//   }
//   // Rule 3: Cursor Pro vs Windsurf Pro — for pure coding, Windsurf Pro at $15/seat beats Cursor Pro at $20/seat
//   else if (plan === "pro" && (useCase === "coding")) {
//     recommendedAction = "credits";
//     projectedSpend = monthlySpend * 0.75; // estimate via credits
//     reason = `Cursor Pro at $${perSeat.toFixed(0)}/seat is solid, but you could capture the same throughput at lower cost through Credex's discounted credit marketplace — typically 20–30% off retail.`;
//     credexNote = "Credex can source Cursor credits at 20–30% below retail from companies that over-purchased.";
//   } else {
//     reason = `Cursor ${plan} is appropriately priced for your team size (${seats} seats, $${perSeat.toFixed(0)}/seat). No immediate action needed.`;
//   }

//   return {
//     toolId: "cursor",
//     toolName: TOOL_NAMES.cursor,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//     credexNote,
//   };
// }

// function auditGithubCopilot(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let recommendedTool: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";

//   // Rule: Copilot Business for ≤2 devs — Individual plan saves $9/seat/mo
//   if (plan === "business" && seats <= 2) {
//     recommendedPlan = "Individual";
//     projectedSpend = seats * 10;
//     recommendedAction = "downgrade";
//     reason = `GitHub Copilot Business ($19/seat) over Individual ($10/seat) makes sense at 5+ seats where policy management matters. At ${seats} devs, you're paying $9/seat/month for admin features you don't need yet — save $${(monthlySpend - projectedSpend).toFixed(0)}/mo.`;
//   }
//   // Rule: Enterprise for < 20 seats — overkill
//   else if (plan === "enterprise" && seats < 20) {
//     recommendedPlan = "Business";
//     projectedSpend = seats * 19;
//     recommendedAction = "downgrade";
//     reason = `GitHub Copilot Enterprise ($39/seat) at ${seats} seats: the upgrade buys you fine-tuning on your codebase and Bing search — valuable at 50+ devs, marginal ROI here. Business plan covers the essentials at $${(monthlySpend - projectedSpend).toFixed(0)}/mo less.`;
//   }
//   // Rule: Copilot + Cursor = double-paying for coding assist — Cursor subsumes Copilot
//   else if (useCase === "coding") {
//     // Note: overlapping tool check is done in the cross-tool analysis
//     reason = `GitHub Copilot ${plan} is appropriately matched to your team size. If you're also running Cursor, you may have redundant coverage — see cross-tool notes.`;
//   } else {
//     reason = `GitHub Copilot ${plan} aligns with your ${seats}-seat team. Pricing is market-rate for this tier.`;
//   }

//   return {
//     toolId: "github_copilot",
//     toolName: TOOL_NAMES.github_copilot,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     recommendedTool,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//   };
// }

// function auditClaude(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;
//   const perSeat = seats > 0 ? monthlySpend / seats : monthlySpend;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";
//   let credexNote: string | undefined;

//   // Rule: Team plan requires min 5 seats; <5 means you're paying the minimum anyway
//   if (plan === "team" && seats < 5) {
//     // Team is billed at min 5 seats regardless
//     const actualCost = 5 * 30; // forced min
//     if (monthlySpend > seats * 20) {
//       recommendedPlan = "Pro (individual)";
//       projectedSpend = seats * 20;
//       recommendedAction = "downgrade";
//       reason = `Claude Team is billed at a minimum of 5 seats ($150/mo minimum). With only ${seats} seat(s), Pro ($20/seat) covers the same usage without the forced minimum — saving ~$${(monthlySpend - projectedSpend).toFixed(0)}/mo.`;
//     }
//   }
//   // Rule: Max plan at low team size for writing/research — Pro usually sufficient
//   else if ((plan === "max_5x" || plan === "max_20x") && seats <= 2 && useCase !== "coding") {
//     recommendedPlan = "Pro";
//     projectedSpend = seats * 20;
//     recommendedAction = "downgrade";
//     reason = `Claude Max (${perSeat}/seat) is designed for heavy-volume power users — 5x–20x usage vs Pro. For ${useCase} tasks with ${seats} user(s), Pro ($20/seat) hits the rate limits of most non-engineering teams. You're likely not consuming Max-tier volume.`;
//   }
//   // Rule: Enterprise with <10 seats — check if Team suffices
//   else if (plan === "enterprise" && seats < 10) {
//     recommendedPlan = "Team";
//     projectedSpend = Math.max(5, seats) * 30;
//     recommendedAction = "downgrade";
//     reason = `Claude Enterprise at ${seats} seats: Enterprise unlocks SSO, admin controls, and extended context. Unless you're using 200k-token context windows or require audit logs for compliance, Team covers the same functional surface at roughly half the cost.`;
//   }
//   // API direct: check if usage is high enough to warrant enterprise
//   else if (plan === "api" && monthlySpend > 500) {
//     recommendedAction = "credits";
//     projectedSpend = monthlySpend * 0.75;
//     credexNote = "At $500+/mo in Anthropic API spend, Credex can source API credits at significant discount. Book a consultation.";
//     reason = `At $${monthlySpend}/mo in direct API spend, you're a strong candidate for discounted Anthropic API credits. Retail API pricing is avoidable at your volume.`;
//   } else {
//     reason = `Claude ${plan} is appropriately sized for your team (${seats} seat(s), $${perSeat.toFixed(0)}/seat). No optimization available at this tier.`;
//   }

//   return {
//     toolId: "claude",
//     toolName: TOOL_NAMES.claude,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//     credexNote,
//   };
// }

// function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;
//   const perSeat = seats > 0 ? monthlySpend / seats : monthlySpend;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let recommendedTool: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";
//   let credexNote: string | undefined;

//   // Rule: ChatGPT Pro ($200/seat) — very rarely justified unless heavy o1/image gen use
//   if (plan === "pro_plan" && useCase !== "coding" && useCase !== "data") {
//     recommendedPlan = "Team";
//     projectedSpend = Math.max(2, seats) * 30;
//     recommendedAction = "downgrade";
//     reason = `ChatGPT Pro ($200/seat) gives unlimited o1 and advanced voice. For ${useCase} workloads, Team ($30/seat) covers GPT-4o with a generous monthly cap — the math rarely justifies 6.7x premium unless o1 is your daily driver for complex reasoning.`;
//   }
//   // Rule: Team plan for 2 people — Plus costs less with same capability
//   else if (plan === "team" && seats <= 2) {
//     recommendedPlan = "Plus";
//     projectedSpend = seats * 20;
//     recommendedAction = "downgrade";
//     reason = `ChatGPT Team ($30/seat, 2-seat minimum = $60/mo) vs Plus ($20/seat × ${seats} = $${seats * 20}/mo): Team adds shared workspaces and admin controls, but for a ${seats}-person operation these are unnecessary overhead. Switch to individual Plus licenses.`;
//   }
//   // Rule: API spend > $300/mo — credits path
//   else if (plan === "api" && monthlySpend > 300) {
//     recommendedAction = "credits";
//     projectedSpend = monthlySpend * 0.75;
//     credexNote = "Credex sources OpenAI API credits from companies with surplus. At $300+/mo, discounts of 20–30% are achievable.";
//     reason = `$${monthlySpend}/mo in OpenAI API spend puts you in the bracket where discounted credits are available via brokers. Credex can source these from enterprise over-purchasers.`;
//   } else {
//     reason = `ChatGPT ${plan} is well-matched to your usage profile. At $${perSeat.toFixed(0)}/seat with ${seats} seat(s), you're within expected range for this tier.`;
//   }

//   return {
//     toolId: "chatgpt",
//     toolName: TOOL_NAMES.chatgpt,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     recommendedTool,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//     credexNote,
//   };
// }

// function auditAnthropicAPI(entry: ToolEntry): ToolRecommendation {
//   const { monthlySpend } = entry;
//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let projectedSpend = monthlySpend;
//   let reason = "";
//   let credexNote: string | undefined;

//   if (monthlySpend > 200) {
//     recommendedAction = "credits";
//     projectedSpend = monthlySpend * 0.72; // ~28% savings via credits
//     credexNote = "Credex has sourced Anthropic API credits at up to 30% below retail. High-volume API users are our best-fit customers.";
//     reason = `At $${monthlySpend}/mo in Anthropic API spend, you're paying retail. Discounted prepaid credits — sourced from companies that over-allocated — can reduce this by 20–30% with zero change to your integration or usage pattern.`;
//   } else {
//     reason = `Your Anthropic API spend ($${monthlySpend}/mo) is below the threshold where credit arbitrage is meaningfully advantageous. Usage-based billing at this level is cost-efficient.`;
//   }

//   return {
//     toolId: "anthropic_api",
//     toolName: TOOL_NAMES.anthropic_api,
//     currentPlan: "api",
//     currentSpend: monthlySpend,
//     recommendedAction,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//     credexNote,
//   };
// }

// function auditOpenAIAPI(entry: ToolEntry): ToolRecommendation {
//   const { monthlySpend } = entry;
//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let projectedSpend = monthlySpend;
//   let reason = "";
//   let credexNote: string | undefined;

//   if (monthlySpend > 200) {
//     recommendedAction = "credits";
//     projectedSpend = monthlySpend * 0.75;
//     credexNote = "Credex sources OpenAI API credits from companies with unused allocations. Savings of 20–30% achievable for $200+/mo users.";
//     reason = `$${monthlySpend}/mo in OpenAI API spend is in the range where discounted pre-purchased credits offer real savings. Credit arbitrage works because enterprise buyers often over-allocate and can't return unused credits.`;
//   } else {
//     reason = `OpenAI API spend of $${monthlySpend}/mo is under the threshold for credit arbitrage to be cost-effective (transaction overhead + minimum purchase requirements erode savings at low volume).`;
//   }

//   return {
//     toolId: "openai_api",
//     toolName: TOOL_NAMES.openai_api,
//     currentPlan: "api",
//     currentSpend: monthlySpend,
//     recommendedAction,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//     credexNote,
//   };
// }

// function auditGemini(entry: ToolEntry, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;
//   const perSeat = seats > 0 ? monthlySpend / seats : monthlySpend;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";

//   // Rule: Gemini Advanced for coding teams — Cursor/Windsurf are purpose-built and better ROI
//   if (plan === "advanced" && useCase === "coding" && seats > 2) {
//     recommendedPlan = "Free or switch to purpose-built coding AI";
//     projectedSpend = 0;
//     recommendedAction = "switch";
//     reason = `Gemini Advanced ($22/seat) for a coding team is a weak fit — it's designed as a general assistant, not a code-native IDE integration. Cursor or Windsurf at similar price points provide in-editor autocomplete, multi-file context, and codebase indexing that Gemini Advanced cannot replicate. Reallocate this spend.`;
//   } else if (plan === "api" && monthlySpend > 200) {
//     recommendedAction = "keep";
//     reason = `Gemini API at $${monthlySpend}/mo: Google's pricing is already highly competitive vs OpenAI/Anthropic at equivalent capability tiers. This is likely already your most cost-efficient API option.`;
//   } else {
//     reason = `Gemini ${plan} is reasonably priced for general-purpose use at $${perSeat.toFixed(0)}/seat. No immediate optimization available.`;
//   }

//   return {
//     toolId: "gemini",
//     toolName: TOOL_NAMES.gemini,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//   };
// }

// function auditWindsurf(entry: ToolEntry, useCase: string): ToolRecommendation {
//   const { plan, monthlySpend, seats } = entry;

//   let recommendedAction: ToolRecommendation["recommendedAction"] = "keep";
//   let recommendedPlan: string | undefined;
//   let projectedSpend = monthlySpend;
//   let reason = "";

//   if (plan === "teams" && seats <= 3 && useCase === "coding") {
//     recommendedPlan = "Pro";
//     projectedSpend = seats * 15;
//     recommendedAction = "downgrade";
//     reason = `Windsurf Teams ($35/seat) vs Pro ($15/seat): Teams adds centralized billing and admin controls. For a ${seats}-person team these admin features aren't worth $${(monthlySpend - projectedSpend).toFixed(0)}/mo premium. Downgrade to individual Pro licenses until you hit 8–10 devs.`;
//   } else {
//     reason = `Windsurf ${plan} is appropriate for a ${seats}-seat coding team. At $${(monthlySpend / Math.max(seats, 1)).toFixed(0)}/seat it's already among the more affordable IDE AI options.`;
//   }

//   return {
//     toolId: "windsurf",
//     toolName: TOOL_NAMES.windsurf,
//     currentPlan: plan,
//     currentSpend: monthlySpend,
//     recommendedAction,
//     recommendedPlan,
//     projectedSpend,
//     monthlySavings: monthlySpend - projectedSpend,
//     reason,
//   };
// }

// /**
//  * Cross-tool analysis: detect redundant overlapping tools
//  */
// function applyCrossToolRules(
//   recommendations: ToolRecommendation[],
//   tools: ToolEntry[],
//   useCase: string
// ): ToolRecommendation[] {
//   const toolIds = tools.map((t) => t.toolId);

//   // Rule: Running both Cursor AND GitHub Copilot for coding = double-paying for inline completions
//   const hasCursor = toolIds.includes("cursor");
//   const hasCopilot = toolIds.includes("github_copilot");
//   const hasWindsurf = toolIds.includes("windsurf");

//   if (hasCursor && hasCopilot && useCase === "coding") {
//     const copilotRec = recommendations.find((r) => r.toolId === "github_copilot");
//     if (copilotRec && copilotRec.recommendedAction === "keep") {
//       copilotRec.recommendedAction = "switch";
//       copilotRec.projectedSpend = 0;
//       copilotRec.monthlySavings = copilotRec.currentSpend;
//       copilotRec.reason = `You're running Cursor and GitHub Copilot simultaneously — both provide AI-powered inline code completion. Cursor's inline completions and chat fully subsume Copilot's functionality; you're paying for the same capability twice. Drop Copilot and redirect that spend. (Cursor's Tab completions + Composer cover everything Copilot does, plus multi-file context Copilot lacks.)`;
//     }
//   }

//   if (hasWindsurf && hasCopilot && useCase === "coding" && !hasCursor) {
//     const copilotRec = recommendations.find((r) => r.toolId === "github_copilot");
//     if (copilotRec && copilotRec.recommendedAction === "keep") {
//       copilotRec.recommendedAction = "switch";
//       copilotRec.projectedSpend = 0;
//       copilotRec.monthlySavings = copilotRec.currentSpend;
//       copilotRec.reason = `Running Windsurf and GitHub Copilot together duplicates inline code completion. Windsurf provides the same core capability; cancelling Copilot saves $${copilotRec.currentSpend}/mo with no functional loss.`;
//     }
//   }

//   // Rule: ChatGPT + Claude both at paid tiers for same use case — one is probably underused
//   const hasClaude = toolIds.includes("claude");
//   const hasChatGPT = toolIds.includes("chatgpt");
//   if (hasClaude && hasChatGPT) {
//     const claudeTool = tools.find((t) => t.toolId === "claude");
//     const chatgptTool = tools.find((t) => t.toolId === "chatgpt");
//     if (
//       claudeTool && chatgptTool &&
//       claudeTool.plan !== "free" && claudeTool.plan !== "api" &&
//       chatgptTool.plan !== "free" && chatgptTool.plan !== "api"
//     ) {
//       // Keep the cheaper one; recommend dropping or downgrading the more expensive
//       const claudeRec = recommendations.find((r) => r.toolId === "claude");
//       const chatgptRec = recommendations.find((r) => r.toolId === "chatgpt");
//       if (claudeRec && chatgptRec) {
//         const note = `Note: You're paying for both Claude and ChatGPT at paid tiers. For ${useCase} tasks, teams rarely need both at full-tier concurrently — consider consolidating on one platform. Claude excels at long-context reasoning and coding; ChatGPT has stronger multimodal and plugin ecosystem. Choose based on your primary workflow.`;
//         claudeRec.reason += ` ${note}`;
//       }
//     }
//   }

//   return recommendations;
// }

// export function runAudit(input: AuditInput): AuditResult {
//   const { tools, teamSize, useCase } = input;
//   const recommendations: ToolRecommendation[] = [];

//   for (const entry of tools) {
//     let rec: ToolRecommendation;

//     switch (entry.toolId) {
//       case "cursor":
//         rec = auditCursor(entry, teamSize, useCase);
//         break;
//       case "github_copilot":
//         rec = auditGithubCopilot(entry, teamSize, useCase);
//         break;
//       case "claude":
//         rec = auditClaude(entry, teamSize, useCase);
//         break;
//       case "chatgpt":
//         rec = auditChatGPT(entry, teamSize, useCase);
//         break;
//       case "anthropic_api":
//         rec = auditAnthropicAPI(entry);
//         break;
//       case "openai_api":
//         rec = auditOpenAIAPI(entry);
//         break;
//       case "gemini":
//         rec = auditGemini(entry, useCase);
//         break;
//       case "windsurf":
//         rec = auditWindsurf(entry, useCase);
//         break;
//       default:
//         continue;
//     }

//     recommendations.push(rec);
//   }

//   // Apply cross-tool analysis
//   const finalRecs = applyCrossToolRules(recommendations, tools, useCase);

//   const totalMonthlySpend = finalRecs.reduce((s, r) => s + r.currentSpend, 0);
//   const totalProjectedSpend = finalRecs.reduce((s, r) => s + r.projectedSpend, 0);
//   const totalMonthlySavings = Math.max(0, totalMonthlySpend - totalProjectedSpend);
//   const totalAnnualSavings = totalMonthlySavings * 12;

//   return {
//     id: crypto.randomUUID(),
//     input,
//     recommendations: finalRecs,
//     totalMonthlySpend,
//     totalProjectedSpend,
//     totalMonthlySavings,
//     totalAnnualSavings,
//     createdAt: new Date().toISOString(),
//   };
// }
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
import { AuditInput, AuditResult, Recommendation } from "./types";
import { v4 as uuidv4 } from "uuid";

export const runAudit = (input: AuditInput): AuditResult => {
  const recommendations: Recommendation[] = [];
  let totalMonthlySpend = 0;

  const hasCursor = input.tools.some(t => t.toolId === "cursor");

  input.tools.forEach((tool) => {
    totalMonthlySpend += tool.monthlySpend;

    let rec: Recommendation = {
      toolId: tool.toolId,
      toolName: tool.toolId.replace(/_/g, " ").toUpperCase(),
      currentSpend: tool.monthlySpend,
      projectedSpend: tool.monthlySpend,
      monthlySavings: 0,
      recommendedAction: "keep",
      recommendedPlan: tool.plan,
      message: "Your current plan is optimal for your usage. ✨",
    };

    // Redundancy Check
    if (tool.toolId === "github_copilot" && hasCursor) {
      rec.recommendedAction = "switch";
      rec.projectedSpend = 0;
      rec.monthlySavings = tool.monthlySpend;
      rec.message = "GitHub Copilot is redundant since you are using Cursor. 🚫";
    }

    // Cursor Downgrade Logic
    else if (tool.toolId === "cursor" && tool.plan === "business" && tool.seats <= 3) {
      const proTotal = 20 * tool.seats;
      rec.recommendedAction = "downgrade";
      rec.recommendedPlan = "Cursor Pro";
      rec.projectedSpend = proTotal;
      rec.monthlySavings = tool.monthlySpend - proTotal;
      rec.message = "Team choti hai, Pro plan par switch karke paise bachao! 📉";
    }

    // API Credits Logic
    else if (tool.toolId.includes("api") && tool.monthlySpend > 200) {
      const savings = tool.monthlySpend * 0.2;
      rec.recommendedAction = "credits";
      rec.projectedSpend = tool.monthlySpend - savings;
      rec.monthlySavings = savings;
      rec.credexNote = "Available via Credex Marketplace";
      rec.message = "High API spend detected. Use credits to save 20%. 💸";
    }

    recommendations.push(rec);
  });

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);

  // YE HAI SAHI RETURN FORMAT
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    input,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    recommendations,
  };
};
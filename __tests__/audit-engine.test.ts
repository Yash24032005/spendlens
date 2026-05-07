import { runAudit } from "@/lib/audit-engine";
import { AuditInput } from "@/lib/types";

// Test 1: Cursor Business with small team should recommend downgrade
test("Cursor Business with ≤3 seats recommends downgrade to Pro", () => {
  const input: AuditInput = {
    tools: [{ toolId: "cursor", plan: "business", monthlySpend: 120, seats: 3 }],
    teamSize: 5,
    useCase: "coding",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "cursor")!;
  expect(rec.recommendedAction).toBe("downgrade");
  expect(rec.monthlySavings).toBeGreaterThan(0);
  expect(rec.projectedSpend).toBeLessThan(rec.currentSpend);
  expect(rec.recommendedPlan).toContain("Pro");
});

// Test 2: Claude Team with fewer than 5 seats should trigger minimum-seat rule
test("Claude Team with <5 seats recommends downgrade due to forced minimum", () => {
  const input: AuditInput = {
    tools: [{ toolId: "claude", plan: "team", monthlySpend: 150, seats: 2 }],
    teamSize: 10,
    useCase: "writing",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "claude")!;
  expect(rec.recommendedAction).toBe("downgrade");
  expect(rec.monthlySavings).toBeGreaterThan(0);
});

// Test 3: Already-optimal stack should return keep and zero savings
test("Cursor Pro with small team returns keep with zero savings", () => {
  const input: AuditInput = {
    tools: [{ toolId: "cursor", plan: "hobby", monthlySpend: 0, seats: 1 }],
    teamSize: 2,
    useCase: "coding",
  };
  const result = runAudit(input);
  // Free/hobby plan — nothing to optimize
  expect(result.totalMonthlySavings).toBe(0);
});

// Test 4: Cross-tool redundancy — Cursor + Copilot together should flag Copilot
test("Cursor + GitHub Copilot together flags Copilot as redundant", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "pro", monthlySpend: 60, seats: 3 },
      { toolId: "github_copilot", plan: "business", monthlySpend: 57, seats: 3 },
    ],
    teamSize: 5,
    useCase: "coding",
  };
  const result = runAudit(input);
  const copilotRec = result.recommendations.find((r) => r.toolId === "github_copilot")!;
  expect(copilotRec.recommendedAction).toBe("switch");
  expect(copilotRec.projectedSpend).toBe(0);
  expect(copilotRec.monthlySavings).toBe(57);
});

// Test 5: Total savings sum is correct
test("Total monthly savings equals sum of individual tool savings", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "business", monthlySpend: 120, seats: 3 },
      { toolId: "github_copilot", plan: "enterprise", monthlySpend: 117, seats: 3 },
    ],
    teamSize: 5,
    useCase: "coding",
  };
  const result = runAudit(input);
  const sumSavings = result.recommendations.reduce((s, r) => s + r.monthlySavings, 0);
  expect(result.totalMonthlySavings).toBeCloseTo(sumSavings, 1);
});

// Test 6: Annual savings is 12x monthly
test("Annual savings equals 12x monthly savings", () => {
  const input: AuditInput = {
    tools: [{ toolId: "claude", plan: "team", monthlySpend: 150, seats: 2 }],
    teamSize: 5,
    useCase: "mixed",
  };
  const result = runAudit(input);
  expect(result.totalAnnualSavings).toBeCloseTo(result.totalMonthlySavings * 12, 1);
});

// Test 7: High API spend triggers credits recommendation
test("Anthropic API spend >$200/mo recommends credits", () => {
  const input: AuditInput = {
    tools: [{ toolId: "anthropic_api", plan: "api", monthlySpend: 500, seats: 1 }],
    teamSize: 3,
    useCase: "coding",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "anthropic_api")!;
  expect(rec.recommendedAction).toBe("credits");
  expect(rec.credexNote).toBeDefined();
  expect(rec.monthlySavings).toBeGreaterThan(0);
});

// Test 8: Low API spend keeps recommendation as-is
test("Anthropic API spend <$200/mo keeps current plan", () => {
  const input: AuditInput = {
    tools: [{ toolId: "anthropic_api", plan: "api", monthlySpend: 50, seats: 1 }],
    teamSize: 2,
    useCase: "research",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "anthropic_api")!;
  expect(rec.recommendedAction).toBe("keep");
  expect(rec.monthlySavings).toBe(0);
});

// Test 9: Audit result has required ID and timestamp
test("Audit result includes id, createdAt, and input", () => {
  const input: AuditInput = {
    tools: [{ toolId: "windsurf", plan: "pro", monthlySpend: 45, seats: 3 }],
    teamSize: 5,
    useCase: "coding",
  };
  const result = runAudit(input);
  expect(result.id).toBeDefined();
  expect(result.id.length).toBeGreaterThan(0);
  expect(result.createdAt).toBeDefined();
  expect(result.input).toEqual(input);
});

// Test 10: ChatGPT Pro plan with non-power-use-case recommends downgrade
test("ChatGPT Pro plan for writing use case recommends downgrade to Team", () => {
  const input: AuditInput = {
    tools: [{ toolId: "chatgpt", plan: "pro_plan", monthlySpend: 200, seats: 1 }],
    teamSize: 3,
    useCase: "writing",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "chatgpt")!;
  expect(rec.recommendedAction).toBe("downgrade");
  expect(rec.monthlySavings).toBeGreaterThan(0);
});

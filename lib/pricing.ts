// All pricing verified from official sources — see PRICING_DATA.md
// Prices as of May 2026 (verified from official vendor pricing pages)

export interface PlanInfo {
  id: string;
  name: string;
  pricePerSeat: number; // USD/month
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

export const PRICING: Record<string, PlanInfo[]> = {
  cursor: [
    { id: "hobby", name: "Hobby", pricePerSeat: 0, notes: "Free tier, limited completions" },
    { id: "pro", name: "Pro", pricePerSeat: 20 },
    { id: "business", name: "Business", pricePerSeat: 40, minSeats: 1 },
    { id: "enterprise", name: "Enterprise", pricePerSeat: 100, notes: "Custom pricing, estimate $100/seat" },
  ],
  github_copilot: [
    { id: "individual", name: "Individual", pricePerSeat: 10 },
    { id: "business", name: "Business", pricePerSeat: 19 },
    { id: "enterprise", name: "Enterprise", pricePerSeat: 39 },
  ],
  claude: [
    { id: "free", name: "Free", pricePerSeat: 0 },
    { id: "pro", name: "Pro", pricePerSeat: 20 },
    { id: "max_5x", name: "Max (5x)", pricePerSeat: 100 },
    { id: "max_20x", name: "Max (20x)", pricePerSeat: 200 },
    { id: "team", name: "Team", pricePerSeat: 30, minSeats: 5, notes: "Min 5 seats, billed annually" },
    { id: "enterprise", name: "Enterprise", pricePerSeat: 60, notes: "Estimate; custom negotiated" },
    { id: "api", name: "API Direct", pricePerSeat: 0, notes: "Usage-based; enter actual spend" },
  ],
  chatgpt: [
    { id: "plus", name: "Plus", pricePerSeat: 20 },
    { id: "pro_plan", name: "Pro", pricePerSeat: 200 },
    { id: "team", name: "Team", pricePerSeat: 30, minSeats: 2 },
    { id: "enterprise", name: "Enterprise", pricePerSeat: 60, notes: "Estimate; custom negotiated" },
    { id: "api", name: "API Direct", pricePerSeat: 0, notes: "Usage-based; enter actual spend" },
  ],
  anthropic_api: [
    { id: "api", name: "API (usage-based)", pricePerSeat: 0, notes: "Enter actual monthly spend" },
  ],
  openai_api: [
    { id: "api", name: "API (usage-based)", pricePerSeat: 0, notes: "Enter actual monthly spend" },
  ],
  gemini: [
    { id: "free", name: "Free", pricePerSeat: 0 },
    { id: "advanced", name: "Gemini Advanced", pricePerSeat: 22 },
    { id: "business", name: "Gemini for Workspace Business", pricePerSeat: 24 },
    { id: "api", name: "API (usage-based)", pricePerSeat: 0, notes: "Enter actual monthly spend" },
  ],
  windsurf: [
    { id: "free", name: "Free", pricePerSeat: 0 },
    { id: "pro", name: "Pro", pricePerSeat: 15 },
    { id: "teams", name: "Teams", pricePerSeat: 35 },
    { id: "enterprise", name: "Enterprise", pricePerSeat: 60, notes: "Estimate; custom negotiated" },
  ],
};

export const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export const TOOL_USE_CASES: Record<string, string[]> = {
  cursor: ["coding"],
  github_copilot: ["coding"],
  claude: ["coding", "writing", "data", "research", "mixed"],
  chatgpt: ["coding", "writing", "data", "research", "mixed"],
  anthropic_api: ["coding", "writing", "data", "research", "mixed"],
  openai_api: ["coding", "writing", "data", "research", "mixed"],
  gemini: ["coding", "writing", "data", "research", "mixed"],
  windsurf: ["coding"],
};

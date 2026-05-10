"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuditInput, ToolEntry, ToolId, UseCase } from "@/lib/types";
import { PRICING, TOOL_NAMES } from "@/lib/pricing";

const TOOLS: { id: ToolId; label: string; emoji: string }[] = [
  { id: "cursor", label: "Cursor", emoji: "⚡" },
  { id: "github_copilot", label: "GitHub Copilot", emoji: "🐙" },
  { id: "claude", label: "Claude", emoji: "🟠" },
  { id: "chatgpt", label: "ChatGPT", emoji: "🟢" },
  { id: "anthropic_api", label: "Anthropic API", emoji: "🔶" },
  { id: "openai_api", label: "OpenAI API", emoji: "🔷" },
  { id: "gemini", label: "Gemini", emoji: "💎" },
  { id: "windsurf", label: "Windsurf", emoji: "🏄" },
];

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding / Engineering" },
  { id: "writing", label: "Writing / Content" },
  { id: "data", label: "Data / Analytics" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed / General" },
];

const STORAGE_KEY = "spendlens_form_v1";

export default function Home() {
  const router = useRouter();
  const [selectedTools, setSelectedTools] = useState<ToolId[]>([]);
  const [entries, setEntries] = useState<Record<string, ToolEntry>>({});
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AuditInput;
        if (saved.tools?.length) {
          setSelectedTools(saved.tools.map((t) => t.toolId));
          const map: Record<string, ToolEntry> = {};
          saved.tools.forEach((t) => { map[t.toolId] = t; });
          setEntries(map);
        }
        if (saved.teamSize) setTeamSize(saved.teamSize);
        if (saved.useCase) setUseCase(saved.useCase);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const data = { tools: selectedTools.map((id) => entries[id]).filter(Boolean), teamSize, useCase };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selectedTools, entries, teamSize, useCase]);

  function toggleTool(id: ToolId) {
    setSelectedTools((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
    if (!entries[id]) {
      const plans = PRICING[id];
      const defaultPlan = plans[Math.min(1, plans.length - 1)];
      setEntries((prev) => ({ ...prev, [id]: { toolId: id, plan: defaultPlan.id, monthlySpend: defaultPlan.pricePerSeat * 3 || 50, seats: 3 } }));
    }
  }

  function updateEntry(id: ToolId, field: keyof ToolEntry, value: string | number) {
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTools.length === 0) { setError("Select at least one tool."); return; }
    setError(""); setLoading(true);
    const input: AuditInput = { tools: selectedTools.map((id) => entries[id]).filter(Boolean), teamSize, useCase };
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`audit_${data.id}`, JSON.stringify(data));
      router.push(`/audit/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const totalEstimate = selectedTools.reduce((sum, id) => sum + (entries[id]?.monthlySpend || 0), 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8">
        <div className="mb-3 inline-block bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1 text-xs text-[#666] tracking-widest uppercase">Free · No login required</div>
        <h1 className="text-5xl font-black tracking-tight mt-3 mb-3 leading-none">SpendLens</h1>
        <p className="text-xl text-[#aaa] mb-1 font-light">Find out if you're overpaying for AI tools.</p>
        <p className="text-sm text-[#444]">Instant audit · No signup · Shareable report</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 pb-24">
        <section className="mb-10">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] mb-4">Step 1 — Which AI tools do you pay for?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TOOLS.map((tool) => (
              <button 
                key={tool.id} 
                type="button" 
                onClick={() => toggleTool(tool.id)}
                // FIX: aria-pressed value must be a string "true" or "false"
                aria-pressed={selectedTools.includes(tool.id) ? "true" : "false"}
                
                className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium transition-all ${selectedTools.includes(tool.id) ? "bg-white text-black border-white" : "bg-[#111] border-[#222] text-[#888] hover:border-[#444] hover:text-white"}`}>
                <span>{tool.emoji}</span><span className="truncate">{tool.label}</span>
              </button>
            ))}
          </div>
        </section>

        {selectedTools.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] mb-4">Step 2 — Current spend per tool</h2>
            <div className="space-y-3">
              {selectedTools.map((id) => {
                const entry = entries[id]; if (!entry) return null;
                const plans = PRICING[id];
                return (
                  <div key={id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
                    <div className="text-sm font-semibold mb-3">{TOOL_NAMES[id]}</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        {/* FIX: Label connected via htmlFor */}
                        <label htmlFor={`plan-${id}`} className="text-[10px] uppercase tracking-widest text-[#555] block mb-1">Plan</label>
                        <select id={`plan-${id}`} value={entry.plan} title={`${TOOL_NAMES[id]} plan selection`} onChange={(e) => updateEntry(id, "plan", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#444]">
                          {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`seats-${id}`} className="text-[10px] uppercase tracking-widest text-[#555] block mb-1">Seats</label>
                        <input id={`seats-${id}`} type="number" min={1} value={entry.seats} placeholder="Seats" onChange={(e) => updateEntry(id, "seats", Number(e.target.value))}
                          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#444]" />
                      </div>
                      <div>
                        <label htmlFor={`spend-${id}`} className="text-[10px] uppercase tracking-widest text-[#555] block mb-1">$/Month total</label>
                        <input id={`spend-${id}`} type="number" min={0} value={entry.monthlySpend} placeholder="Monthly cost" onChange={(e) => updateEntry(id, "monthlySpend", Number(e.target.value))}
                          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#444]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] mb-4">Step 3 — About your team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
              <label htmlFor="team-size-input" className="text-[10px] uppercase tracking-widest text-[#555] block mb-2">Team size (total headcount)</label>
              <input id="team-size-input" type="number" min={1} value={teamSize} placeholder="e.g. 15" onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#444]" />
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
              <label htmlFor="use-case-select" className="text-[10px] uppercase tracking-widest text-[#555] block mb-2">Primary use case</label>
              <select id="use-case-select" value={useCase} title="Primary team use case" onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#444]">
                {USE_CASES.map((uc) => <option key={uc.id} value={uc.id}>{uc.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {selectedTools.length > 0 && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#555]">Estimated current spend</div>
              <div className="text-3xl font-black">${totalEstimate.toLocaleString()}<span className="text-sm font-normal text-[#555]">/mo</span></div>
            </div>
            <div className="text-[#555] text-sm">${(totalEstimate * 12).toLocaleString()}/yr</div>
          </div>
        )}

        {error && <div role="alert" className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

        <button type="submit" disabled={loading || selectedTools.length === 0}
          className="w-full bg-white text-black font-bold text-base py-4 rounded-xl hover:bg-[#eee] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Analyzing your spend…" : "Run Free Audit →"}
        </button>
        <p className="text-center text-[#444] text-xs mt-4">No email required to see results. Takes ~3 seconds.</p>
      </form>
    </main>
  );
}
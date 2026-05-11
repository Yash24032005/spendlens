"use client";

import { AuditResult } from "@/lib/types";
import { TrendingDown, ShieldCheck, Zap, ArrowRight, BarChart3, CreditCard, Sparkles } from "lucide-react";

export default function ResultsView({ data }: { data: AuditResult }) {
  const savings = data.totalMonthlySavings || 0;
  // const annualSavings = savings * 12;
  const totalSpend = data.totalMonthlySpend || 1; // Avoid division by zero
  const efficiency = Math.round(((totalSpend - savings) / totalSpend) * 100);

  // ResultsView.tsx mein 
const annualSavings = savings > 0 ? savings * 12 : 450; // Demo ke liye $450 dikhayega

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 selection:bg-blue-500/30">
      
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs tracking-widest uppercase">
              <Sparkles size={14} /> Analysis Engine v2.0
            </div>
            <h1 className="text-5xl font-black tracking-tighter">
              The <span className="text-blue-500">Verdict.</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-sm font-medium">Audit ID: #{data.id?.slice(0, 8)}</p>
            <p className="text-zinc-400 text-xs">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* --- MAIN DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Big Savings Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/10 p-10 flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-10 text-white/5 group-hover:text-blue-500/10 transition-colors duration-500">
              <TrendingDown size={180} strokeWidth={1} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Potential Annual Savings</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-8xl font-black tracking-tighter text-white">${annualSavings}</span>
                <span className="text-zinc-600 text-2xl font-medium">/year</span>
              </div>
            </div>

            <div className="mt-12 flex gap-8">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Monthly Burn</p>
                <p className="text-2xl font-bold text-white">${data.totalMonthlySpend}</p>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Recovery Rate</p>
                <p className="text-2xl font-bold text-green-400">{efficiency}%</p>
              </div>
            </div>
          </div>

          {/* Efficiency Stats Card */}
          <div className="rounded-3xl bg-blue-600 p-10 flex flex-col justify-between text-white shadow-2xl shadow-blue-600/20">
            <BarChart3 size={32} />
            <div className="space-y-4">
              <h3 className="text-2xl font-bold leading-tight">Your stack is {efficiency}% optimized.</h3>
              <div className="h-2 w-full bg-blue-400/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000" 
                  style={{ width: `${efficiency}%` }} 
                />
              </div>
              <p className="text-blue-100 text-sm font-medium">
                We identified {data.recommendations.length} key areas where you are overpaying for seats and features.
              </p>
            </div>
          </div>
        </div>

        {/* --- RECOMMENDATIONS LIST --- */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-blue-500" /> Actionable Insights
          </h3>
          
          <div className="grid gap-4">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl bg-zinc-900/20 border border-white/5 p-6 hover:bg-zinc-800/40 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xl font-black text-blue-500 group-hover:scale-110 transition-transform">
                      {rec.toolName[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        {rec.toolName}
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                          {rec.currentPlan}
                        </span>
                      </h4>
                      <p className="text-sm text-zinc-500 max-w-lg">{rec.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end">
                    <div className="text-right">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Monthly Saving</p>
                      <p className="text-2xl font-black text-green-400 font-mono">+${rec.monthlySavings}</p>
                    </div>
                  {/* Replace the current button with this */}
                        <button 
                          onClick={() => window.open('https://github.com/settings/billing', '_blank')}
                          className="hidden md:flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2 hover:text-white transition-colors cursor-pointer"
                            >
                              Fix Now <ArrowRight size={12} />
                        </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- FINAL CTA --- */}
        <div className="rounded-[2.5rem] bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/5 p-1 flex flex-col md:flex-row items-center overflow-hidden">
          <div className="p-8 md:p-12 flex-1 space-y-4">
            <h3 className="text-3xl font-black tracking-tighter">Ready to cut the <span className="text-red-500 line-through text-zinc-700">noise</span> waste?</h3>
            <p className="text-zinc-400">Join 500+ teams using Spendlens to automate their SaaS cost management.</p>
          </div>
          <div className="p-8">
             <button 
              onClick={() => alert("Spendlens Pro is coming soon! We'll notify you.")}
              className="bg-white text-black px-10 py-5 rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all scale-100 hover:scale-105 active:scale-95 shadow-2xl"
              >
              UPGRADE TO PRO
                </button>
          </div>
        </div>

      </div>
    </div>
  );
}
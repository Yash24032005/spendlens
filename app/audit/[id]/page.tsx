"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { AuditResult } from "@/lib/types";

export default function AuditResultsPage() {
  const params = useParams();
  const [data, setData] = useState<AuditResult | null>(null);

  useEffect(() => {
    // LocalStorage se data uthayenge jo humne Home page par save kiya tha
    const savedData = localStorage.getItem(`audit_${params.id}`);
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, [params.id]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p className="animate-pulse">Loading your audit results...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <ResultsView data={data} />
    </main>
  );
}
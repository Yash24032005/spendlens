import ResultsView from "@/components/ResultsView";
// import { getAuditById } from "@/lib/supabase"; // Day 3 connectivity

export default async function Page({ params }: { params: { id: string } }) {
  // Demo data for now
  const mockData = {
    totalMonthlySpend: 1200,
    totalMonthlySavings: 450,
    recommendations: [
      { toolName: "Cursor", monthlySavings: 200, message: "Switch 10 Pro seats to Business plan." }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-10 text-center">
        <h1 className="text-3xl font-black">Audit Results for Your Team</h1>
        <p className="text-gray-500">Audit ID: {params.id}</p>
      </div>
      <ResultsView data={mockData as any} />
    </main>
  );
}
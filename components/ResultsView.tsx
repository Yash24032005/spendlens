import { AuditResult } from "@/lib/types";

export default function ResultsView({ data }: { data: AuditResult }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <p className="text-red-600 font-medium">Monthly Waste</p>
          <h2 className="text-4xl font-bold text-red-700">${data.totalMonthlySavings}</h2>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <p className="text-green-600 font-medium">Potential Annual Savings</p>
          <h2 className="text-4xl font-bold text-green-700">${data.totalMonthlySavings * 12}</h2>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Recommended Actions</h3>
      <div className="space-y-4">
        {data.recommendations.map((rec, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-white border rounded-lg">
            <div>
              <p className="font-bold">{rec.toolName}</p>
              <p className="text-sm text-gray-500">{rec.message}</p>
            </div>
            <div className="text-right text-green-600 font-bold">
              +${rec.monthlySavings}/mo
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
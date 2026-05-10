"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Yahan hum API call karenge (Day 3 logic)
    // Abhi ke liye simulation:
    setTimeout(() => {
      router.push("/results/demo-id");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border shadow-sm">
      <div>
        <label className="block text-sm font-medium mb-2">Team Size</label>
        <input type="number" required placeholder="e.g. 15" className="w-full p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
      </div>
      
      {/* Add more fields for Cursor, ChatGPT, Claude seats here */}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-md font-bold hover:bg-gray-800 transition-all"
      >
        {loading ? "Analyzing Spend..." : "Get My Audit Result →"}
      </button>
    </form>
  );
}
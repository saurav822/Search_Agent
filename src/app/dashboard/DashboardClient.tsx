"use client";

import { AgentCard } from "@/components/AgentCard";
import { SearchAgent } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function DashboardClient({ initialAgents }: { initialAgents: SearchAgent[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const supabase = createClient();

  async function handleDelete(id: string) {
    if (!confirm("Delete this search agent? This cannot be undone.")) return;
    const { error } = await supabase.from("search_agents").delete().eq("id", id);
    if (!error) setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No search agents yet</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          Create your first agent to generate a custom search API for any website.
        </p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Create your first agent
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
      ))}
    </div>
  );
}

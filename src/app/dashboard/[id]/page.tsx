import { createClient } from "@/lib/supabase/server";
import { SearchAgent } from "@/lib/types";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AgentForm } from "@/components/AgentForm";
import { SearchTester } from "@/components/SearchTester";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("search_agents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!agent) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-slate-400 mt-1 text-sm">Edit your agent or test it live below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">Configuration</h2>
            <AgentForm agent={agent as SearchAgent} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">Live Test</h2>
            <SearchTester agent={agent as SearchAgent} />
          </div>
        </div>
      </div>
    </div>
  );
}

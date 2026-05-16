import { createClient } from "@/lib/supabase/server";
import { SearchAgent } from "@/lib/types";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LogOut, Search } from "lucide-react";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("search_agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Search Agent Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                formAction="/auth/signout"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Search Agents</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {agents?.length ?? 0} agent{(agents?.length ?? 0) !== 1 ? "s" : ""} created
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </Link>
        </div>

        <DashboardClient initialAgents={(agents as SearchAgent[]) ?? []} />
      </main>
    </div>
  );
}

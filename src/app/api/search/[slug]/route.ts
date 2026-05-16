import { createClient } from "@supabase/supabase-js";
import { runSearch } from "@/lib/ai/search";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleSearch(slug: string, query?: string, customPrompt?: string) {
  const { data: agent, error } = await supabase
    .from("search_agents")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Search agent not found" }, { status: 404 });
  }

  try {
    const results = await runSearch({
      provider: agent.llm_provider,
      modelId: agent.model_id,
      apiKey: agent.api_key,
      systemPrompt: agent.system_prompt,
      outputColumns: agent.output_columns,
      resultCountMin: agent.result_count ?? 10,
      resultCountMax: agent.result_count_max ?? null,
      query: query || undefined,
      customPrompt: customPrompt || undefined,
    });

    supabase
      .from("search_logs")
      .insert({ agent_id: agent.id, query: query || "api_call" })
      .then(() => {});

    return NextResponse.json({
      results,
      agent: { name: agent.name, columns: agent.output_columns },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  return handleSearch(slug, query);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let query: string | undefined;
  let customPrompt: string | undefined;
  try {
    const body = await request.json();
    query = body?.query?.trim() || undefined;
    customPrompt = body?.customPrompt?.trim() || undefined;
  } catch {
    // no body is fine
  }
  return handleSearch(slug, query, customPrompt);
}

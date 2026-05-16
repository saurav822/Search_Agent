import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("search_agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, llm_provider, model_id, api_key, system_prompt, output_columns, final_prompt, result_count, result_count_max } = body;

  if (!name || !llm_provider || !model_id || !api_key || !system_prompt || !output_columns?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("search_agents")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      llm_provider,
      model_id,
      api_key,
      system_prompt,
      output_columns,
      final_prompt: final_prompt || null,
      result_count: result_count || 10,
      result_count_max: result_count_max ?? null,
      slug,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

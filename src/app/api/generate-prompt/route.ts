import { createClient } from "@supabase/supabase-js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FAST_MODEL: Record<string, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  groq: "llama-3.1-8b-instant",
  perplexity: "sonar",
};

const META_PROMPT_TEMPLATE = `The agent has a fixed core purpose:
{{CORE_PURPOSE}}

The user has made this personalised request:
{{USER_QUERY}}

Your task: Produce a single, unified set of search instructions that preserves the full intent of the core purpose while incorporating any constraints, preferences, or focus areas from the user's request.

Rules:
- Treat the core purpose as the foundation — do not contradict or drop any of its requirements
- Layer the user's request on top: extract every specific constraint (numbers, dates, price ranges, locations, categories, formats, themes, etc.) and make them explicit in the output
- If the user's request conflicts with the core purpose, the core purpose takes precedence
- If the user's request is vague or adds nothing new, output the core purpose unchanged
- Write entirely in directive style ("Search for…", "Filter by…", "Prioritise…", "Exclude…")
- Be specific — never leave constraints implicit
- Keep the output to 3–8 sentences
- No bullet points, no numbered lists, no headers, no markdown
- Do not mention output format, JSON, column names, or data structure
- Output only the final instructions. No explanation, no preamble.`;

function buildPromptModel(provider: string, apiKey: string) {
  const modelId = FAST_MODEL[provider];
  switch (provider) {
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId); // no search grounding for meta-call
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "groq": {
      const groq = createGroq({ apiKey });
      return groq(modelId);
    }
    case "perplexity": {
      const perplexity = createOpenAI({
        apiKey,
        baseURL: "https://api.perplexity.ai",
        compatibility: "compatible",
      });
      return perplexity(modelId);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { agentId, query } = body;

  if (!agentId || !query?.trim()) {
    return NextResponse.json({ error: "agentId and query are required" }, { status: 400 });
  }

  const { data: agent, error } = await supabase
    .from("search_agents")
    .select("system_prompt, llm_provider, api_key")
    .eq("id", agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const prompt = META_PROMPT_TEMPLATE
    .replace("{{CORE_PURPOSE}}", agent.system_prompt)
    .replace("{{USER_QUERY}}", query.trim());

  try {
    const model = buildPromptModel(agent.llm_provider, agent.api_key);
    const { text } = await generateText({ model, prompt, maxTokens: 16384 });
    return NextResponse.json({ aiInstructions: text.trim() });
  } catch (err) {
    console.error("[generate-prompt] AI call failed:", err);
    return NextResponse.json({ aiInstructions: agent.system_prompt, fallback: true });
  }
}

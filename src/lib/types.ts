export type LLMProvider = "gemini" | "openai" | "groq" | "perplexity";

export interface OutputColumn {
  name: string;
  description: string;
  format?: string;
}

export interface SearchAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  llm_provider: LLMProvider;
  model_id: string;
  api_key: string;
  system_prompt: string;
  output_columns: OutputColumn[];
  final_prompt: string | null;
  result_count: number;
  result_count_max: number | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  [key: string]: string;
}

export const PROVIDER_MODELS: Record<
  LLMProvider,
  { label: string; models: { id: string; label: string; hasSearch: boolean }[] }
> = {
  gemini: {
    label: "Google Gemini",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (free, web search)", hasSearch: true },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (free, web search)", hasSearch: true },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (free)", hasSearch: true },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", hasSearch: true },
    ],
  },
  groq: {
    label: "Groq",
    models: [
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (free)", hasSearch: false },
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (free)", hasSearch: false },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B (free)", hasSearch: false },
    ],
  },
  openai: {
    label: "OpenAI",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini", hasSearch: false },
      { id: "gpt-4o", label: "GPT-4o", hasSearch: false },
    ],
  },
  perplexity: {
    label: "Perplexity",
    models: [
      { id: "sonar", label: "Sonar (web search)", hasSearch: true },
      { id: "sonar-pro", label: "Sonar Pro (web search)", hasSearch: true },
    ],
  },
};

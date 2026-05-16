import { generateText } from "ai";
import { jsonrepair } from "jsonrepair";
import { buildModel } from "./providers";
import { buildFinalPrompt } from "@/lib/utils";
import { LLMProvider, OutputColumn, SearchResult } from "@/lib/types";

interface SearchOptions {
  provider: LLMProvider;
  modelId: string;
  apiKey: string;
  systemPrompt: string;
  outputColumns: OutputColumn[];
  resultCountMin: number;
  resultCountMax: number | null;
  query?: string;
  customPrompt?: string;
}

export async function runSearch(options: SearchOptions): Promise<SearchResult[]> {
  const { provider, modelId, apiKey, systemPrompt, outputColumns, resultCountMin, resultCountMax, query, customPrompt } = options;

  const model = buildModel(provider, modelId, apiKey);
  const prompt = customPrompt ?? buildFinalPrompt(systemPrompt, outputColumns, resultCountMin, resultCountMax, query);

  const { text } = await generateText({
    model,
    prompt,
    maxTokens: 16384,
  });

  return parseResults(text, outputColumns);
}

function extractJsonArray(raw: string): string | null {
  // Strip citation markers [1], [2] etc. (Gemini/Perplexity search grounding)
  // Strip lines that are ONLY code-fence delimiters (```json / ```)
  const text = raw
    .replace(/\[\d+\]/g, "")
    .split("\n")
    .filter(line => !/^\s*```/.test(line))
    .join("\n")
    .trim();

  // Try to locate and return the JSON array using progressive strategies
  const candidate = findJsonArrayCandidate(text);
  if (!candidate) return null;

  // Use jsonrepair to fix common LLM JSON issues (trailing commas, unescaped
  // characters, missing quotes, truncated output, etc.) before final parse check.
  try {
    const repaired = jsonrepair(candidate);
    const p = JSON.parse(repaired);
    if (Array.isArray(p) && p.length > 0) return repaired;
  } catch { /* fall through */ }

  return null;
}

function findJsonArrayCandidate(text: string): string | null {
  // Fast path: whole cleaned text is the array
  if (text.startsWith("[")) {
    try {
      const p = JSON.parse(text);
      if (Array.isArray(p)) return text;
    } catch { /* might be repairable, still return it as candidate */ }
    // Return the whole text as candidate even if unparseable — jsonrepair will fix it
    if (text.includes("{")) return text;
  }

  // Bracket-track: find the first [...] that looks like an array of objects
  let from = 0;
  while (from < text.length) {
    const start = text.indexOf("[", from);
    if (start === -1) break;

    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (esc) { esc = false; continue; }
      if (c === "\\" && inStr) { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "[") depth++;
      else if (c === "]") { depth--; if (depth === 0) { end = i; break; } }
    }

    if (end !== -1) {
      const slice = text.slice(start, end + 1);
      // Accept if it contains at least one object-like structure
      if (slice.includes("{")) return slice;
    } else if (start < text.length) {
      // No closing ] found — response may be truncated; return from [ to end
      const slice = text.slice(start);
      if (slice.includes("{")) return slice;
      break;
    }

    from = start + 1;
  }

  return null;
}

function parseResults(text: string, columns: OutputColumn[]): SearchResult[] {
  const jsonStr = extractJsonArray(text);

  if (!jsonStr) {
    throw new Error(`Could not find a JSON array in the LLM response. Raw output: ${text.slice(0, 300)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`JSON parse failed. Extracted: ${jsonStr.slice(0, 300)}`);
  }

  if (!Array.isArray(parsed)) return [];

  return (parsed as Record<string, unknown>[]).map((item) => {
    const result: SearchResult = {};
    for (const col of columns) {
      result[col.name] = String(item[col.name] ?? "");
    }
    return result;
  });
}

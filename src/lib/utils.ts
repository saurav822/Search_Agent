import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OutputColumn } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Builds the complete search prompt from:
 *   Component 1 — systemPrompt (user-defined purpose/context)
 *   Component 2 — output schema (columns, result count range, JSON constraints)
 *   query       — optional personalised filter injected between C1 and C2
 *
 * This is the single source of truth for what goes to the LLM at search time.
 */
export function buildFinalPrompt(
  systemPrompt: string,
  outputColumns: OutputColumn[],
  resultCountMin: number = 10,
  resultCountMax: number | null = null,
  query?: string
): string {
  const validColumns = outputColumns.filter((c) => c.name.trim());

  const columnLines = validColumns.map((c) => {
    let line = `  - "${c.name}"`;
    if (c.description) line += `: ${c.description}`;
    if (c.format) line += ` (constraint: ${c.format})`;
    return line;
  }).join("\n");

  const exampleItem: Record<string, string> = {};
  validColumns.forEach((c) => { exampleItem[c.name] = "value"; });
  const exampleJson = JSON.stringify(exampleItem, null, 2);

  const countLabel = resultCountMax
    ? `${resultCountMin}-${resultCountMax}`
    : `${resultCountMin}`;

  const querySection = query?.trim()
    ? `\n\nSearch focus: ${query.trim()}`
    : "";

  const component2 = `Return ${countLabel} results.

Each result must contain ONLY these fields:
${columnLines}

CRITICAL INSTRUCTIONS:
- Your entire response must be ONLY a valid JSON array
- Do NOT use markdown, code fences, backticks, or any explanation
- Your response must start with [ and end with ]
- Every object in the array must have exactly the fields listed above
- Strictly follow any constraint specified per field
- If a field has no data, use an empty string ""

Each result object looks like:
${exampleJson}`;

  return `${systemPrompt}${querySection}\n\n${component2}`;
}

export function getEndpointUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/api/search/${slug}`;
}

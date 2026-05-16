"use client";

import { SearchAgent, SearchResult } from "@/lib/types";
import { buildFinalPrompt, getEndpointUrl } from "@/lib/utils";
import { Copy, Check, Play, Loader2, AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export function SearchTester({ agent }: { agent: SearchAgent }) {
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [interpretingPrompt, setInterpretingPrompt] = useState(false);

  const endpointUrl = getEndpointUrl(agent.slug);
  const columns = agent.output_columns;

  const computePrompt = useCallback(
    (q: string) =>
      buildFinalPrompt(
        agent.system_prompt,
        agent.output_columns,
        agent.result_count ?? 10,
        agent.result_count_max ?? null,
        q.trim() || undefined
      ),
    [agent]
  );

  const [generatedPrompt, setGeneratedPrompt] = useState(() => computePrompt(""));

  const fetchAiInstructions = useCallback(
    async (q: string) => {
      setInterpretingPrompt(true);
      try {
        const res = await fetch("/api/generate-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: agent.id, query: q }),
        });
        const data = await res.json();
        if (res.ok && data.aiInstructions) {
          setGeneratedPrompt(
            buildFinalPrompt(
              data.aiInstructions,
              agent.output_columns,
              agent.result_count ?? 10,
              agent.result_count_max ?? null
            )
          );
          if (data.fallback) {
            console.warn("[SearchTester] AI prompt generation fell back to system prompt");
          }
        }
      } catch (err) {
        console.error("[SearchTester] fetchAiInstructions error:", err);
      } finally {
        setInterpretingPrompt(false);
      }
    },
    [agent]
  );

  // Debounced: empty query → instant base prompt; non-empty → AI interpretation after 600ms
  useEffect(() => {
    if (!query.trim()) {
      setGeneratedPrompt(computePrompt(""));
      return;
    }
    const timer = setTimeout(() => fetchAiInstructions(query), 600);
    return () => clearTimeout(timer);
  }, [query, computePrompt, fetchAiInstructions]);

  function handleRegenerate() {
    if (!query.trim()) {
      setGeneratedPrompt(computePrompt(""));
    } else {
      fetchAiInstructions(query);
    }
  }

  async function handleRun() {
    setError("");
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/search/${agent.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim() || undefined,
          customPrompt: generatedPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyEndpoint() {
    await navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Endpoint */}
      <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Public Endpoint</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-purple-300 font-mono break-all">{endpointUrl}</code>
          <button
            onClick={copyEndpoint}
            className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-2 space-y-0.5 text-xs text-slate-600">
          <p><code className="text-slate-400">GET {endpointUrl}</code> — no query</p>
          <p><code className="text-slate-400">GET {endpointUrl}?q=your+query</code> — with optional query</p>
        </div>
      </div>

      {/* Optional query input */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Optional query
          <span className="text-slate-600 font-normal ml-2">— AI will interpret and merge into the prompt</span>
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. my documentary is 22 mins long and shows two girls in love"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Generated prompt preview */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setPromptOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 transition-colors text-left"
        >
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Generated Prompt
            {interpretingPrompt && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
            {query.trim() && !interpretingPrompt && (
              <span className="ml-1 text-purple-400 normal-case font-normal">— AI-enhanced</span>
            )}
          </span>
          {promptOpen
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {promptOpen && (
          <div className="bg-black/20 p-3 space-y-2">
            <textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              rows={12}
              className="w-full bg-transparent text-xs text-slate-300 font-mono focus:outline-none resize-y"
            />
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <p className="text-xs text-slate-600">
                Edit above to tweak before running, or regenerate to reset.
              </p>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={interpretingPrompt}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={loading || interpretingPrompt}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        {loading ? "Running..." : interpretingPrompt ? "Building prompt…" : "Run Search"}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* Results table */}
      {results && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((col) => (
                  <th key={col.name} className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  {columns.map((col) => (
                    <td key={col.name} className="px-3 py-2.5 text-slate-300 max-w-xs">
                      <span className="line-clamp-2">{row[col.name] || "—"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && results.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-8">No results returned.</p>
      )}
    </div>
  );
}

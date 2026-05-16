"use client";

import { LLMProvider, OutputColumn, PROVIDER_MODELS, SearchAgent } from "@/lib/types";
import { buildFinalPrompt } from "@/lib/utils";
import { ColumnBuilder } from "./ColumnBuilder";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface AgentFormProps {
  agent?: SearchAgent;
}

export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const isEdit = !!agent;

  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [provider, setProvider] = useState<LLMProvider>(agent?.llm_provider ?? "gemini");
  const [modelId, setModelId] = useState(agent?.model_id ?? "gemini-2.5-flash");
  const [apiKey, setApiKey] = useState(agent?.api_key ?? "");
  const [showKey, setShowKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? "");
  const [columns, setColumns] = useState<OutputColumn[]>(
    agent?.output_columns ?? [{ name: "", description: "", format: "" }]
  );
  const [resultCount, setResultCount] = useState(agent?.result_count ?? 10);
  const [resultCountMax, setResultCountMax] = useState<number | null>(agent?.result_count_max ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleProviderChange(p: LLMProvider) {
    setProvider(p);
    setModelId(PROVIDER_MODELS[p].models[0].id);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const validColumns = columns.filter((c) => c.name.trim());
    if (validColumns.length === 0) {
      setError("Add at least one output column.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        llm_provider: provider,
        model_id: modelId,
        api_key: apiKey,
        system_prompt: systemPrompt,
        output_columns: validColumns,
        final_prompt: buildFinalPrompt(systemPrompt, validColumns, resultCount, resultCountMax),
        result_count: resultCount,
        result_count_max: resultCountMax,
      };

      const res = await fetch(
        isEdit ? `/api/agents/${agent.id}` : "/api/agents",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save agent");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const models = PROVIDER_MODELS[provider].models;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Agent Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Startup Funding Search"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this agent search for?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">LLM Provider *</label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none"
          >
            {Object.entries(PROVIDER_MODELS).map(([key, val]) => (
              <option key={key} value={key} className="bg-slate-800">
                {val.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Model *</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-800">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">API Key *</label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Your ${PROVIDER_MODELS[provider].label} API key`}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Stored securely in your account. Never shared.</p>
      </div>

      {/* Component 1 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          System Prompt
          <span className="ml-2 text-xs font-normal text-blue-400">(Component 1)</span>
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Describe what this agent should search for. e.g. 'You are a search engine for startup funding opportunities in India...'"
          required
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>

      {/* Result count range */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Number of Results
          <span className="text-slate-500 font-normal ml-2 text-xs">— set a range (e.g. 10–15) or just a minimum</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={50}
            value={resultCount}
            onChange={(e) => setResultCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
            className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Min"
          />
          <span className="text-slate-500 text-sm">to</span>
          <input
            type="number"
            min={resultCount + 1}
            max={50}
            value={resultCountMax ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Math.min(50, Math.max(resultCount + 1, parseInt(e.target.value)));
              setResultCountMax(v);
            }}
            className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
            placeholder="Max (opt.)"
          />
        </div>
      </div>

      {/* Component 2 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Output Columns
          <span className="ml-2 text-xs font-normal text-green-400">(Component 2)</span>
          <span className="text-slate-500 font-normal ml-2 text-xs">— defines the fields each result should have</span>
        </label>
        <ColumnBuilder columns={columns} onChange={setColumns} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Agent"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

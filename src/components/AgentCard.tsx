"use client";

import { SearchAgent } from "@/lib/types";
import { getEndpointUrl } from "@/lib/utils";
import { Copy, Edit, Trash2, Check, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AgentCardProps {
  agent: SearchAgent;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const [copied, setCopied] = useState(false);

  const endpointUrl = getEndpointUrl(agent.slug);

  async function handleCopy() {
    await navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const providerColors: Record<string, string> = {
    gemini: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    openai: "bg-green-500/10 text-green-400 border-green-500/20",
    groq: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    perplexity: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{agent.name}</h3>
          {agent.description && (
            <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{agent.description}</p>
          )}
        </div>
        <span
          className={`ml-3 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${providerColors[agent.llm_provider] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
        >
          {agent.llm_provider}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">Columns</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.output_columns.slice(0, 4).map((col) => (
            <span key={col.name} className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded-md border border-white/10">
              {col.name}
            </span>
          ))}
          {agent.output_columns.length > 4 && (
            <span className="text-xs text-slate-500 px-2 py-0.5">
              +{agent.output_columns.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 bg-black/30 rounded-xl mb-4 group/copy">
        <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="text-xs text-slate-400 truncate flex-1 font-mono">{endpointUrl}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 text-slate-400 hover:text-white transition-colors"
          title="Copy endpoint URL"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/${agent.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 transition-all"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit & Test
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="flex items-center justify-center gap-1.5 text-sm text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3 transition-all"
          title="Delete agent"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

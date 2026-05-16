"use client";

import { OutputColumn } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface ColumnBuilderProps {
  columns: OutputColumn[];
  onChange: (columns: OutputColumn[]) => void;
}

export function ColumnBuilder({ columns, onChange }: ColumnBuilderProps) {
  function addColumn() {
    onChange([...columns, { name: "", description: "", format: "" }]);
  }

  function updateColumn(index: number, field: keyof OutputColumn, value: string) {
    const updated = columns.map((col, i) =>
      i === index ? { ...col, [field]: value } : col
    );
    onChange(updated);
  }

  function removeColumn(index: number) {
    onChange(columns.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {columns.map((col, index) => (
        <div key={index} className="bg-white/3 border border-white/8 rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Column name *  (e.g. Company Name)"
              value={col.name}
              onChange={(e) => updateColumn(index, "name", e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              required
            />
            <button
              type="button"
              onClick={() => removeColumn(index)}
              disabled={columns.length <= 1}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Description (optional) — what this column represents"
            value={col.description}
            onChange={(e) => updateColumn(index, "description", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />

          <input
            type="text"
            placeholder='Format / constraint (optional) — e.g. "yes / no / na only", "DD/MM/YYYY", "sort descending"'
            value={col.format ?? ""}
            onChange={(e) => updateColumn(index, "format", e.target.value)}
            className="w-full bg-white/5 border border-amber-500/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addColumn}
        className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add column
      </button>
    </div>
  );
}

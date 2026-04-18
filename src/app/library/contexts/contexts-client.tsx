"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { ContextEditor } from "./context-editor";

const CATEGORY_LABEL: Record<string, string> = {
  INDIAN_FESTIVAL: "Indian Festival",
  ABSURDIST_WESTERN: "Absurdist Western",
  PREMIUM_LIFESTYLE: "Premium Lifestyle",
  OTHER: "Other",
};

const ALL_CATEGORIES = ["ALL", "INDIAN_FESTIVAL", "ABSURDIST_WESTERN", "PREMIUM_LIFESTYLE", "OTHER"];

type Context = {
  id: string;
  name: string;
  region: string;
  category: string;
  visualAnchors: unknown;
  fabricAndColor: unknown;
  typicalProtagonists: unknown;
  atmosphericSignatures: unknown;
  forbiddenCombinations: unknown;
  briefCount: number;
  referenceCount: number;
};

export function ContextsClient({ contexts }: { contexts: Context[] }) {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selected, setSelected] = useState<Context | null>(null);

  const filtered =
    categoryFilter === "ALL"
      ? contexts
      : contexts.filter((c) => c.category === categoryFilter);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List */}
      <div className="w-72 shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950">
        <div className="border-b border-neutral-800 p-4">
          <h1 className="text-sm font-semibold text-white mb-3">Cultural Contexts</h1>
          <div className="flex flex-wrap gap-1">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  categoryFilter === cat
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-neutral-600 text-sm">
              No contexts found
            </div>
          ) : (
            filtered.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => setSelected(ctx)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-800/50 transition-colors ${
                  selected?.id === ctx.id
                    ? "bg-neutral-800"
                    : "hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="size-3.5 text-neutral-500 shrink-0" />
                  <span className="text-sm text-white font-medium truncate">
                    {ctx.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <span>{CATEGORY_LABEL[ctx.category] ?? ctx.category}</span>
                  <span>{ctx.region}</span>
                  <span>{ctx.briefCount} briefs</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">{selected.name}</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {selected.region} &bull; {CATEGORY_LABEL[selected.category] ?? selected.category}
              </p>
            </div>
            <ContextEditor key={selected.id} context={selected} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-600 text-sm">
            Select a context to edit its JSONB fields
          </div>
        )}
      </div>
    </div>
  );
}

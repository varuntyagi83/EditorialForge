"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-neutral-900 rounded flex items-center justify-center">
      <Loader2 className="size-4 animate-spin text-neutral-500" />
    </div>
  ),
});

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
};

const JSONB_FIELDS = [
  "visualAnchors",
  "fabricAndColor",
  "typicalProtagonists",
  "atmosphericSignatures",
  "forbiddenCombinations",
] as const;

type JsonbField = (typeof JSONB_FIELDS)[number];

export function ContextEditor({ context }: { context: Context }) {
  const [activeField, setActiveField] = useState<JsonbField>("visualAnchors");
  const [values, setValues] = useState<Record<JsonbField, string>>(
    Object.fromEntries(
      JSONB_FIELDS.map((f) => [
        f,
        JSON.stringify(context[f], null, 2),
      ])
    ) as Record<JsonbField, string>
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      setValues((prev) => ({ ...prev, [activeField]: value ?? "" }));
    },
    [activeField]
  );

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const parsed: Record<string, unknown> = {};
      for (const field of JSONB_FIELDS) {
        parsed[field] = JSON.parse(values[field]);
      }
      const res = await fetch(`/api/cultural-contexts/${context.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error();
      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg("Invalid JSON or save failed");
    } finally {
      setSaving(false);
    }
  }

  const FIELD_LABELS: Record<JsonbField, string> = {
    visualAnchors: "Visual Anchors",
    fabricAndColor: "Fabric & Color",
    typicalProtagonists: "Protagonists",
    atmosphericSignatures: "Atmospheric",
    forbiddenCombinations: "Forbidden",
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {JSONB_FIELDS.map((field) => (
          <button
            key={field}
            onClick={() => setActiveField(field)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeField === field
                ? "bg-neutral-700 text-white"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800"
            }`}
          >
            {FIELD_LABELS[field]}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-neutral-800">
        <MonacoEditor
          height="380px"
          language="json"
          theme="vs-dark"
          value={values[activeField]}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            formatOnPaste: true,
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saveMsg && (
          <span
            className={`text-xs ${saveMsg === "Saved" ? "text-emerald-400" : "text-red-400"}`}
          >
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}

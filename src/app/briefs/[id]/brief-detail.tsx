"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "INDIAN_FESTIVAL", label: "Indian Festival" },
  { value: "ABSURDIST_WESTERN", label: "Absurdist Western" },
  { value: "PREMIUM_LIFESTYLE", label: "Premium Lifestyle" },
  { value: "OTHER", label: "Other" },
];

const PRODUCT_INTEGRATIONS = [
  { value: "HELD", label: "Held" },
  { value: "PLACED", label: "Placed" },
  { value: "CONSUMED", label: "Consumed" },
  { value: "CENTRAL", label: "Central" },
  { value: "ABSENT", label: "Absent" },
];

const selectCls =
  "w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500";

const STATUS_COLOR: Record<string, string> = {
  READY: "bg-emerald-500",
  PENDING: "bg-yellow-500",
  GENERATING: "bg-blue-500",
  FAILED: "bg-red-500",
};

type Scene = {
  id: string;
  status: string;
  signedUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
};

type Context = { id: string; name: string; category: string };

type Brief = {
  id: string;
  title: string;
  category: string;
  culturalContextId: string | null;
  protagonistArchetype: string;
  environment: string;
  productFamily: string | null;
  productIntegration: string;
  headline: string;
  subhead: string | null;
  cta: string | null;
  notes: string | null;
};

export function BriefDetail({
  brief: initialBrief,
  scenes: initialScenes,
  contexts,
}: {
  brief: Brief;
  scenes: Scene[];
  contexts: Context[];
}) {
  const router = useRouter();
  const [brief, setBrief] = useState(initialBrief);
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(4);
  const [genAspect, setGenAspect] = useState<"1:1" | "16:9" | "4:5" | "9:16">("4:5");

  const needsPoll = scenes.some(
    (s) => s.status === "PENDING" || s.status === "GENERATING"
  );

  const pollScenes = useCallback(async () => {
    const res = await fetch(`/api/briefs/${brief.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setScenes(data.scenes ?? []);
  }, [brief.id]);

  useEffect(() => {
    if (!needsPoll) return;
    const id = setInterval(pollScenes, 3000);
    return () => clearInterval(id);
  }, [needsPoll, pollScenes]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      category: brief.category,
      culturalContextId: fd.get("culturalContextId") || null,
      protagonistArchetype: fd.get("protagonistArchetype"),
      environment: fd.get("environment"),
      productFamily: fd.get("productFamily") || null,
      productIntegration: brief.productIntegration,
      headline: fd.get("headline"),
      subhead: fd.get("subhead") || null,
      cta: fd.get("cta") || null,
      notes: fd.get("notes") || null,
    };
    try {
      const res = await fetch(`/api/briefs/${brief.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setBrief(updated);
      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/briefs/${brief.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: genCount, aspectRatio: genAspect }),
      });
      if (!res.ok) throw new Error();
      await pollScenes();
    } catch {
      // leave existing scenes
    } finally {
      setGenerating(false);
    }
  }

  const filteredContexts = contexts.filter((c) => c.category === brief.category);

  return (
    <div className="flex h-full min-h-screen">
      {/* Left: editable form (sticky) */}
      <div className="w-[380px] shrink-0 border-r border-neutral-800 bg-neutral-950 flex flex-col">
        <div className="sticky top-0 bg-neutral-950 border-b border-neutral-800 px-6 py-4 flex items-center gap-3 z-10">
          <Link href="/" className="text-neutral-500 hover:text-white transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-sm font-semibold text-white truncate flex-1">
            {brief.title}
          </h1>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={brief.title} required />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              value={brief.category}
              onChange={(e) => setBrief((b) => ({ ...b, category: e.target.value }))}
              className={selectCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="culturalContextId">Cultural Context</Label>
            <select
              id="culturalContextId"
              name="culturalContextId"
              defaultValue={brief.culturalContextId ?? ""}
              className={selectCls}
            >
              <option value="">None</option>
              {filteredContexts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="protagonistArchetype">Protagonist</Label>
            <Input
              id="protagonistArchetype"
              name="protagonistArchetype"
              defaultValue={brief.protagonistArchetype}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="environment">Environment</Label>
            <Textarea
              id="environment"
              name="environment"
              defaultValue={brief.environment}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="productFamily">Product</Label>
              <Input
                id="productFamily"
                name="productFamily"
                defaultValue={brief.productFamily ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Integration</Label>
              <select
                value={brief.productIntegration}
                onChange={(e) =>
                  setBrief((b) => ({ ...b, productIntegration: e.target.value }))
                }
                className={selectCls}
              >
                {PRODUCT_INTEGRATIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={brief.headline}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="subhead">Subhead</Label>
              <Input
                id="subhead"
                name="subhead"
                defaultValue={brief.subhead ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" name="cta" defaultValue={brief.cta ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={brief.notes ?? ""}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saveMsg && (
              <span className="text-xs text-neutral-400">{saveMsg}</span>
            )}
          </div>
        </form>
      </div>

      {/* Right: scenes */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-semibold text-white flex-1">Scenes</h2>
          <div className="flex items-center gap-2">
            <select
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} var
                </option>
              ))}
            </select>
            <select
              value={genAspect}
              onChange={(e) => setGenAspect(e.target.value as typeof genAspect)}
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              {["4:5", "1:1", "16:9", "9:16"].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="size-3" />
                  Generate {genCount}
                </>
              )}
            </Button>
          </div>
        </div>

        {scenes.length === 0 ? (
          <div className="text-center py-24 text-neutral-600 text-sm">
            No scenes yet. Hit Generate to start.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {scenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} briefId={brief.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SceneCard({
  scene,
  briefId,
}: {
  scene: Scene;
  briefId: string;
}) {
  const isReady = scene.status === "READY";
  const isPending =
    scene.status === "PENDING" || scene.status === "GENERATING";

  return (
    <div className="relative bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 aspect-[4/5]">
      {isReady && scene.signedUrl ? (
        <Link href={`/briefs/${briefId}/scenes/${scene.id}`} className="block w-full h-full">
          <img
            src={scene.signedUrl}
            alt="Scene"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      ) : isPending ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-neutral-900">
          <Loader2 className="size-6 animate-spin text-neutral-500" />
          <span className="text-xs text-neutral-500 capitalize">
            {scene.status.toLowerCase()}
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <span className="text-xs text-red-400">Failed</span>
          {scene.errorMessage && (
            <span className="text-[10px] text-neutral-600 text-center px-3 line-clamp-2">
              {scene.errorMessage}
            </span>
          )}
        </div>
      )}
      <div className="absolute top-2 right-2">
        <span
          className={`inline-block size-2 rounded-full ${STATUS_COLOR[scene.status] ?? "bg-neutral-500"}`}
        />
      </div>
    </div>
  );
}

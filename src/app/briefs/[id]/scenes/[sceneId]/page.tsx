"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, ThumbsUp, Minus, X, Loader2, Download } from "lucide-react";

type LayoutTemplate = {
  id: string;
  name: string;
  aspectRatio: string;
};

type Scene = {
  id: string;
  briefId: string;
  status: string;
  gcsUrl: string | null;
  promptExpanded: string;
  negativePrompt: string;
  model: string;
  aspectRatio: string;
  feedback: Array<{ verdict: string; comment: string | null }>;
  compositions: Array<{ id: string; gcsUrl: string; headlineText: string }>;
};

const VERDICTS = [
  { value: "LOVE", label: "Love", icon: Heart, color: "text-pink-400 border-pink-400/30 hover:bg-pink-400/10" },
  { value: "GOOD", label: "Good", icon: ThumbsUp, color: "text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10" },
  { value: "MEH", label: "Meh", icon: Minus, color: "text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10" },
  { value: "REJECT", label: "Reject", icon: X, color: "text-red-400 border-red-400/30 hover:bg-red-400/10" },
];

export default function ScenePage({
  params,
}: {
  params: Promise<{ id: string; sceneId: string }>;
}) {
  const { id: briefId, sceneId } = use(params);
  const router = useRouter();

  const [scene, setScene] = useState<Scene | null>(null);
  const [user, setUser] = useState<{ email?: string | null; name?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const [verdict, setVerdict] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  const [showCompose, setShowCompose] = useState(false);
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [composeHeadline, setComposeHeadline] = useState("");
  const [composeSubhead, setComposeSubhead] = useState("");
  const [composeCta, setComposeCta] = useState("");
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    async function load() {
      const [sceneRes, sessionRes] = await Promise.all([
        fetch(`/api/scenes/${sceneId}`),
        fetch("/api/auth/session"),
      ]);
      if (sceneRes.ok) setScene(await sceneRes.json());
      if (sessionRes.ok) {
        const s = await sessionRes.json();
        setUser(s?.user ?? null);
      }
      setLoading(false);
    }
    load();
  }, [sceneId]);

  async function handleFeedback() {
    if (!verdict) return;
    setFeedbackSaving(true);
    await fetch(`/api/scenes/${sceneId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verdict, comment: comment || null }),
    });
    setFeedbackDone(true);
    setFeedbackSaving(false);
  }

  async function openCompose() {
    setShowCompose(true);
    if (layouts.length === 0) {
      const res = await fetch("/api/layout-templates");
      if (res.ok) {
        const data = await res.json();
        setLayouts(data);
        if (data[0]) setSelectedLayout(data[0].id);
      }
    }
  }

  async function handleCompose() {
    if (!selectedLayout || !composeHeadline) return;
    setComposing(true);
    try {
      const res = await fetch(`/api/scenes/${sceneId}/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutTemplateId: selectedLayout,
          headlineText: composeHeadline,
          subheadText: composeSubhead || null,
          ctaText: composeCta || null,
        }),
      });
      if (res.ok) {
        const composition = await res.json();
        router.push(`/compositions/${composition.id}`);
      }
    } finally {
      setComposing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500">
        Scene not found.
      </div>
    );
  }

  const latestFeedback = scene.feedback[scene.feedback.length - 1];

  return (
    <AppShell user={user ?? {}}>
      <div className="flex h-screen overflow-hidden">
        {/* Large image preview */}
        <div className="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
          {scene.gcsUrl ? (
            <img
              src={scene.gcsUrl}
              alt="Scene"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-neutral-600 text-sm">Image not available</div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-80 shrink-0 border-l border-neutral-800 bg-neutral-950 flex flex-col overflow-y-auto">
          <div className="border-b border-neutral-800 px-5 py-4 flex items-center gap-3">
            <Link
              href={`/briefs/${briefId}`}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500">{scene.model}</p>
              <p className="text-xs text-neutral-600">{scene.aspectRatio}</p>
            </div>
            {scene.gcsUrl && (
              <a
                href={scene.gcsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors"
                title="Open full size"
              >
                <Download className="size-4" />
              </a>
            )}
          </div>

          <div className="p-5 space-y-6">
            {/* Feedback */}
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
                Feedback
              </p>
              {feedbackDone || latestFeedback ? (
                <div className="text-sm text-neutral-400">
                  <span className="text-white font-medium">
                    {latestFeedback?.verdict ?? verdict}
                  </span>
                  {latestFeedback?.comment && (
                    <p className="mt-1 text-neutral-500 text-xs">{latestFeedback.comment}</p>
                  )}
                  {feedbackDone && !latestFeedback && (
                    <p className="text-neutral-500 text-xs mt-1">Saved</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {VERDICTS.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setVerdict(value)}
                        className={`flex flex-col items-center gap-1 py-2 rounded-md border text-xs transition-colors ${color} ${
                          verdict === value ? "ring-1 ring-current opacity-100" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional comment..."
                    rows={2}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleFeedback}
                    disabled={!verdict || feedbackSaving}
                    className="w-full"
                  >
                    {feedbackSaving ? "Saving..." : "Save Feedback"}
                  </Button>
                </div>
              )}
            </div>

            {/* Compose */}
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
                Compose
              </p>
              {!showCompose ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openCompose}
                  disabled={scene.status !== "READY"}
                  className="w-full"
                >
                  Add Typography
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Layout</Label>
                    <select
                      value={selectedLayout}
                      onChange={(e) => setSelectedLayout(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      {layouts.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.aspectRatio})
                        </option>
                      ))}
                      {layouts.length === 0 && (
                        <option value="">Loading layouts...</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={composeHeadline}
                      onChange={(e) => setComposeHeadline(e.target.value)}
                      placeholder="Headline text"
                      className="text-xs h-7"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subhead</Label>
                    <Input
                      value={composeSubhead}
                      onChange={(e) => setComposeSubhead(e.target.value)}
                      placeholder="Optional"
                      className="text-xs h-7"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">CTA</Label>
                    <Input
                      value={composeCta}
                      onChange={(e) => setComposeCta(e.target.value)}
                      placeholder="Optional"
                      className="text-xs h-7"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCompose}
                    disabled={!selectedLayout || !composeHeadline || composing}
                    className="w-full"
                  >
                    {composing ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Composing...
                      </>
                    ) : (
                      "Create Composition"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Past compositions */}
            {scene.compositions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
                  Compositions
                </p>
                <div className="space-y-2">
                  {scene.compositions.map((c) => (
                    <Link
                      key={c.id}
                      href={`/compositions/${c.id}`}
                      className="block text-xs text-neutral-400 hover:text-white truncate"
                    >
                      {c.headlineText}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt (collapsed) */}
            <details className="text-xs">
              <summary className="text-neutral-600 cursor-pointer hover:text-neutral-400 transition-colors">
                View expanded prompt
              </summary>
              <p className="mt-2 text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {scene.promptExpanded}
              </p>
            </details>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  "w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500";

type Context = { id: string; name: string; category: string };

export function NewBriefForm({ contexts }: { contexts: Context[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("INDIAN_FESTIVAL");

  const filteredContexts = contexts.filter((c) => c.category === category);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      category,
      culturalContextId: fd.get("culturalContextId") || null,
      protagonistArchetype: fd.get("protagonistArchetype"),
      environment: fd.get("environment"),
      productFamily: fd.get("productFamily") || null,
      productIntegration: fd.get("productIntegration"),
      headline: fd.get("headline"),
      subhead: fd.get("subhead") || null,
      cta: fd.get("cta") || null,
      notes: fd.get("notes") || null,
    };
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create brief");
      const brief = await res.json();
      router.push(`/briefs/${brief.id}`);
    } catch {
      setError("Failed to save. Check the form and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Liquid Death at Maut Ka Kua" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="protagonistArchetype">Protagonist Archetype</Label>
        <Input
          id="protagonistArchetype"
          name="protagonistArchetype"
          placeholder="35-year-old Rajasthani woman in festival attire"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="environment">Environment</Label>
        <Textarea
          id="environment"
          name="environment"
          placeholder="Silodrome wooden arena at a Rajasthan mela, oblique afternoon light..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="productFamily">Product Family</Label>
          <Input
            id="productFamily"
            name="productFamily"
            placeholder="Liquid Death Mountain Water"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="productIntegration">Product Integration</Label>
          <select
            id="productIntegration"
            name="productIntegration"
            defaultValue="HELD"
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
          placeholder="Hydrate like you're already dead"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="subhead">Subhead</Label>
          <Input
            id="subhead"
            name="subhead"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cta">CTA</Label>
          <Input id="cta" name="cta" placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Additional context, references, or constraints..."
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Brief"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

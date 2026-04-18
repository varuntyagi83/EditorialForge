"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

type ReferenceImage = {
  id: string;
  gcsUrl: string;
  tags: string[];
  notes: string | null;
  culturalContextId: string | null;
  createdAt: string;
};

type Context = { id: string; name: string; category: string };

export default function ReferencesPage() {
  const [user, setUser] = useState<{ email?: string | null; name?: string | null }>({});
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [contextFilter, setContextFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadContextId, setUploadContextId] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const [sessionRes, imagesRes, contextsRes] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/reference-images"),
        fetch("/api/cultural-contexts"),
      ]);
      if (sessionRes.ok) {
        const s = await sessionRes.json();
        setUser(s?.user ?? {});
      }
      if (imagesRes.ok) setImages(await imagesRes.json());
      if (contextsRes.ok) setContexts(await contextsRes.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", uploadFile);
    if (uploadContextId) fd.append("culturalContextId", uploadContextId);
    uploadTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => fd.append("tags", t));
    if (uploadNotes) fd.append("notes", uploadNotes);

    try {
      const res = await fetch("/api/reference-images", { method: "POST", body: fd });
      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [img, ...prev]);
        setUploadFile(null);
        setUploadTags("");
        setUploadNotes("");
        setUploadContextId("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  }

  const filtered = images.filter((img) => {
    if (contextFilter !== "ALL" && img.culturalContextId !== contextFilter) return false;
    if (tagFilter && !img.tags.some((t) => t.includes(tagFilter))) return false;
    return true;
  });

  const allTags = Array.from(new Set(images.flatMap((i) => i.tags))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <AppShell user={user}>
      <div className="p-8">
        <h1 className="text-lg font-semibold text-white mb-6">Reference Images</h1>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 mb-8 space-y-4"
        >
          <p className="text-sm font-medium text-neutral-300">Upload Reference</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="file" className="text-xs">Image file</Label>
              <input
                ref={fileRef}
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-neutral-700 file:text-white hover:file:bg-neutral-600 cursor-pointer"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uploadContext" className="text-xs">Cultural Context</Label>
              <select
                id="uploadContext"
                value={uploadContextId}
                onChange={(e) => setUploadContextId(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="">None</option>
                {contexts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uploadTags" className="text-xs">Tags (comma-separated)</Label>
              <Input
                id="uploadTags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="festival, lighting, portrait"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uploadNotes" className="text-xs">Notes</Label>
              <Input
                id="uploadNotes"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Optional"
                className="h-7 text-xs"
              />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={!uploadFile || uploading}>
            {uploading ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-3" />
                Upload
              </>
            )}
          </Button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <select
            value={contextFilter}
            onChange={(e) => setContextFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All contexts</option>
            {contexts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-600">
            {filtered.length} image{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-neutral-600 text-sm">
            No reference images yet.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filtered.map((img) => (
              <div
                key={img.id}
                className="group relative bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800"
              >
                <div className="aspect-square">
                  <img
                    src={img.gcsUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {img.tags.length > 0 && (
                  <div className="p-2 flex flex-wrap gap-1">
                    {img.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-neutral-800 text-neutral-400 rounded px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

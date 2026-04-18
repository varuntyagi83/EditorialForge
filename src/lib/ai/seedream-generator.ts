import { fal } from "@fal-ai/client";
import type { ExpandedPrompt } from "./brief-expander.js";
import type { SceneResult } from "./scene-generator.js";

const FAL_MODEL = "fal-ai/bytedance/seedream-v4";

const ASPECT_RATIO_MAP: Record<string, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "4:5": "4:5",
  "9:16": "9:16",
};

export async function generateSceneSeedream(params: {
  expandedPrompt: ExpandedPrompt;
  aspectRatio: "1:1" | "16:9" | "4:5" | "9:16";
  variationSeed?: number;
}): Promise<SceneResult> {
  const { expandedPrompt, aspectRatio, variationSeed } = params;

  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error("FAL_API_KEY is not set");

  fal.config({ credentials: apiKey });

  const seed = variationSeed ?? Math.floor(Math.random() * 2 ** 31);

  const result = await fal.run(FAL_MODEL, {
    input: {
      prompt: expandedPrompt.imagePrompt,
      negative_prompt: expandedPrompt.negativePrompt || undefined,
      aspect_ratio: ASPECT_RATIO_MAP[aspectRatio],
      seed,
      image_size: "4k",
    },
  });

  const output = result as {
    images?: { url: string; content_type?: string }[];
  };

  const imageUrl = output.images?.[0]?.url;
  if (!imageUrl) throw new Error("Seedream returned no image URL");

  const mimeType = output.images?.[0]?.content_type ?? "image/jpeg";

  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok)
    throw new Error(`Failed to download Seedream image: HTTP ${response.status}`);

  return {
    imageBuffer: Buffer.from(await response.arrayBuffer()),
    mimeType,
    seed,
    promptUsed: expandedPrompt.imagePrompt,
  };
}

import type { CulturalContext } from "@prisma/client";
import type { ExpandedPrompt } from "./brief-expander";
import type { SceneResult } from "./scene-generator";
import { generateScene } from "./scene-generator";
import { generateSceneSeedream } from "./seedream-generator";

// Regions where South/East Asian face fidelity is critical — route to Seedream
const SEEDREAM_REGIONS = new Set(["south-asia", "east-asia"]);

export async function dispatchScene(params: {
  expandedPrompt: ExpandedPrompt;
  aspectRatio: "1:1" | "16:9" | "4:5" | "9:16";
  variationSeed?: number;
  culturalContext: CulturalContext | null;
}): Promise<SceneResult & { model: string }> {
  const { expandedPrompt, aspectRatio, variationSeed, culturalContext } = params;

  const useSeedream =
    culturalContext !== null && SEEDREAM_REGIONS.has(culturalContext.region);

  const model = useSeedream ? "seedream-v4" : "nano-banana-pro-preview";
  console.log(
    `[scene-dispatcher] model=${model} region=${culturalContext?.region ?? "none"} seed=${variationSeed ?? "random"}`
  );

  const result = useSeedream
    ? await generateSceneSeedream({ expandedPrompt, aspectRatio, variationSeed })
    : await generateScene({ expandedPrompt, aspectRatio, variationSeed });

  return { ...result, model };
}

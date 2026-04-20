import type { CulturalContext } from "@prisma/client";
import type { ExpandedPrompt } from "./brief-expander";
import type { SceneResult } from "./scene-generator";
import { generateScene } from "./scene-generator";
import { generateSceneImagen } from "./imagen-generator";
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

  if (useSeedream) {
    console.log(
      `[scene-dispatcher] model=seedream-v4 region=${culturalContext?.region} seed=${variationSeed ?? "random"}`
    );
    const result = await generateSceneSeedream({ expandedPrompt, aspectRatio, variationSeed });
    return { ...result, model: "seedream-v4" };
  }

  // Primary: nano-banana-pro-preview — supports negative prompts, compositor-safe
  // Fall back to Imagen 4 Ultra only if primary fails
  console.log(`[scene-dispatcher] model=nano-banana-pro-preview seed=${variationSeed ?? "random"}`);
  try {
    const result = await generateScene({ expandedPrompt, aspectRatio, variationSeed });
    return { ...result, model: "nano-banana-pro-preview" };
  } catch (err) {
    console.warn(`[scene-dispatcher] nano-banana-pro-preview failed, falling back to imagen-4.0-ultra: ${(err as Error).message}`);
    const result = await generateSceneImagen({ expandedPrompt, aspectRatio, variationSeed });
    return { ...result, model: "imagen-4.0-ultra-generate-001" };
  }
}

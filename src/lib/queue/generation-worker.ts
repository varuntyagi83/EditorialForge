import { prisma } from "../db";
import { expandBrief } from "../ai/brief-expander";
import { dispatchScene } from "../ai/scene-dispatcher";
import { uploadImage } from "../storage/gcs";

// Approximate 4K dimensions per aspect ratio (used for metadata only)
const DIMENSIONS: Record<string, [number, number]> = {
  "1:1":  [2048, 2048],
  "16:9": [3840, 2160],
  "4:5":  [2048, 2560],
  "9:16": [2160, 3840],
};

export async function generateSceneWork(sceneId: string): Promise<void> {
  try {
    await prisma.scene.update({
      where: { id: sceneId },
      data: { status: "GENERATING" },
    });

    const scene = await prisma.scene.findUniqueOrThrow({
      where: { id: sceneId },
      include: { brief: true },
    });

    const brief = scene.brief;

    const culturalContext = brief.culturalContextId
      ? await prisma.culturalContext.findUnique({ where: { id: brief.culturalContextId } })
      : null;

    const referenceImages = culturalContext
      ? await prisma.referenceImage.findMany({
          where: { culturalContextId: culturalContext.id },
        })
      : [];

    // variationIndex based on scene's position in this brief's batch (0-indexed, mod 8)
    const siblingCount = await prisma.scene.count({
      where: { briefId: brief.id, createdAt: { lte: scene.createdAt } },
    });
    const variationIndex = (siblingCount - 1) % 8;

    const expandedPrompt = await expandBrief({
      brief,
      culturalContext,
      referenceImages,
      variationIndex,
    });

    const result = await dispatchScene({
      expandedPrompt,
      aspectRatio: scene.aspectRatio as "1:1" | "16:9" | "4:5" | "9:16",
      culturalContext,
    });

    const ext = result.mimeType.split("/")[1] ?? "jpg";
    const gcsPath = `scenes/${brief.id}/${sceneId}.${ext}`;
    const gcsUrl = await uploadImage(result.imageBuffer, gcsPath, result.mimeType);

    const [width, height] = DIMENSIONS[scene.aspectRatio] ?? [null, null];

    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        status: "READY",
        gcsPath,
        gcsUrl,
        model: result.model,
        seed: result.seed,
        promptExpanded: expandedPrompt.imagePrompt,
        negativePrompt: expandedPrompt.negativePrompt,
        width,
        height,
      },
    });

    console.info(`[generation-worker] scene=${sceneId} READY model=${result.model}`);
  } catch (err) {
    console.error(`[generation-worker] scene=${sceneId} FAILED:`, err);
    await prisma.scene
      .update({
        where: { id: sceneId },
        data: {
          status: "FAILED",
          errorMessage: (err as Error).message.slice(0, 1000),
        },
      })
      .catch(() => {});
    throw err;
  }
}

import type { ExpandedPrompt } from "./brief-expander";
import type { SceneResult } from "./scene-generator";

const IMAGEN_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict";

const TIMEOUT_MS = 180_000;
const MAX_RETRIES = 4;

// Imagen 4 supports a subset of aspect ratios — map our values to nearest supported
const ASPECT_RATIO_MAP: Record<string, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "4:5": "3:4",   // 4:5 not supported — closest is 3:4
  "9:16": "9:16",
};

export async function generateSceneImagen(params: {
  expandedPrompt: ExpandedPrompt;
  aspectRatio: "1:1" | "16:9" | "4:5" | "9:16";
  variationSeed?: number;
}): Promise<SceneResult> {
  const { expandedPrompt, aspectRatio, variationSeed } = params;
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not set");

  const seed = variationSeed ?? Math.floor(Math.random() * 2 ** 31);
  const imagenAspectRatio = ASPECT_RATIO_MAP[aspectRatio] ?? "3:4";

  const prompt = expandedPrompt.negativePrompt
    ? `${expandedPrompt.imagePrompt}\n\nAvoid: ${expandedPrompt.negativePrompt}`
    : expandedPrompt.imagePrompt;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: imagenAspectRatio,
    },
  };

  const data = await fetchImagenWithRetry(IMAGEN_ENDPOINT, apiKey, body);

  const prediction = (data as { predictions?: { bytesBase64Encoded: string; mimeType: string }[] })
    ?.predictions?.[0];

  if (!prediction?.bytesBase64Encoded) {
    throw new Error("Imagen 4 returned no image data");
  }

  return {
    imageBuffer: Buffer.from(prediction.bytesBase64Encoded, "base64"),
    mimeType: prediction.mimeType ?? "image/jpeg",
    seed,
    promptUsed: expandedPrompt.imagePrompt,
  };
}

async function fetchImagenWithRetry(
  url: string,
  apiKey: string,
  body: unknown
): Promise<unknown> {
  let attempt = 0;
  let lastError: Error = new Error("Unknown error");

  while (attempt < MAX_RETRIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429 || response.status === 503) {
        const delay = exponentialBackoff(attempt);
        console.warn(`Imagen ${response.status} on attempt ${attempt + 1}, retrying in ${delay}ms`);
        await sleep(delay);
        attempt++;
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Imagen API error ${response.status}: ${text}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      lastError =
        (err as Error).name === "AbortError"
          ? new Error(`Imagen request timed out after ${TIMEOUT_MS}ms`)
          : (err as Error);
      const delay = exponentialBackoff(attempt);
      console.warn(`Imagen request failed on attempt ${attempt + 1}: ${lastError.message}, retrying in ${delay}ms`);
      attempt++;
      await sleep(delay);
    }
  }

  throw lastError;
}

function exponentialBackoff(attempt: number): number {
  return Math.min(1000 * 2 ** attempt + Math.random() * 500, 30_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

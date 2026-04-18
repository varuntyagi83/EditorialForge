import type { ExpandedPrompt } from "./brief-expander.js";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-image-preview:generateContent";

const TIMEOUT_MS = 180_000;
const MAX_RETRIES = 4;

export type SceneResult = {
  imageBuffer: Buffer;
  mimeType: string;
  seed: number;
  promptUsed: string;
};

export async function generateScene(params: {
  expandedPrompt: ExpandedPrompt;
  aspectRatio: "1:1" | "16:9" | "4:5" | "9:16";
  variationSeed?: number;
}): Promise<SceneResult> {
  const { expandedPrompt, aspectRatio, variationSeed } = params;
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not set");

  const seed = variationSeed ?? Math.floor(Math.random() * 2 ** 31);
  const parts = await buildParts(expandedPrompt);

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      imageSize: "4K",
      responseModalities: ["IMAGE"],
      seed,
      aspectRatio,
    },
  };

  const data = await fetchGeminiWithRetry(GEMINI_ENDPOINT, apiKey, body);

  const imagePart = (
    data as {
      candidates?: {
        content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] };
      }[];
    }
  )?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);

  if (!imagePart?.inlineData) {
    throw new Error("Gemini returned no image data");
  }

  return {
    imageBuffer: Buffer.from(imagePart.inlineData.data, "base64"),
    mimeType: imagePart.inlineData.mimeType,
    seed,
    promptUsed: expandedPrompt.imagePrompt,
  };
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function buildParts(expandedPrompt: ExpandedPrompt): Promise<GeminiPart[]> {
  const parts: GeminiPart[] = [];

  // Reference images before the text prompt, as required by Gemini multimodal API
  for (const url of expandedPrompt.referenceImageUrls.slice(0, 3)) {
    try {
      const { mimeType, data } = await fetchImageAsBase64(url);
      parts.push({ inlineData: { mimeType, data } });
    } catch (err) {
      console.warn(`Skipping reference image ${url}: ${(err as Error).message}`);
    }
  }

  const fullPrompt = expandedPrompt.negativePrompt
    ? `${expandedPrompt.imagePrompt}\n\nAvoid: ${expandedPrompt.negativePrompt}`
    : expandedPrompt.imagePrompt;

  parts.push({ text: fullPrompt });
  return parts;
}

async function fetchImageAsBase64(
  url: string
): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const mimeType = contentType.split(";")[0].trim();
  const buffer = Buffer.from(await response.arrayBuffer());
  return { mimeType, data: buffer.toString("base64") };
}

async function fetchGeminiWithRetry(
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
        console.warn(
          `Gemini ${response.status} on attempt ${attempt + 1}, retrying in ${delay}ms`
        );
        await sleep(delay);
        attempt++;
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${text}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      lastError =
        (err as Error).name === "AbortError"
          ? new Error(`Gemini request timed out after ${TIMEOUT_MS}ms`)
          : (err as Error);
      const delay = exponentialBackoff(attempt);
      console.warn(
        `Gemini request failed on attempt ${attempt + 1}: ${lastError.message}, retrying in ${delay}ms`
      );
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

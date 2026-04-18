import OpenAI from "openai";
import type { Brief, CulturalContext, ReferenceImage } from "@prisma/client";
import { VERSION, PROMPT } from "./prompts/brief-expander.system";
import { FEW_SHOT_EXAMPLES } from "./prompts/brief-expander.examples";
import crypto from "crypto";

export type ExpandedPrompt = {
  imagePrompt: string;
  negativePrompt: string;
  referenceImageUrls: string[];
  systemFingerprint: string;
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function expandBrief(params: {
  brief: Brief;
  culturalContext: CulturalContext | null;
  referenceImages: ReferenceImage[];
  variationIndex: number;
}): Promise<ExpandedPrompt> {
  const { brief, culturalContext, referenceImages, variationIndex } = params;

  const userMessage = buildUserMessage(brief, culturalContext, variationIndex);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: PROMPT },
    ...buildFewShotMessages(),
    { role: "user", content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(content) as {
    imagePrompt?: string;
    negativePrompt?: string;
  };

  const referenceImageUrls = referenceImages.slice(0, 3).map((r) => r.gcsUrl);

  const systemFingerprint = crypto
    .createHash("sha256")
    .update(VERSION + PROMPT)
    .digest("hex")
    .slice(0, 12);

  return {
    imagePrompt: parsed.imagePrompt ?? "",
    negativePrompt: parsed.negativePrompt ?? "",
    referenceImageUrls,
    systemFingerprint,
  };
}

function buildUserMessage(
  brief: Brief,
  culturalContext: CulturalContext | null,
  variationIndex: number
): string {
  return JSON.stringify({
    brief: {
      title: brief.title,
      category: brief.category,
      protagonistArchetype: brief.protagonistArchetype,
      environment: brief.environment,
      productFamily: brief.productFamily,
      productIntegration: brief.productIntegration,
      headline: brief.headline,
      subhead: brief.subhead,
      notes: brief.notes,
    },
    culturalContext: culturalContext
      ? {
          name: culturalContext.name,
          region: culturalContext.region,
          visualAnchors: culturalContext.visualAnchors,
          fabricAndColor: culturalContext.fabricAndColor,
          typicalProtagonists: culturalContext.typicalProtagonists,
          atmosphericSignatures: culturalContext.atmosphericSignatures,
          forbiddenCombinations: culturalContext.forbiddenCombinations,
        }
      : null,
    variationIndex,
    variationBias: getVariationBias(variationIndex),
  });
}

function getVariationBias(index: number): string {
  if (index <= 1)
    return "wide environmental shot, protagonist occupies 1/3 of frame, environment dominant";
  if (index <= 3)
    return "medium shot, protagonist at 2/3 frame height, face and upper body visible";
  if (index <= 5)
    return "close or intimate framing, product or face prominent, shallow depth of field";
  return "unusual angle — low/high/dutch tilt or abstract material detail — subvert the expected framing";
}

function buildFewShotMessages(): OpenAI.Chat.ChatCompletionMessageParam[] {
  return FEW_SHOT_EXAMPLES.flatMap((ex) => [
    {
      role: "user" as const,
      content: JSON.stringify({
        brief: { title: ex.brief },
        culturalContext: ex.culturalContext,
        variationIndex: 0,
        variationBias: "wide environmental shot",
      }),
    },
    {
      role: "assistant" as const,
      content: JSON.stringify(ex.expanded),
    },
  ]);
}

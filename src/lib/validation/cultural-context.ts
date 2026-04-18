import { z } from "zod";

const jsonValue = z.record(z.string(), z.unknown());

export const CreateCulturalContextSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  category: z.enum(["INDIAN_FESTIVAL", "ABSURDIST_WESTERN", "PREMIUM_LIFESTYLE", "OTHER"]),
  visualAnchors: jsonValue,
  fabricAndColor: jsonValue,
  typicalProtagonists: jsonValue,
  atmosphericSignatures: jsonValue,
  forbiddenCombinations: jsonValue,
  referenceImageUrls: z.array(z.string().url()).optional().default([]),
});

export const UpdateCulturalContextSchema = CreateCulturalContextSchema.partial();

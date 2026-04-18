import { z } from "zod";

const Category = z.enum(["INDIAN_FESTIVAL", "ABSURDIST_WESTERN", "PREMIUM_LIFESTYLE", "OTHER"]);
const ProductIntegration = z.enum(["HELD", "PLACED", "CONSUMED", "CENTRAL", "ABSENT"]);

export const CreateBriefSchema = z.object({
  title: z.string().min(1).max(200),
  category: Category,
  culturalContextId: z.string().uuid().nullable().optional(),
  protagonistArchetype: z.string().min(1),
  environment: z.string().min(1),
  productFamily: z.string().nullable().optional(),
  productIntegration: ProductIntegration,
  headline: z.string().min(1),
  subhead: z.string().nullable().optional(),
  cta: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const UpdateBriefSchema = CreateBriefSchema.partial();

export const GenerateScenesSchema = z.object({
  count: z.number().int().min(1).max(8).default(4),
  aspectRatio: z.enum(["1:1", "16:9", "4:5", "9:16"]).default("4:5"),
});

import { z } from "zod";

export const FeedbackSchema = z.object({
  verdict: z.enum(["LOVE", "GOOD", "MEH", "REJECT"]),
  comment: z.string().nullable().optional(),
});

export const ComposeSchema = z.object({
  layoutTemplateId: z.string().uuid(),
  headlineText: z.string().min(1),
  subheadText: z.string().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  logoAssetId: z.string().uuid().nullable().optional(),
});

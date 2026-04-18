import { z } from "zod";

export const CreateReferenceImageSchema = z.object({
  culturalContextId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  sourceUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
});

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GCS_SERVICE_ACCOUNT_KEY_B64: z.string().min(1),
  GCS_BUCKET_NAME: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  FAL_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
});

// Skip validation during build (SKIP_ENV_VALIDATION=1) or when explicitly disabled.
// In production at runtime, all vars must be present or this will throw.
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "1" ||
  process.env.NODE_ENV === "test";

export const env = skipValidation
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);

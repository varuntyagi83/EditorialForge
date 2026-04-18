import { expandBrief } from "../src/lib/ai/brief-expander.js";
import { dispatchScene } from "../src/lib/ai/scene-dispatcher.js";
import { uploadImage } from "../src/lib/storage/gcs.js";
import * as fs from "fs";
import * as path from "path";

const BRIEF = {
  id: "test-1",
  userId: "test",
  status: "DRAFT" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  culturalContextId: null,
  title: "Chai wallah at Howrah station at 5am",
  category: "INDIAN_FESTIVAL" as const,
  protagonistArchetype: "Male chai wallah, 55, weathered, Bihari",
  environment: "Howrah Railway Station platform 7, pre-dawn 5am, winter",
  productFamily: "Clay kulhad chai",
  productIntegration: "CENTRAL" as const,
  headline: "Brewed before the city wakes",
  subhead: null,
  cta: null,
  notes: null,
};

async function run() {
  console.log("Step 1: Expanding brief...");
  const expanded = await expandBrief({
    brief: BRIEF,
    culturalContext: null,
    referenceImages: [],
    variationIndex: 0,
  });
  console.log(`Prompt (${expanded.imagePrompt.length} chars): ${expanded.imagePrompt.slice(0, 200)}...`);

  console.log("\nStep 2: Generating scene...");
  const result = await dispatchScene({
    expandedPrompt: expanded,
    aspectRatio: "4:5",
    variationSeed: 42,
    culturalContext: null,
  });

  console.log(`Model used: ${result.model}`);
  console.log(`Image buffer size: ${result.imageBuffer.length} bytes`);
  console.log(`MIME type: ${result.mimeType}`);

  const ext = result.mimeType.split("/")[1] ?? "jpg";
  const outPath = path.join(process.cwd(), `test-scene-output.${ext}`);
  fs.writeFileSync(outPath, result.imageBuffer);
  console.log(`\nSaved locally to: ${outPath}`);

  if (process.env.GCS_BUCKET_NAME && process.env.GCS_SERVICE_ACCOUNT_KEY_B64) {
    console.log("\nStep 3: Uploading to GCS...");
    const gcsPath = `scenes/test/${Date.now()}.${ext}`;
    const gcsUrl = await uploadImage(result.imageBuffer, gcsPath, result.mimeType);
    console.log(`GCS URL: ${gcsUrl}`);
  } else {
    console.log("\nSkipping GCS upload (GCS env vars not set)");
  }
}

run().catch(console.error);

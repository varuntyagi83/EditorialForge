import { expandBrief } from "../src/lib/ai/brief-expander.js";
import { dispatchScene } from "../src/lib/ai/scene-dispatcher.js";
import { uploadImage } from "../src/lib/storage/gcs.js";
import * as fs from "fs";
import * as path from "path";

type Brief = {
  id: string;
  userId: string;
  status: "DRAFT";
  createdAt: Date;
  updatedAt: Date;
  culturalContextId: null;
  title: string;
  category: string;
  protagonistArchetype: string;
  environment: string;
  productFamily: string;
  productIntegration: "CENTRAL" | "INCIDENTAL" | "BACKGROUND";
  headline: string;
  subhead: string | null;
  cta: string | null;
  notes: string | null;
};

const BRIEFS: Array<{ brief: Brief; aspectRatio: "1:1" | "16:9" | "4:5" | "9:16"; label: string }> = [
  {
    label: "Western — NYC bodega, Liquid Death",
    aspectRatio: "16:9",
    brief: {
      id: "west-1",
      userId: "test",
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      culturalContextId: null,
      title: "Liquid Death in a Brooklyn bodega at 2am",
      category: "URBAN_STREET" as const,
      protagonistArchetype: "Male bodega owner, 60s, Puerto Rican, apron, reading a newspaper behind the counter",
      environment: "Brooklyn corner bodega, 2am, fluorescent overhead lighting, linoleum floor, wall of canned goods, cat asleep on the counter",
      productFamily: "Liquid Death sparkling water tall can",
      productIntegration: "CENTRAL" as const,
      headline: "Murder your thirst",
      subhead: null,
      cta: null,
      notes: "Mundane scene made cinematic. The can should feel like the most metal object in a completely ordinary room.",
    },
  },
  {
    label: "Eastern — Tokyo vending machine, rainy night",
    aspectRatio: "4:5",
    brief: {
      id: "east-1",
      userId: "test",
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      culturalContextId: null,
      title: "Salaryman alone at a Tokyo vending machine at midnight",
      category: "URBAN_STREET" as const,
      protagonistArchetype: "Japanese salaryman, 45, tie loosened, briefcase, rain-soaked suit, standing under an awning",
      environment: "Shinjuku back alley, midnight, heavy rain, neon reflections on wet asphalt, a single glowing vending machine",
      productFamily: "Canned coffee — Boss Coffee",
      productIntegration: "CENTRAL" as const,
      headline: "The boss never sleeps",
      subhead: null,
      cta: null,
      notes: "Melancholic and beautiful. The vending machine is the only warm light source. Long working hours, quiet dignity.",
    },
  },
];

async function runBrief(entry: typeof BRIEFS[number], index: number) {
  const { brief, aspectRatio, label } = entry;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Brief ${index + 1}: ${label}`);
  console.log("=".repeat(60));

  console.log("Step 1: Expanding brief...");
  const expanded = await expandBrief({
    brief: brief as Parameters<typeof expandBrief>[0]["brief"],
    culturalContext: null,
    referenceImages: [],
    variationIndex: 0,
  });
  console.log(`Prompt (${expanded.imagePrompt.length} chars): ${expanded.imagePrompt.slice(0, 180)}...`);

  console.log("\nStep 2: Generating scene...");
  const result = await dispatchScene({
    expandedPrompt: expanded,
    aspectRatio,
    variationSeed: 42 + index,
    culturalContext: null,
  });

  console.log(`Model: ${result.model} | Size: ${result.imageBuffer.length} bytes | MIME: ${result.mimeType}`);

  const ext = result.mimeType.split("/")[1] ?? "jpg";
  const filename = `test-scene-${brief.id}.${ext}`;
  const outPath = path.join(process.cwd(), filename);
  fs.writeFileSync(outPath, result.imageBuffer);
  console.log(`Saved: ${outPath}`);

  if (process.env.GCS_BUCKET_NAME && process.env.GCS_SERVICE_ACCOUNT_KEY_B64) {
    const gcsPath = `scenes/test/${brief.id}-${Date.now()}.${ext}`;
    const gcsUrl = await uploadImage(result.imageBuffer, gcsPath, result.mimeType);
    console.log(`GCS: ${gcsUrl}`);
  }

  return { filename, outPath };
}

async function run() {
  for (let i = 0; i < BRIEFS.length; i++) {
    await runBrief(BRIEFS[i]!, i);
  }
  console.log("\nAll briefs complete.");
}

run().catch(console.error);

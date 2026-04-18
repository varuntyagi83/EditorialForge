import { expandBrief } from "../src/lib/ai/brief-expander.js";

const RETRY_BRIEFS = [
  {
    num: 8,
    title: "Scandi ceramicist morning studio",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Danish woman 40, ceramicist, clay-stained hands",
    environment: "Copenhagen studio with north skylight, 9am overcast March",
    productFamily: "Matcha",
    productIntegration: "PLACED" as const,
    headline: "Made by hand. Held by hand.",
    subhead: null, cta: null, notes: null,
  },
  {
    num: 14,
    title: "Wabi-sabi flower arranger, Kyoto",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Japanese woman 58, ikebana master, deliberate hands",
    environment: "Kyoto machiya workshop, tatami floor, single south window, November 2pm",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "The space between stems",
    subhead: null, cta: null, notes: null,
  },
  {
    num: 16,
    title: "Corporate warrior takes a bhog break at a Kolkata pandal",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Middle-aged Bengali software engineer, male 42, business formals, laptop bag",
    environment: "North Kolkata pandal interior, 7pm Navami evening, bhog being served on banana leaves",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "Even the meeting can wait for Ma Durga",
    subhead: null, cta: null,
    notes: "Protagonist is seated cross-legged on the floor among the devotees in business shirt slightly rumpled, laptop bag placed beside him, Bluetooth earpiece still in, eating bhog with his hand. Not absurdist — treat him with full documentary seriousness as a real Bengali man who does this every Pujo.",
  },
];

async function run() {
  for (const b of RETRY_BRIEFS) {
    const { num, ...fields } = b;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`BRIEF ${num}: ${b.title}`);
    console.log("=".repeat(60));

    const result = await expandBrief({
      brief: {
        id: `test-${num}`,
        userId: "test",
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
        culturalContextId: null,
        ...fields,
      },
      culturalContext: null,
      referenceImages: [],
      variationIndex: 0,
    });

    const len = result.imagePrompt.length;
    const pass = len <= 2500;
    const negCount = result.negativePrompt.split(",").filter(s => s.trim()).length;

    console.log(`Prompt length: ${len} chars ${pass ? "✓ PASS" : "✗ FAIL (>2500)"}`);
    console.log(`Negative items: ${negCount} ${negCount <= 7 ? "✓" : "✗"}`);
    console.log(`\nIMAGE PROMPT:\n${result.imagePrompt}`);
    console.log(`\nNEGATIVE PROMPT:\n${result.negativePrompt}`);
  }
}

run().catch(console.error);

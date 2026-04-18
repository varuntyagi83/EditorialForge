import { expandBrief } from "../src/lib/ai/brief-expander.js";

const briefs = [
  {
    title: "Liquid Death at the Maut Ka Kua",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Rajasthani stunt rider, male 30s",
    environment: "Wall of Death silodrome at a Rajasthan desert mela, 3pm October",
    productFamily: "Liquid Death sparkling water",
    productIntegration: "HELD" as const,
    headline: "Hydrate or die trying",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Suburban dad knight in the cereal aisle",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Middle-aged American dad in plate armor",
    environment: "Big-box grocery store cereal aisle, weekday afternoon",
    productFamily: "Canned sparkling water",
    productIntegration: "HELD" as const,
    headline: "Defend your thirst",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Japanese whisky bar golden hour",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Japanese man 50s, understated elegance",
    environment: "Mid-century Tokyo whisky bar, 6:30pm November",
    productFamily: "Premium Japanese whisky",
    productIntegration: "HELD" as const,
    headline: "Time, distilled",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Durga Puja evening crowd Kolkata",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Bengali woman 30s in Tant saree",
    environment: "North Kolkata lane outside a Durga Puja pandal, 6pm October",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "This moment belongs to everyone",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Kinfolk breakfast, Oslo apartment",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Scandinavian woman 32, hands only visible",
    environment: "Oslo apartment kitchen, overcast October morning, 8am",
    productFamily: "Specialty coffee",
    productIntegration: "CONSUMED" as const,
    headline: "Slow mornings",
    subhead: null, cta: null, notes: null,
  },
];

async function run() {
  for (let i = 0; i < briefs.length; i++) {
    const b = briefs[i];
    const result = await expandBrief({
      brief: {
        id: "x", userId: "x", status: "DRAFT",
        createdAt: new Date(), updatedAt: new Date(),
        culturalContextId: null, ...b,
      },
      culturalContext: null,
      referenceImages: [],
      variationIndex: i % 4,
    });
    console.log("=".repeat(60));
    console.log(`BRIEF ${i + 1}: ${b.title}`);
    console.log(`VARIATION INDEX: ${i % 4}`);
    console.log("-".repeat(60));
    console.log(`IMAGE PROMPT (${result.imagePrompt.length} chars):`);
    console.log(result.imagePrompt);
    console.log("");
    console.log("NEGATIVE PROMPT:");
    console.log(result.negativePrompt);
    console.log("");
  }
}

run().catch(console.error);

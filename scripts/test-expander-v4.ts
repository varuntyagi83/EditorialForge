import { expandBrief } from "../src/lib/ai/brief-expander.js";

// 9 targeted briefs for v1.3.0 verification
// 2,7,10,13 = absurdist (wear-word blacklist)
// 17 = diagnostic that failed last round
// 4,14,18 = ending-rule fix
// 8,15 = "generic X" vagueness check

const briefs = [
  // Brief 2 — ABSURDIST: suburban dad knight
  {
    id: 2,
    title: "Suburban dad knight in the cereal aisle",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Middle-aged American dad in plate armor",
    environment: "Big-box grocery store cereal aisle, weekday afternoon",
    productFamily: "Canned sparkling water",
    productIntegration: "HELD" as const,
    headline: "Defend your thirst",
    subhead: null, cta: null, notes: null,
  },
  // Brief 7 — ABSURDIST: office samurai
  {
    id: 7,
    title: "Office worker samurai defending the printer",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Female office worker 38, business casual over samurai armor",
    environment: "Open-plan corporate office, printer room, 2pm Tuesday",
    productFamily: "Energy drink",
    productIntegration: "HELD" as const,
    headline: "Paper jam. Not today.",
    subhead: null, cta: null, notes: null,
  },
  // Brief 10 — ABSURDIST: wizard at DMV
  {
    id: 10,
    title: "Retired accountant wizard at the DMV",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Male 67, full Gandalf wizard robes, bifocals, number ticket in hand",
    environment: "American DMV waiting room, fluorescent 3pm purgatory, plastic chairs",
    productFamily: "Sparkling water",
    productIntegration: "HELD" as const,
    headline: "Some waits are worth it",
    subhead: null, cta: null, notes: null,
  },
  // Brief 13 — ABSURDIST: astronaut at BBQ
  {
    id: 13,
    title: "Astronaut at a suburban backyard barbecue",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "NASA astronaut, full suit, helmet off, holding tongs",
    environment: "Suburban backyard, Fourth of July BBQ, 4pm, inflatable pool in background",
    productFamily: "Craft beer",
    productIntegration: "HELD" as const,
    headline: "Re-entry complete",
    subhead: null, cta: null, notes: null,
  },
  // Brief 17 — ABSURDIST: Scandi blacksmith in Kinfolk kitchen (diagnostic failure)
  {
    id: 17,
    title: "Minimalist Scandi morning, with a medieval blacksmith",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Female, 34, Scandinavian, traditional blacksmith leather apron over linen workshop clothes, forearms visibly muscular and soot-marked",
    environment: "Copenhagen apartment kitchen, 7am overcast morning, Carrara marble counter, Chemex coffee maker mid-brew. A small anvil sits on the counter next to the Chemex. A partially-forged iron leaf is clamped in tongs next to the coffee grinder.",
    productFamily: "Specialty coffee",
    productIntegration: "PLACED" as const,
    headline: "Your morning ritual. Sharpened.",
    subhead: null, cta: null,
    notes: "ABSURDIST_WESTERN rules fully apply. Shoot with the same flat overcast light and 50mm documentary register as the Kinfolk references. The anvil and the Chemex get equal treatment. She pours the coffee with the same focused calm as any Kinfolk subject. The soot on her forearms does not get a backstory.",
  },
  // Brief 4 — INDIAN_FESTIVAL: Durga Puja (ending-rule check)
  {
    id: 4,
    title: "Durga Puja evening crowd Kolkata",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Bengali woman 30s in Tant saree",
    environment: "North Kolkata lane outside a Durga Puja pandal, 6pm October",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "This moment belongs to everyone",
    subhead: null, cta: null, notes: null,
  },
  // Brief 14 — PREMIUM_LIFESTYLE: wabi-sabi Kyoto (ending-rule check)
  {
    id: 14,
    title: "Wabi-sabi flower arranger, Kyoto",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Japanese woman 58, ikebana master, deliberate hands",
    environment: "Kyoto machiya workshop, tatami floor, single south window, November 2pm",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "The space between stems",
    subhead: null, cta: null, notes: null,
  },
  // Brief 18 — PREMIUM_LIFESTYLE: South Indian filter coffee (ending-rule check)
  {
    id: 18,
    title: "South Indian filter coffee, brass and sunlight",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Tamil woman, early 60s, wearing a cotton Madisar saree in faded cream, thin gold jhimki earrings, hair in a single plait",
    environment: "Chettinad house interior, 7am morning. Red oxide floor polished to a soft sheen, carved Burma teak pillars, small enclosed courtyard visible through a doorway. On a wooden table: a brass tumbler-dabarah set, coffee being poured from the dabarah into the tumbler in a long stream, steam rising.",
    productFamily: "Filter coffee in brass tumbler-dabarah",
    productIntegration: "CENTRAL" as const,
    headline: "The oldest ritual in the newest light",
    subhead: null, cta: null,
    notes: "Shoot in the aesthetic of Aesop / Le Labo product photography — reverent, still, precisely lit, long depth of field on the brass, deep shadow fall-off. The cultural anchor is the Chettinad architecture and the tumbler-dabarah ritual. Treat it with the same restraint as the Italian nonna Moka pot brief.",
  },
  // Brief 8 — PREMIUM_LIFESTYLE: Scandi ceramicist ("generic" vagueness check)
  {
    id: 8,
    title: "Scandi ceramicist morning studio",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Danish woman 40, ceramicist, clay-stained hands",
    environment: "Copenhagen studio with north skylight, 9am overcast March",
    productFamily: "Matcha",
    productIntegration: "PLACED" as const,
    headline: "Made by hand. Held by hand.",
    subhead: null, cta: null, notes: null,
  },
  // Brief 15 — OTHER: Mumbai beekeeper ("generic" vagueness check)
  {
    id: 15,
    title: "Beekeeper in a Mumbai rooftop colony",
    category: "OTHER" as const,
    protagonistArchetype: "Female urban beekeeper 34, Mumbai, half-veiled suit, calm",
    environment: "Mumbai highrise rooftop, 6am, hives against city skyline haze, monsoon edge",
    productFamily: "Raw honey",
    productIntegration: "PLACED" as const,
    headline: "The city is a garden",
    subhead: null, cta: null, notes: null,
  },
];

async function run() {
  for (const b of briefs) {
    const { id: briefNum, ...briefFields } = b;
    const result = await expandBrief({
      brief: {
        id: "x", userId: "x", status: "DRAFT",
        createdAt: new Date(), updatedAt: new Date(),
        culturalContextId: null, ...briefFields,
      },
      culturalContext: null,
      referenceImages: [],
      variationIndex: 0,
    });
    console.log("=".repeat(60));
    console.log(`BRIEF ${briefNum}: ${b.title}`);
    console.log(`CATEGORY: ${b.category}`);
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

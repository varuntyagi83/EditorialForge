import { expandBrief } from "../src/lib/ai/brief-expander.js";

const briefs = [
  // Original 15
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
  {
    title: "Chai wallah at Howrah station at 5am",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Male chai wallah, 55, weathered, Bihari",
    environment: "Howrah Railway Station platform 7, pre-dawn 5am, winter",
    productFamily: "Clay kulhad chai",
    productIntegration: "CENTRAL" as const,
    headline: "Brewed before the city wakes",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Office worker samurai defending the printer",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Female office worker 38, business casual over samurai armor",
    environment: "Open-plan corporate office, printer room, 2pm Tuesday",
    productFamily: "Energy drink",
    productIntegration: "HELD" as const,
    headline: "Paper jam. Not today.",
    subhead: null, cta: null, notes: null,
  },
  {
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
    title: "Holi powder explosion in an Ahmedabad lane",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Teenage boy 16, Gujarati, mid-throw",
    environment: "Narrow Ahmedabad pol lane, noon Holi, harsh March sun",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "Color is a verb",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Retired accountant wizard at the DMV",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Male 67, full Gandalf wizard robes, bifocals, number ticket in hand",
    environment: "American DMV waiting room, fluorescent 3pm purgatory, plastic chairs",
    productFamily: "Sparkling water",
    productIntegration: "HELD" as const,
    headline: "Some waits are worth it",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Italian nonna espresso ritual, Naples",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Italian woman 72, Neapolitan nonna, hands only",
    environment: "Naples apartment kitchen, 7:30am, Moka pot on gas flame, October",
    productFamily: "Espresso",
    productIntegration: "CONSUMED" as const,
    headline: "No shortcuts. Never.",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Kalbelia dancer backstage Pushkar mela",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Kalbelia female dancer 24, Rajasthani, backstage pre-performance",
    environment: "Makeshift backstage tent at Pushkar Camel Fair, golden 5pm light through cloth gaps",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "The stillness before",
    subhead: null, cta: null, notes: null,
  },
  {
    title: "Astronaut at a suburban backyard barbecue",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "NASA astronaut, full suit, helmet off, holding tongs",
    environment: "Suburban backyard, Fourth of July BBQ, 4pm, inflatable pool in background",
    productFamily: "Craft beer",
    productIntegration: "HELD" as const,
    headline: "Re-entry complete",
    subhead: null, cta: null, notes: null,
  },
  {
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
    title: "Beekeeper in a Mumbai rooftop colony",
    category: "OTHER" as const,
    protagonistArchetype: "Female urban beekeeper 34, Mumbai, half-veiled suit, calm",
    environment: "Mumbai highrise rooftop, 6am, hives against city skyline haze, monsoon edge",
    productFamily: "Raw honey",
    productIntegration: "PLACED" as const,
    headline: "The city is a garden",
    subhead: null, cta: null, notes: null,
  },

  // 3 Opus-specified cross-category briefs
  {
    title: "Corporate warrior takes a bhog break at a Kolkata pandal",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Middle-aged Bengali software engineer, male 42, business formals, laptop bag",
    environment: "North Kolkata pandal interior, 7pm Navami evening, bhog being served on banana leaves to seated row of devotees on the floor",
    productFamily: null,
    productIntegration: "ABSENT" as const,
    headline: "Even the meeting can wait for Ma Durga",
    subhead: null, cta: null,
    notes: "Protagonist is seated cross-legged on the floor among the devotees in business shirt slightly rumpled, laptop bag placed beside him, Bluetooth earpiece still in, eating bhog with his hand. Not absurdist — treat him with full documentary seriousness as a real Bengali man who does this every Pujo. Cultural anchor is the bhog setup: banana leaves, aluminum cups of payesh, the pandal structure above.",
  },
  {
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
  {
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
];

async function run() {
  for (let i = 0; i < briefs.length; i++) {
    const b = briefs[i];
    const variationIndex = i % 8;
    const result = await expandBrief({
      brief: {
        id: "x", userId: "x", status: "DRAFT",
        createdAt: new Date(), updatedAt: new Date(),
        culturalContextId: null, ...b,
      },
      culturalContext: null,
      referenceImages: [],
      variationIndex,
    });
    console.log("=".repeat(60));
    console.log(`BRIEF ${i + 1}: ${b.title}`);
    console.log(`CATEGORY: ${b.category} | VARIATION: ${variationIndex}`);
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

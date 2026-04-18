import { expandBrief } from "../src/lib/ai/brief-expander.js";

const briefs = [
  // --- Original 15 ---
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

  // --- 3 Cross-category briefs ---
  {
    title: "Chai at dawn, shot like a Kinfolk editorial",
    category: "INDIAN_FESTIVAL" as const,
    protagonistArchetype: "Bengali woman 35, hands only, minimal jewelry",
    environment: "Kolkata rooftop terrace, 6am winter, still air, diffuse pre-dawn light",
    productFamily: "Masala chai in handthrown ceramic",
    productIntegration: "HELD" as const,
    headline: "Before the city starts",
    subhead: null, cta: null,
    notes: "Shoot with the restraint of a Scandinavian lifestyle editorial — minimal objects, north light equivalent, no crowd, no festival energy. The cultural anchor is the chai and the terrace geometry, not the festival.",
  },
  {
    title: "Viking warrior at a Whole Foods hot bar",
    category: "ABSURDIST_WESTERN" as const,
    protagonistArchetype: "Male Norse warrior 40s, full horn-helmet, fur cloak, tongs in hand",
    environment: "Whole Foods hot bar station, 12:30pm weekday, glass sneeze guard, steam trays",
    productFamily: "Kombucha",
    productIntegration: "HELD" as const,
    headline: "Conquer your lunch",
    subhead: null, cta: null,
    notes: "Shoot this exactly like a Kinfolk interior — tight 85mm, f/1.8, natural light from the hot bar steam, flat documentary register. The warrior is unremarkable. The kombucha bottle is unremarkable. The sneeze guard is unremarkable. One impossible element, zero acknowledgment.",
  },
  {
    title: "Mezcal at a Oaxacan festival altar",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Zapotec woman 55, hands only, hands placing a glass on the altar",
    environment: "Día de los Muertos altar in a Oaxaca courtyard, 8pm, candlelit, October 31",
    productFamily: "Artisanal mezcal, hand-blown copita glass",
    productIntegration: "PLACED" as const,
    headline: "For those who came before",
    subhead: null, cta: null,
    notes: "The category is PREMIUM_LIFESTYLE but the cultural anchor is Día de los Muertos — ofrenda construction, cempasúchil petals, copal smoke. Shoot with the same restraint as the Italian nonna brief: hands only, tight frame, the ritual is the subject, the mezcal is incidental.",
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

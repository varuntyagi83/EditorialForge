import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // LayoutTemplates
  await prisma.layoutTemplate.createMany({
    data: [
      {
        name: "Square — Headline Bottom",
        aspectRatio: "1:1",
        headlineZone: { x: 5, y: 72, width: 90, height: 18, align: "left" },
        subheadZone: { x: 5, y: 84, width: 70, height: 8, align: "left" },
        ctaZone: { x: 5, y: 91, width: 40, height: 6, align: "left" },
        logoZone: { x: 76, y: 88, width: 20, height: 10, align: "right" },
        typography: {
          headline: { fontFamily: "GT America", size: 52, weight: 700, color: "#FFFFFF", letterSpacing: -0.02 },
          subhead: { fontFamily: "GT America", size: 22, weight: 400, color: "#E5E5E5", letterSpacing: 0 },
          cta: { fontFamily: "GT America", size: 16, weight: 600, color: "#FFFFFF", letterSpacing: 0.04 },
        },
      },
      {
        name: "Widescreen — Headline Left",
        aspectRatio: "16:9",
        headlineZone: { x: 4, y: 60, width: 46, height: 22, align: "left" },
        subheadZone: { x: 4, y: 78, width: 42, height: 10, align: "left" },
        ctaZone: { x: 4, y: 88, width: 28, height: 7, align: "left" },
        logoZone: { x: 88, y: 4, width: 9, height: 8, align: "right" },
        typography: {
          headline: { fontFamily: "GT America", size: 64, weight: 700, color: "#FFFFFF", letterSpacing: -0.03 },
          subhead: { fontFamily: "GT America", size: 26, weight: 300, color: "#D4D4D4", letterSpacing: 0 },
          cta: { fontFamily: "GT America", size: 18, weight: 600, color: "#FFFFFF", letterSpacing: 0.05 },
        },
      },
      {
        name: "Portrait — Headline Top",
        aspectRatio: "4:5",
        headlineZone: { x: 5, y: 6, width: 88, height: 20, align: "left" },
        subheadZone: { x: 5, y: 24, width: 75, height: 10, align: "left" },
        ctaZone: { x: 5, y: 88, width: 44, height: 7, align: "left" },
        logoZone: { x: 78, y: 88, width: 18, height: 9, align: "right" },
        typography: {
          headline: { fontFamily: "GT America", size: 56, weight: 700, color: "#FFFFFF", letterSpacing: -0.025 },
          subhead: { fontFamily: "GT America", size: 24, weight: 400, color: "#E0E0E0", letterSpacing: 0 },
          cta: { fontFamily: "GT America", size: 17, weight: 600, color: "#FFFFFF", letterSpacing: 0.04 },
        },
      },
    ],
    skipDuplicates: true,
  });

  // CulturalContexts
  await prisma.culturalContext.create({
    data: {
      name: "Pujo Bengal",
      region: "south-asia",
      category: "INDIAN_FESTIVAL",
      visualAnchors: {
        pandal: "Bamboo-and-cloth temporary structure, hand-painted terracotta motifs on fascia, red-and-gold cloth canopy draped at 15-degree angle from bamboo poles, pendant marigold strings every 60cm, clay lamps (diyas) in rows of seven along the base platform edge",
        idol: "Durga idol on a clay base, ten-armed, deep ochre complexion, lion mount to her left, Mahishasura pinned under right foot, eyes elongated and slightly upward-cast, hair sculpted with shola pith flowers, full-length Banarasi silk saree on idol in crimson",
        dhaak: "Dhakis in white kurta-pyjama with red gamcha, dhak drum strapped diagonally from left shoulder to right hip, mallets of wrapped cloth, crowd parting in a loose semicircle around them",
        marigold: "Garlands of tagetes erecta (orange-yellow), strung in 40cm loops, hung at 2m height intervals from bamboo crossbeams, loose petals scattered on the ground below, wet with evening dew",
        street: "North Kolkata lane geometry: 4m wide, flanked by colonial-era plaster buildings with green shutters and wrought-iron Juliet balconies, electricity wires crossing overhead at irregular angles, narrow strip of sky above, crowds moving in single-file",
      },
      fabricAndColor: {
        womensSaree: "White cotton or Tant saree with a red border (lal-paar), border width 8-12cm, small geometric motifs in the border, draped in the Bengali style (no pleats tucked, pallav falling over left shoulder)",
        mensKurta: "White kurta-pyjama, kurta with a stand collar and minimal zari work on the placket, dhoti occasionally substituted for pyjama, kolhapuri sandals",
        jewelry: "Gold temple jewelry — dokra-style choker with embossed deity motifs, jhumka earrings with hanging chains, shakha-pola (white conch-shell and red coral bangles worn together), no silver",
        palette: ["#C8102E (red border)", "#F5F0E8 (off-white cloth)", "#D4A017 (gold zari)", "#8B5E3C (terracotta)"],
      },
      typicalProtagonists: {
        ageRanges: "25-40 (primary), 60-75 (secondary — elders observing), 8-12 (children weaving through crowd)",
        bodyLanguage: "Hands folded or raised in anjali (prayer position), slight forward lean toward the idol, weight on back foot, gaze directed at idol face not camera",
        gaze: "Eyes directed upward and inward — devotional, not confrontational",
        groupComposition: "Three women standing close, sarees touching at the shoulder, no personal space maintained — collective not individual posture",
        ethnicity: "Bengali South Asian, medium-to-deep brown complexion, black hair with sindoor parting for married women",
      },
      atmosphericSignatures: {
        light: "6pm October light, sun at 12-degree elevation, golden-orange cast, long shadows from pandal poles across the crowd, backlit figures with rim light on hair",
        incense: "Visible dhoop smoke rising in slow vertical columns, catching the evening light at the edges — not obscuring faces but present in midground",
        dhaakRhythm: "Crowd sways slightly in unison with the dhak beat — bodies tilted 5-8 degrees left on the downbeat, visible motion blur on foreground crowd elements",
        petals: "Marigold petals in mid-air, motion-frozen at 1/500s, concentrated 1.5m above ground level, density highest near the dhakis",
        soundTexture: "Conch shells (shankh) blown in 3-second intervals — implied by the posture of elders turning toward the sound",
      },
      forbiddenCombinations: [
        "No Diwali diyas arranged in rangoli patterns — Pujo diyas are in rows, not rangoli",
        "No Holi colors or powder anywhere in frame",
        "No Western Christmas elements (no string lights in white/blue, no pine trees)",
        "No South Indian temple gopuram architecture in background",
        "No banana leaves used as plates in foreground — that is a Tamil festival visual",
        "No lotus flowers floating in water — that is a Diwali/Lakshmi Puja visual",
        "No mix of Durga with Ganesh idol in same pandal",
      ],
      referenceImageUrls: [],
    },
  });

  await prisma.culturalContext.create({
    data: {
      name: "Suburban Americana",
      region: "north-america",
      category: "ABSURDIST_WESTERN",
      visualAnchors: {
        groceryStore: "Big-box grocery aisle, 4m high shelving units in brushed steel, fluorescent 4000K tube lighting overhead creating flat even illumination with no shadows, linoleum floor with slight gloss, aisle width exactly 2.4m",
        shelving: "Cereal boxes stacked 8-high, brands invented but visually plausible — 'Grainmaster', 'Wheat Champions', 'Oat Dynasty' — with mascots in the style of 1987 American breakfast cereal packaging",
        suburbanKnight: "Male, 42-48 years old, wearing full plate armor (brushed steel, slightly dented at left pauldron) over a pair of khaki cargo shorts (visible at the knees), white New Balance 993 sneakers, visor open revealing a dad face: reading glasses, slight five-o-clock shadow, expression of mild bewilderment",
        cart: "Standard grocery cart, left hand gripping the handle, cart contains: one gallon milk jug, a rotisserie chicken in plastic container, a 12-pack of soda, and a rolled-up copy of a circular",
        background: "Other shoppers in the aisle behind — a woman in yoga pants looking at her phone while walking, a stock clerk in a green apron crouching to reface products — all behaving as if the knight is completely unremarkable",
      },
      fabricAndColor: {
        armor: "Plate armor in brushed steel, slightly oxidized at the joints, no heraldic markings, generic retail-fantasy aesthetic rather than historically specific",
        casualLayer: "Khaki cargo shorts (tan #C8A96E), white moisture-wicking polo shirt visible at the neck under the gorget, white tube socks pulled up to mid-calf",
        sneakers: "New Balance 993 in white/grey — visible because the leg armor stops at the knee",
        palette: ["#F2F2F2 (fluorescent aisle)", "#C8A96E (khaki shorts)", "#D4D4D4 (brushed steel armor)", "#E8272A (cereal box accent)"],
      },
      typicalProtagonists: {
        ageRanges: "38-50 (primary absurdist figure), supporting cast 25-65 (everyday shoppers)",
        bodyLanguage: "Protagonist: slightly hunched forward, squinting at shelf label, one gauntleted hand raised to push reading glasses up nose — simultaneously heroic stance (feet planted wide) and domestic task focus",
        gaze: "Looking at product label on shelf, not at camera — the joke works because he is completely unaware of his own absurdity",
        expression: "Focused, slightly confused by the nutrition label, absolutely earnest",
        ethnicity: "Non-specific, read as generic suburban American — the absurdity is class/context, not ethnicity",
      },
      atmosphericSignatures: {
        light: "Hard fluorescent at 4000K, zero shadows, shadowless midday-in-a-box feeling — all surfaces equally lit, which makes the scene more uncanny",
        ambientSound: "Implied: Muzak, the hum of refrigerator cases, the squeak of cart wheels on linoleum",
        documentaryFeel: "Shot feels like a candid documentary — 28mm wide lens, slight barrel distortion at edges, eye-level not hero angle — observer not participant",
        colorGrade: "Desaturated slightly — colors present but not punchy, the fluorescent palette pulling everything toward grey-white",
        absurdistRule: "The scene must contain exactly one impossible element (the armor) surrounded by complete photographic realism in everything else",
      },
      forbiddenCombinations: [
        "No fantasy or sci-fi background — must be a real recognizable American retail environment",
        "No other absurdist characters in the same frame (one impossible element only)",
        "No swords, lances, or shields visible — the knight is off-duty, shopping",
        "No children in the frame — this reads adult-deadpan, not family-comedy",
        "No reaction from other characters — the other shoppers must be completely indifferent",
        "No color grading that pushes into warm or golden — the fluorescent flatness is the point",
      ],
      referenceImageUrls: [],
    },
  });

  await prisma.culturalContext.create({
    data: {
      name: "Kinfolk Nordic",
      region: "europe",
      category: "PREMIUM_LIFESTYLE",
      visualAnchors: {
        interior: "Scandinavian domestic interior, circa 1960s-influenced modernism: teak credenza with splayed legs, Poul Henningsen PH5 pendant lamp over a dining table (brass with white shades), white plastered walls with visible texture, single window with linen curtains in natural undyed linen letting in north light",
        tabletop: "Iittala Taika or Nuutajärvi-style glassware, ceramic plates in matte white with irregular hand-thrown edges, linen table runner with fringe, a single stem of garden hellebore in a ceramic bud vase, no more than three objects on the table at once",
        woodDetails: "Oiled teak grain visible at close range — visible ray figure and interlocked grain pattern, color #7B4F2E, no lacquer sheen",
        textiles: "Linen and wool only — nubby linen napkins in undyed or ochre, chunky ribbed wool throw draped over the back of a chair, sheepskin cushion on a bentwood chair seat",
        kitchen: "If in frame: matte white subway tile, open shelving with ceramic mugs in grey and cream, copper Mauviel pan hanging from a rail, visible patina, no stainless steel appliances",
      },
      fabricAndColor: {
        womenswear: "Linen midi dress in undyed or warm chalk white, relaxed fit, no visible branding, sleeves rolled to elbow, hair in a loose low knot, no makeup beyond brow grooming",
        menswear: "Heavy linen shirt in slate blue or ecru, top button open, dark slim chinos, minimal leather oxford shoes in chestnut",
        palette: ["#F5F0E8 (undyed linen)", "#7B4F2E (oiled teak)", "#D4C5A9 (warm chalk)", "#A0896B (aged brass)", "#4A4A4A (deep charcoal)"],
        materials: "Linen, teak, ceramic, wool, unbleached cotton — no synthetics, no chrome, no high-gloss surfaces",
      },
      typicalProtagonists: {
        ageRanges: "28-42 (primary), occasionally 60+ (artisan or maker figure)",
        bodyLanguage: "Hands occupied — holding cup with both hands, arranging objects on table, pouring from a carafe — presence through action not pose",
        gaze: "Downward or middle-distance — introspective, not engaging camera, the stillness of someone comfortable in their own space",
        groupComposition: "Maximum two people in frame, separated by the table — the space between them is as important as their presence",
        ethnicity: "Scandinavian or Northern European appearance — pale complexion, light to medium hair — though not exclusively; the visual language is about restraint not ethnicity",
      },
      atmosphericSignatures: {
        light: "North light through linen curtains, 10am on an overcast October day in Oslo — diffuse, directionless, no hard shadows, colour temperature 5500K with a slight grey cast",
        condensation: "On glassware: visible condensation droplets on a cold water glass, catching the diffuse light as small bright specular highlights",
        quietness: "The composition implies sound: a teaspoon on ceramic, slow pour of liquid, no music — silence as luxury",
        filmStock: "Kodak Portra 400 aesthetic — fine grain, muted highlights, skin tones warm against cool ambient light, shadows lifted to grey not black",
        stillness: "One object slightly out of place — a book left open face-down, a used napkin folded imperfectly — implying recent human presence without showing the person",
      },
      forbiddenCombinations: [
        "No maximalist or ornate decoration — no floral patterns, no gallery walls, no chinoiserie",
        "No warm-toned artificial light (no Edison bulbs, no candles in shot)",
        "No visible brand logos on any product in frame",
        "No busy backgrounds — maximum three distinct objects in any background zone",
        "No bright saturated colors — palette stays within 3 stops of undyed linen",
        "No smiling faces toward camera — the affect is contemplative not joyful",
        "No outdoor scenes — this context is entirely interior",
      ],
      referenceImageUrls: [],
    },
  });

  console.log("Seed complete: 3 layout templates, 3 cultural contexts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

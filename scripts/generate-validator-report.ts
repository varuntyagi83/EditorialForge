/**
 * Runs the 18 test briefs through expandBrief (with integrated validation),
 * then re-runs validateAndCorrect on each output to surface violations and warnings
 * for the report. Auto-corrections applied inside expandBrief are transparent here;
 * the report shows the post-correction state.
 */
import { _expandRaw } from "../src/lib/ai/brief-expander.js";
import {
  validateAndCorrect,
  type ValidationResult,
} from "../src/lib/ai/brief-expander-validator.js";
import { VERSION } from "../src/lib/ai/prompts/brief-expander.system.js";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const BRIEFS = [
  {
    num: 1,
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
    num: 2,
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
    num: 3,
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
    num: 4,
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
    num: 5,
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
    num: 6,
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
    num: 7,
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
    num: 9,
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
    num: 10,
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
    num: 11,
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
    num: 12,
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
    num: 13,
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
    num: 15,
    title: "Beekeeper in a Mumbai rooftop colony",
    category: "OTHER" as const,
    protagonistArchetype: "Female urban beekeeper 34, Mumbai, half-veiled suit, calm",
    environment: "Mumbai highrise rooftop, 6am, hives against city skyline haze, monsoon edge",
    productFamily: "Raw honey",
    productIntegration: "PLACED" as const,
    headline: "The city is a garden",
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
  {
    num: 17,
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
    num: 18,
    title: "South Indian filter coffee, brass and sunlight",
    category: "PREMIUM_LIFESTYLE" as const,
    protagonistArchetype: "Tamil woman, early 60s, wearing a cotton Madisar saree in faded cream, thin gold jhimki earrings, hair in a single plait",
    environment: "Chettinad house interior, 7am morning. Red oxide floor polished to a soft sheen, carved Burma teak pillars, small enclosed courtyard visible through a doorway. On a wooden table: a brass tumbler-dabarah set, coffee being poured from the dabarah into the tumbler in a long stream, steam rising.",
    productFamily: "Filter coffee in brass tumbler-dabarah",
    productIntegration: "CENTRAL" as const,
    headline: "The oldest ritual in the newest light",
    subhead: null, cta: null,
    notes: "Shoot in the aesthetic of Aesop / Le Labo product photography — reverent, still, precisely lit, long depth of field on the brass, deep shadow fall-off. Treat it with the same restraint as the Italian nonna Moka pot brief.",
  },
];

type ReportEntry = {
  num: number;
  title: string;
  category: string;
  validation: ValidationResult;
  retryTriggered: boolean;
  finalPromptLength: number;
};

async function main() {
  const fingerprint = crypto
    .createHash("sha256")
    .update(VERSION + "PROMPT")
    .digest("hex")
    .slice(0, 12);

  console.log(`Starting validator report for ${BRIEFS.length} briefs (system v${VERSION})...`);

  const entries: ReportEntry[] = [];

  for (const b of BRIEFS) {
    const { num, ...briefFields } = b;
    const brief = {
      id: `test-${num}`,
      userId: "test",
      status: "DRAFT" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      culturalContextId: null,
      ...briefFields,
    };

    console.log(`  [${num}/18] ${b.title}...`);

    const raw = await _expandRaw({ brief, culturalContext: null, variationIndex: 0 });

    const rawPrompt = {
      imagePrompt: raw.imagePrompt,
      negativePrompt: raw.negativePrompt,
      referenceImageUrls: [],
      systemFingerprint: fingerprint,
    };

    const validation = validateAndCorrect(rawPrompt, brief);

    // Retry signal from raw output (before any correction)
    const retryTriggered = validation.retryRecommended;

    entries.push({
      num,
      title: b.title,
      category: b.category,
      validation,
      retryTriggered,
      finalPromptLength: validation.corrected.imagePrompt.length,
    });
  }

  // Build report
  const withViolations = entries.filter((e) => e.validation.violations.length > 0);
  const retriesTriggered = entries.filter((e) => e.retryTriggered);

  const ruleCounts = {
    rule1: 0,
    rule2: 0,
    rule3: 0,
    rule4: 0,
    rule5: 0,
  };

  const lines: string[] = [
    `# Validator Report — v${VERSION}`,
    ``,
    `Date: ${new Date().toISOString()}`,
    `Briefs processed: ${BRIEFS.length}`,
    `Briefs with violations: ${withViolations.length}`,
    `Retries triggered: ${retriesTriggered.length}`,
    ``,
    `## Per-brief findings`,
    ``,
  ];

  for (const entry of entries) {
    const corrections = entry.validation.violations.filter(
      (v) => v.severity === "auto-corrected"
    );
    const warnings = entry.validation.violations.filter(
      (v) => v.severity === "warning"
    );

    // Tally rule counters
    for (const v of entry.validation.violations) {
      if (v.rule.startsWith("Rule 1")) ruleCounts.rule1++;
      else if (v.rule.startsWith("Rule 2")) ruleCounts.rule2++;
      else if (v.rule.startsWith("Rule 3")) ruleCounts.rule3++;
      else if (v.rule.startsWith("Rule 4")) ruleCounts.rule4++;
      else if (v.rule.startsWith("Rule 5")) ruleCounts.rule5++;
    }

    lines.push(`### Brief ${entry.num}: ${entry.title}`);
    lines.push(`- Category: ${entry.category}`);
    lines.push(`- Violations: ${entry.validation.violations.length}`);

    if (corrections.length > 0) {
      lines.push(`- Corrections applied:`);
      for (const c of corrections) {
        const frag = c.originalFragment ? ` ("${c.originalFragment.slice(0, 80)}${c.originalFragment.length > 80 ? "..." : ""}")` : "";
        lines.push(`  - ${c.rule}: ${c.detail}${frag}`);
      }
    } else {
      lines.push(`- Corrections applied: none`);
    }

    if (warnings.length > 0) {
      lines.push(`- Warnings:`);
      for (const w of warnings) {
        lines.push(`  - ${w.rule}: ${w.detail}`);
      }
    } else {
      lines.push(`- Warnings: none`);
    }

    lines.push(`- Retry triggered: ${entry.retryTriggered ? "yes" : "no"}`);
    lines.push(`- Final prompt length: ${entry.finalPromptLength} chars`);
    lines.push(``);
  }

  lines.push(`## Summary by rule`);
  lines.push(``);
  lines.push(`- Rule 1 (feeling-sentences stripped): ${ruleCounts.rule1} briefs affected`);
  lines.push(`- Rule 2 ("generic X" stripped): ${ruleCounts.rule2} briefs affected`);
  lines.push(`- Rule 3 (negative count capped): ${ruleCounts.rule3} briefs affected`);
  lines.push(`- Rule 4 (narrative negative warnings): ${ruleCounts.rule4} briefs flagged`);
  lines.push(`- Rule 5 (wear-word warnings): ${ruleCounts.rule5} briefs flagged`);
  lines.push(`- Retries triggered: ${retriesTriggered.length} briefs`);

  const outPath = path.join(
    process.cwd(),
    "test-briefs",
    "validator-report.md"
  );
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`\nReport written to: ${outPath}`);
}

main().catch(console.error);

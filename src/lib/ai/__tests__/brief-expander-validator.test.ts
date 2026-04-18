import { describe, it, expect } from "vitest";
import { validateAndCorrect } from "../brief-expander-validator.js";
import type { ExpandedPrompt } from "../brief-expander.js";
import type { Brief } from "@prisma/client";

// ~855 chars — within 800-2500 range so length doesn't trigger retryRecommended
const BASE_PROMPT =
  "Copenhagen ceramic studio, 9am, March, overcast light. " +
  "North-facing skylight two meters wide diffusing 5500K soft even light, shadow edges with five-centimeter penumbra. " +
  "Whitewashed brick walls with lime mortar, three meters tall, surface chips revealing red brick at corners. " +
  "Concrete floor with matte sealant in neutral grey, visible wear paths from foot traffic and clay spills. " +
  "Danish woman, 40, light complexion with cool undertones, dark blonde hair tied back, few loose strands framing face. " +
  "Natural linen apron in oatmeal color, visible weave texture, clay smudges on front panel. " +
  "Navy blue cotton shirt beneath, sleeves rolled, fabric with soft broken-in drape. " +
  "Hands clay-stained, short practical nails, fingers coated in thin grey stoneware layer. " +
  "50mm lens, f/4, 1.5 meters distance, eye-level. Faint clay dust suspended in the skylight beam.";

const BASE_NEG =
  "no rendered text, no watermarks, no logo overlays, no AI artifacts";

function makePrompt(
  imagePrompt: string,
  negativePrompt: string = BASE_NEG
): ExpandedPrompt {
  return {
    imagePrompt,
    negativePrompt,
    referenceImageUrls: [],
    systemFingerprint: "test000000000",
  };
}

function makeBrief(
  category: Brief["category"] = "PREMIUM_LIFESTYLE"
): Brief {
  return {
    id: "test",
    userId: "test",
    title: "Test brief",
    category,
    protagonistArchetype: "test",
    environment: "test",
    productFamily: null,
    productIntegration: "ABSENT",
    headline: "test",
    subhead: null,
    cta: null,
    notes: null,
    status: "DRAFT",
    createdAt: new Date(),
    updatedAt: new Date(),
    culturalContextId: null,
  };
}

// ─── Rule 1: Feeling-sentence endings ────────────────────────────────────────

describe("Rule 1: feeling-sentence endings", () => {
  it('strips "The scene feels intimate and focused." at end', () => {
    const prompt = `${BASE_PROMPT} The scene feels intimate and focused.`;
    const result = validateAndCorrect(makePrompt(prompt), makeBrief());
    expect(result.corrected.imagePrompt).not.toMatch(
      /The scene feels intimate and focused/i
    );
    expect(
      result.violations.some(
        (v) => v.rule === "Rule 1: No feeling-sentence endings"
      )
    ).toBe(true);
    expect(
      result.violations.find((v) => v.rule === "Rule 1: No feeling-sentence endings")
        ?.severity
    ).toBe("auto-corrected");
  });

  it('strips "...creating a serene atmosphere." at end', () => {
    const prompt = `${BASE_PROMPT} The diffuse light falls evenly across the work surface, creating a serene atmosphere.`;
    const result = validateAndCorrect(makePrompt(prompt), makeBrief());
    expect(result.corrected.imagePrompt).not.toMatch(/creating a serene atmosphere/i);
    expect(
      result.violations.some((v) => v.rule === "Rule 1: No feeling-sentence endings")
    ).toBe(true);
  });

  it('strips "The juxtaposition of the extraordinary and the mundane" ending', () => {
    const prompt = `${BASE_PROMPT} The juxtaposition of the extraordinary and the mundane is captured in the scene.`;
    const result = validateAndCorrect(makePrompt(prompt), makeBrief());
    expect(result.corrected.imagePrompt).not.toMatch(
      /juxtaposition of the extraordinary/i
    );
    expect(
      result.violations.some((v) => v.rule === "Rule 1: No feeling-sentence endings")
    ).toBe(true);
  });

  it("does NOT strip a prompt ending on concrete observable detail", () => {
    const prompt = `${BASE_PROMPT} Shot on Kodak Portra 400, fine grain visible in shadow areas.`;
    const result = validateAndCorrect(makePrompt(prompt), makeBrief());
    expect(result.corrected.imagePrompt).toMatch(
      /Kodak Portra 400, fine grain visible in shadow areas\./
    );
    expect(
      result.violations.some((v) => v.rule === "Rule 1: No feeling-sentence endings")
    ).toBe(false);
  });
});

// ─── Rule 2: "generic X" negatives ───────────────────────────────────────────

describe('Rule 2: "generic X" negatives', () => {
  it('removes "no generic pottery studio look" from negative prompt', () => {
    const neg = `${BASE_NEG}, no generic pottery studio look`;
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    expect(result.corrected.negativePrompt).not.toMatch(/generic pottery studio/i);
    expect(
      result.violations.some((v) => v.rule === 'Rule 2: No "generic X" negatives')
    ).toBe(true);
  });

  it('removes "no generic festival clichés" from negative prompt', () => {
    const neg = `${BASE_NEG}, no generic festival clichés`;
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    expect(result.corrected.negativePrompt).not.toMatch(/generic festival/i);
    expect(
      result.violations.some((v) => v.rule === 'Rule 2: No "generic X" negatives')
    ).toBe(true);
  });

  it('does NOT remove "no studio background" (no "generic" word)', () => {
    const neg = `${BASE_NEG}, no studio background`;
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    expect(result.corrected.negativePrompt).toMatch(/no studio background/);
    expect(
      result.violations.some((v) => v.rule === 'Rule 2: No "generic X" negatives')
    ).toBe(false);
  });
});

// ─── Rule 3: Negative prompt cap ─────────────────────────────────────────────

describe("Rule 3: negative prompt cap", () => {
  it("trims a 12-item negative prompt to 8 items", () => {
    const neg =
      "no rendered text, no watermarks, no logo overlays, no AI artifacts, " +
      "no melted hands, no warped anatomy, no cinematic lighting, no posed expression, " +
      "no studio background, no dramatic angles, no lens flare, no vignetting";
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    const items = result.corrected.negativePrompt
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    expect(items.length).toBe(8);
    expect(
      result.violations.some((v) => v.rule === "Rule 3: Negative prompt cap")
    ).toBe(true);
    expect(
      result.violations.find((v) => v.rule === "Rule 3: Negative prompt cap")
        ?.detail
    ).toMatch(/trimmed 12 items to 8/i);
  });

  it("leaves a 3-item negative prompt unchanged", () => {
    const neg = "no rendered text, no watermarks, no AI artifacts";
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    const items = result.corrected.negativePrompt
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    expect(items.length).toBe(3);
    expect(
      result.violations.some((v) => v.rule === "Rule 3: Negative prompt cap")
    ).toBe(false);
  });
});

// ─── Rule 4: Stage-direction narrative negatives ──────────────────────────────

describe("Rule 4: stage-direction narrative negatives", () => {
  it('flags "no reactions from bystanders" as warning but does NOT strip it', () => {
    const neg = `${BASE_NEG}, no reactions from bystanders`;
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    // Not stripped
    expect(result.corrected.negativePrompt).toMatch(/no reactions from bystanders/);
    // Warning violation present
    const violation = result.violations.find(
      (v) => v.rule === "Rule 4: Stage-direction narrative negative"
    );
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe("warning");
  });

  it('does NOT flag "no historical samurai setting"', () => {
    const neg = `${BASE_NEG}, no historical samurai setting`;
    const result = validateAndCorrect(makePrompt(BASE_PROMPT, neg), makeBrief());
    expect(
      result.violations.some(
        (v) => v.rule === "Rule 4: Stage-direction narrative negative"
      )
    ).toBe(false);
  });
});

// ─── Rule 5: Wear-word on absurd element ─────────────────────────────────────

describe("Rule 5: wear-word warnings", () => {
  it("warns on ABSURDIST_WESTERN brief with wear word in first half", () => {
    const prompt =
      "Weathered leather armor on the knight, plate mail showing age. " +
      BASE_PROMPT;
    const result = validateAndCorrect(
      makePrompt(prompt),
      makeBrief("ABSURDIST_WESTERN")
    );
    const violation = result.violations.find(
      (v) => v.rule === "Rule 5: Wear-word on absurd element"
    );
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe("warning");
    expect(violation?.detail).toMatch(/weathered/i);
  });

  it("does NOT warn on PREMIUM_LIFESTYLE brief with weathered teak pillars", () => {
    const prompt = "Weathered teak pillars in the Chettinad house interior. " + BASE_PROMPT;
    const result = validateAndCorrect(
      makePrompt(prompt),
      makeBrief("PREMIUM_LIFESTYLE")
    );
    expect(
      result.violations.some((v) => v.rule === "Rule 5: Wear-word on absurd element")
    ).toBe(false);
  });
});

// ─── Rule 6: Retry signal ─────────────────────────────────────────────────────

describe("Rule 6: retry signal", () => {
  it("sets retryRecommended: true for imagePrompt under 600 chars", () => {
    const shortPrompt =
      "Studio shot. Wide angle. Dark background. Product in center.";
    const result = validateAndCorrect(makePrompt(shortPrompt), makeBrief());
    expect(result.retryRecommended).toBe(true);
  });

  it("returns valid: true and retryRecommended: false for 1200-char prompt with no violations", () => {
    // Build a 1200+ char prompt with no violations
    const longPrompt =
      BASE_PROMPT +
      " The clay dust particles are suspended at one-meter intervals in the light shaft from the skylight, each visible as a bright specular point against the darker wall behind. The celadon glaze on the chawan bowl shows a fine crackle pattern, each hairline crack filled with darker stoneware body, visible at thirty centimeters distance under the skylight. The linen apron's weave shows individual threads at macro scale, the warp and weft creating a subtle diamond pattern in the oatmeal-colored fabric, natural oils from the ceramicist's hands creating a slight sheen in the grip areas.";
    expect(longPrompt.length).toBeGreaterThan(1200);
    const result = validateAndCorrect(makePrompt(longPrompt), makeBrief());
    expect(result.valid).toBe(true);
    expect(result.retryRecommended).toBe(false);
    expect(result.violations).toHaveLength(0);
  });
});

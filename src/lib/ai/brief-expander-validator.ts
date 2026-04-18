import type { Brief } from "@prisma/client";
import type { ExpandedPrompt } from "./brief-expander";

export type ValidationViolation = {
  rule: string;
  severity: "auto-corrected" | "warning" | "retry-required";
  detail: string;
  originalFragment?: string;
};

export type ValidationResult = {
  valid: boolean;
  violations: ValidationViolation[];
  corrected: ExpandedPrompt;
  retryRecommended: boolean;
};

const feelingSentencePatterns: RegExp[] = [
  // "The scene/atmosphere/environment/... [feel-verb] ..."
  /(?:^|\. )((?:The\s+)?(?:scene|atmosphere|environment|room|space|setting|ritual|moment|juxtaposition|interplay|interior)[^.]*(?:feel|conveys|evokes|captures|suggests|embodies|emphasizes|highlights|creates|reflects|communicates)[^.]*)\.\s*$/i,

  // "...creating a/an [mood-adjective] [noun]"
  /(?:^|\. )([^.]*creating\s+an?\s+(?:intimate|serene|tranquil|timeless|reverent|peaceful|focused|still|calm|cozy|warm|quiet|contemplative|meditative|lived-in|authentic|ephemeral|delicate|gentle|soft)[^.]*)\.\s*$/i,

  // "The juxtaposition of the extraordinary and the mundane" style
  /(?:^|\. )([^.]*juxtaposition\s+of\s+(?:the\s+)?[^.]*)\.\s*$/i,

  // "...captures/embodies/represents/conveys the [abstract noun]"
  /(?:^|\. )([^.]*(?:captures|embodies|represents|conveys)\s+(?:the|a|an)\s+(?:essence|spirit|feeling|mood|serenity|tranquility|calm|reverence|authenticity|simplicity|tradition)[^.]*)\.\s*$/i,

  // "...emphasizing the [feeling-noun]"
  /(?:^|\. )([^.]*emphasi[sz]ing\s+(?:the|a|an)\s+(?:tranquility|serenity|calm|reverence|authenticity|simplicity|intimacy|stillness)[^.]*)\.\s*$/i,
];

const stageDirectionPatterns: RegExp[] = [
  /no\s+reactions?\s+from/i,
  /no\s+(?:other\s+)?(?:absurdist|surreal)\s+(?:characters|elements)/i,
  /no\s+unrealistic\s+\w+\s+activity/i,
];

const wearWords = [
  "patina",
  "tarnish",
  "rust",
  "oxidation",
  "oxidized",
  "frayed",
  "weathered",
  "soot-marked",
  "stained",
  "worn",
  "well-worn",
  "battle-worn",
  "broken-in",
  "dented",
  "chipped",
  "scratched",
  "scuffed",
  "aged",
  "yellowed",
  "faded",
];

export function validateAndCorrect(
  output: ExpandedPrompt,
  brief: Brief
): ValidationResult {
  const violations: ValidationViolation[] = [];
  let corrected: ExpandedPrompt = { ...output };

  // Rule 1: Strip feeling-sentence endings from imagePrompt
  for (const pattern of feelingSentencePatterns) {
    const match = corrected.imagePrompt.match(pattern);
    if (match) {
      const fragment = match[1];
      const matchStart = match.index!;
      let before = corrected.imagePrompt.slice(0, matchStart);

      if (match[0].startsWith(". ")) {
        // Preserve the period that ended the previous sentence
        before = before.trimEnd() + ".";
      } else {
        before = before.trimEnd();
      }

      violations.push({
        rule: "Rule 1: No feeling-sentence endings",
        severity: "auto-corrected",
        detail: "Stripped summarizing feeling-sentence from end of imagePrompt",
        originalFragment: fragment,
      });

      corrected = { ...corrected, imagePrompt: before };
      break; // Only strip the trailing feeling sentence once
    }
  }

  // Rule 2: Strip "generic X" negatives (run before Rule 3 so cap applies to cleaned list)
  let negItems = corrected.negativePrompt
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const genericStripped = negItems.filter((item) => /\bgeneric\b/i.test(item));
  if (genericStripped.length > 0) {
    negItems = negItems.filter((item) => !/\bgeneric\b/i.test(item));
    violations.push({
      rule: 'Rule 2: No "generic X" negatives',
      severity: "auto-corrected",
      detail: `Stripped ${genericStripped.length} item(s) containing "generic"`,
      originalFragment: genericStripped.join(", "),
    });
  }

  // Rule 3: Cap at 7 items — matches system prompt: 4 core + max 3 brief-specific
  if (negItems.length > 7) {
    const countBefore = negItems.length;
    negItems = negItems.slice(0, 7);
    violations.push({
      rule: "Rule 3: Negative prompt cap",
      severity: "auto-corrected",
      detail: `Trimmed ${countBefore} items to 7`,
    });
  }

  corrected = { ...corrected, negativePrompt: negItems.join(", ") };

  // Rule 4: Flag stage-direction narrative negatives (warn only, do not strip)
  for (const item of negItems) {
    for (const pattern of stageDirectionPatterns) {
      if (pattern.test(item)) {
        violations.push({
          rule: "Rule 4: Stage-direction narrative negative",
          severity: "warning",
          detail: `Narrative negative that image model cannot reliably suppress: "${item}"`,
          originalFragment: item,
        });
        break;
      }
    }
  }

  // Rule 5: Wear-word check (ABSURDIST_WESTERN only, warn only, do not strip)
  if (brief.category === "ABSURDIST_WESTERN") {
    const firstHalf = corrected.imagePrompt.slice(
      0,
      Math.floor(corrected.imagePrompt.length / 2)
    );
    const matched = wearWords.filter((word) => {
      const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
      return pattern.test(firstHalf);
    });
    if (matched.length > 0) {
      violations.push({
        rule: "Rule 5: Wear-word on absurd element",
        severity: "warning",
        detail: `Wear vocabulary found in first half of imagePrompt (may apply to absurd element): ${matched.join(", ")}`,
      });
    }
  }

  // Rule 6: Retry signal — only for structural failures, not for correctable issues
  const promptLen = corrected.imagePrompt.length;
  const negCount = negItems.length;
  const retryRecommended = promptLen < 600 || promptLen > 2500 || negCount === 0;

  return {
    valid: violations.length === 0,
    violations,
    corrected,
    retryRecommended,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

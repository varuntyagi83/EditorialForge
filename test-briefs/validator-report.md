# Validator Report — v1.3.0

Date: 2026-04-18T07:10:48.899Z
Briefs processed: 18
Briefs with violations: 18
Retries triggered: 3

## Per-brief findings

### Brief 1: Liquid Death at the Maut Ka Kua
- Category: INDIAN_FESTIVAL
- Violations: 2
- Corrections applied:
  - Rule 1: No feeling-sentence endings: Stripped summarizing feeling-sentence from end of imagePrompt ("Atmospheric: suspended dust particles catch the sunlight, creating a warm glow w...")
  - Rule 3: Negative prompt cap: Trimmed 9 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 1868 chars

### Brief 2: Suburban dad knight in the cereal aisle
- Category: ABSURDIST_WESTERN
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2060 chars

### Brief 3: Japanese whisky bar golden hour
- Category: PREMIUM_LIFESTYLE
- Violations: 2
- Corrections applied:
  - Rule 2: No "generic X" negatives: Stripped 1 item(s) containing "generic" ("no generic mood lighting")
  - Rule 3: Negative prompt cap: Trimmed 9 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2237 chars

### Brief 4: Durga Puja evening crowd Kolkata
- Category: INDIAN_FESTIVAL
- Violations: 2
- Corrections applied:
  - Rule 2: No "generic X" negatives: Stripped 1 item(s) containing "generic" ("no generic festival clichés")
  - Rule 3: Negative prompt cap: Trimmed 9 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2460 chars

### Brief 5: Kinfolk breakfast, Oslo apartment
- Category: PREMIUM_LIFESTYLE
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2270 chars

### Brief 6: Chai wallah at Howrah station at 5am
- Category: INDIAN_FESTIVAL
- Violations: 2
- Corrections applied:
  - Rule 1: No feeling-sentence endings: Stripped summarizing feeling-sentence from end of imagePrompt ("Atmospheric detail: dense fog at 2 meters, steam from the kulhad and commuters' ...")
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2086 chars

### Brief 7: Office worker samurai defending the printer
- Category: ABSURDIST_WESTERN
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2175 chars

### Brief 8: Scandi ceramicist morning studio
- Category: PREMIUM_LIFESTYLE
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings: none
- Retry triggered: yes
- Final prompt length: 2736 chars

### Brief 9: Holi powder explosion in an Ahmedabad lane
- Category: INDIAN_FESTIVAL
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2178 chars

### Brief 10: Retired accountant wizard at the DMV
- Category: ABSURDIST_WESTERN
- Violations: 2
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings:
  - Rule 4: Stage-direction narrative negative: Narrative negative that image model cannot reliably suppress: "no other absurdist elements"
- Retry triggered: no
- Final prompt length: 1906 chars

### Brief 11: Italian nonna espresso ritual, Naples
- Category: PREMIUM_LIFESTYLE
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 1822 chars

### Brief 12: Kalbelia dancer backstage Pushkar mela
- Category: INDIAN_FESTIVAL
- Violations: 2
- Corrections applied:
  - Rule 1: No feeling-sentence endings: Stripped summarizing feeling-sentence from end of imagePrompt ("Atmospheric detail: fine dust particles visible in the light shafts, creating a ...")
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2356 chars

### Brief 13: Astronaut at a suburban backyard barbecue
- Category: ABSURDIST_WESTERN
- Violations: 2
- Corrections applied:
  - Rule 1: No feeling-sentence endings: Stripped summarizing feeling-sentence from end of imagePrompt ("The scene captures the juxtaposition of the extraordinary and the mundane, with ...")
  - Rule 3: Negative prompt cap: Trimmed 11 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2021 chars

### Brief 14: Wabi-sabi flower arranger, Kyoto
- Category: PREMIUM_LIFESTYLE
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 12 items to 8
- Warnings: none
- Retry triggered: yes
- Final prompt length: 2556 chars

### Brief 15: Beekeeper in a Mumbai rooftop colony
- Category: OTHER
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2388 chars

### Brief 16: Corporate warrior takes a bhog break at a Kolkata pandal
- Category: INDIAN_FESTIVAL
- Violations: 2
- Corrections applied:
  - Rule 1: No feeling-sentence endings: Stripped summarizing feeling-sentence from end of imagePrompt ("The scene captures the essence of a traditional Puja gathering, with the protago...")
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: yes
- Final prompt length: 2602 chars

### Brief 17: Minimalist Scandi morning, with a medieval blacksmith
- Category: ABSURDIST_WESTERN
- Violations: 2
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 12 items to 8
- Warnings:
  - Rule 5: Wear-word on absurd element: Wear vocabulary found in first half of imagePrompt (may apply to absurd element): oxidation, soot-marked
- Retry triggered: no
- Final prompt length: 2222 chars

### Brief 18: South Indian filter coffee, brass and sunlight
- Category: PREMIUM_LIFESTYLE
- Violations: 1
- Corrections applied:
  - Rule 3: Negative prompt cap: Trimmed 10 items to 8
- Warnings: none
- Retry triggered: no
- Final prompt length: 2492 chars

## Summary by rule

- Rule 1 (feeling-sentences stripped): 5 briefs affected
- Rule 2 ("generic X" stripped): 2 briefs affected
- Rule 3 (negative count capped): 18 briefs affected
- Rule 4 (narrative negative warnings): 1 briefs flagged
- Rule 5 (wear-word warnings): 1 briefs flagged
- Retries triggered: 3 briefs
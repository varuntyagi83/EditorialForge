import { describe, it, expect, vi, beforeEach } from "vitest";
import { expandBrief } from "../brief-expander";
import type { Brief, CulturalContext } from "@prisma/client";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    imagePrompt:
                      "A wide shot of a Rajasthan mela at 3pm, the Wall of Death silodrome structure in the center with rough-hewn deodar cedar planks, crowd leaning over the top rail, a 28-year-old Rajasthani male rider seated on a Royal Enfield Bullet 350 in the barrel interior, cracked leather jacket over bleached denim, steel-toe boots with mirror-work on the toe cap, holding a Liquid Death tallboy can at chest height, direct 3pm sun entering from the open top at 45 degrees creating hard shadows on the plank surfaces, 35mm lens at f/2.8 from slightly below eye level looking up toward the crowd rim corona, Kodak Portra 800 pushed one stop, deodar cedar grain saturated with motor oil appearing walnut-brown at the base, airborne dust at 2-3m height, diesel exhaust pooling at ground level, Ferris wheels and food stalls in the far background through gaps in the crowd",
                    negativePrompt:
                      "no rendered text, no watermarks, no overlay logo, no UI elements, no AI artifacts, no melted hands, no warped anatomy, no stock photography lighting, no smiling at camera, no composite look",
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

const mockBrief: Brief = {
  id: "test-brief-id",
  userId: "test-user-id",
  title: "Liquid Death at the Maut Ka Kua",
  culturalContextId: null,
  category: "INDIAN_FESTIVAL",
  protagonistArchetype: "Rajasthani stunt rider",
  environment: "Wall of Death silodrome at a Rajasthan mela, 3pm October",
  productFamily: "Liquid Death sparkling water",
  productIntegration: "HELD",
  headline: "Hydrate or die trying",
  subhead: null,
  cta: null,
  notes: null,
  status: "DRAFT",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCulturalContext: CulturalContext = {
  id: "test-context-id",
  name: "Rajasthan Mela",
  region: "south-asia",
  category: "INDIAN_FESTIVAL",
  visualAnchors: {},
  fabricAndColor: {},
  typicalProtagonists: {},
  atmosphericSignatures: {},
  forbiddenCombinations: {},
  referenceImageUrls: [],
  createdAt: new Date(),
};

describe("expandBrief", () => {
  it("returns imagePrompt between 800 and 1800 characters", async () => {
    const result = await expandBrief({
      brief: mockBrief,
      culturalContext: mockCulturalContext,
      referenceImageUrls: [],
      variationIndex: 0,
    });
    expect(result.imagePrompt.length).toBeGreaterThanOrEqual(800);
    expect(result.imagePrompt.length).toBeLessThanOrEqual(1800);
  });

  it("negativePrompt includes required forbidden elements", async () => {
    const result = await expandBrief({
      brief: mockBrief,
      culturalContext: mockCulturalContext,
      referenceImageUrls: [],
      variationIndex: 0,
    });
    expect(result.negativePrompt).toMatch(/no rendered text/i);
    expect(result.negativePrompt).toMatch(/no watermark/i);
    expect(result.negativePrompt).toMatch(/no overlay logo|no logo overlay/i);
  });

  it("returns a systemFingerprint of 12 hex characters", async () => {
    const result = await expandBrief({
      brief: mockBrief,
      culturalContext: mockCulturalContext,
      referenceImageUrls: [],
      variationIndex: 0,
    });
    expect(result.systemFingerprint).toMatch(/^[0-9a-f]{12}$/);
  });

  it("variationIndex 0 and 3 are handled without throwing", async () => {
    const result0 = await expandBrief({
      brief: mockBrief,
      culturalContext: null,
      referenceImageUrls: [],
      variationIndex: 0,
    });
    const result3 = await expandBrief({
      brief: mockBrief,
      culturalContext: null,
      referenceImageUrls: [],
      variationIndex: 3,
    });
    expect(result0.imagePrompt).toBeTruthy();
    expect(result3.imagePrompt).toBeTruthy();
  });

  it("passes referenceImageUrls through to the result", async () => {
    const urls = ["https://signed.example.com/a.jpg", "https://signed.example.com/b.jpg"];
    const result = await expandBrief({
      brief: mockBrief,
      culturalContext: null,
      referenceImageUrls: urls,
      variationIndex: 0,
    });
    expect(result.referenceImageUrls).toEqual(urls);
  });
});

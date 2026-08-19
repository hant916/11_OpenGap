import { describe, expect, it } from "vitest";
import {
  deriveRefinements,
  MAX_REFINEMENTS,
  MIN_REFINEMENTS,
} from "./refine";

describe("deriveRefinements", () => {
  it("returns no suggestions for a blank topic", () => {
    expect(deriveRefinements("  ")).toEqual([]);
  });

  it("returns at most three topic-specific suggestions", () => {
    const refinements = deriveRefinements("AI Agent Governance");

    expect(refinements.length).toBeGreaterThanOrEqual(MIN_REFINEMENTS);
    expect(refinements.length).toBeLessThanOrEqual(MAX_REFINEMENTS);
    for (const refinement of refinements) {
      expect(refinement.topic).toContain("AI Agent Governance");
    }
  });
});

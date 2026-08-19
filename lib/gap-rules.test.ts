import { describe, expect, it } from "vitest";
import type { MetricCounts } from "./domain";
import {
  deriveFinding,
  MAX_REASONS,
  SPARSE_EVIDENCE_THRESHOLD,
  STRONG_EVIDENCE_THRESHOLD,
} from "./gap-rules";

function counts(overrides?: Partial<MetricCounts>): MetricCounts {
  return {
    publications: 100,
    projects: 10,
    software: 30,
    datasets: 20,
    ...overrides,
  };
}

describe("deriveFinding", () => {
  it("applies the sparse evidence rule first even when a translation gap also matches", () => {
    const result = deriveFinding(counts({ publications: 9, software: 0, datasets: 0 }));
    expect(result.type).toBe("sparse_evidence");
  });

  it("does not flag sparse evidence at the threshold boundary", () => {
    const result = deriveFinding(
      counts({ publications: SPARSE_EVIDENCE_THRESHOLD, software: 40, datasets: 30 }),
    );
    expect(result.type).not.toBe("sparse_evidence");
  });

  it("flags a translation gap at the strong evidence boundary", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD, software: 1, datasets: 1 }),
    );
    expect(result.type).toBe("translation_gap");
  });

  it("does not flag a translation gap just above the reusable ratio floor", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD, software: 2, datasets: 2, projects: 3 }),
    );
    expect(result.type).toBe("project_gap");
  });

  it("flags a project gap at its project boundary", () => {
    const result = deriveFinding(
      counts({
        publications: STRONG_EVIDENCE_THRESHOLD,
        projects: 3,
        software: 10,
        datasets: 10,
      }),
    );
    expect(result.type).toBe("project_gap");
  });

  it("falls through to no_strong_gap just above the project floor", () => {
    const result = deriveFinding(
      counts({
        publications: STRONG_EVIDENCE_THRESHOLD,
        projects: 4,
        software: 10,
        datasets: 10,
      }),
    );
    expect(result.type).toBe("no_strong_gap");
  });

  it("falls through to no_strong_gap below strong evidence without sparse evidence", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD - 1, software: 40, datasets: 30 }),
    );
    expect(result.type).toBe("no_strong_gap");
  });

  it("returns no_strong_gap when all conditions pass", () => {
    const result = deriveFinding(counts({ projects: 20, software: 30, datasets: 20 }));
    expect(result).toEqual({
      type: "no_strong_gap",
      title: "No strong gap detected",
      summary: "No strong gap was detected by the MVP heuristic.",
      reasons: [],
    });
  });

  it("never produces more than three reasons", () => {
    const result = deriveFinding(
      counts({ publications: 100, software: 2, datasets: 3 }),
      counts({ publications: 100, software: 60, datasets: 40 }),
    );
    expect(result.reasons.length).toBeLessThanOrEqual(MAX_REASONS);
  });

  it("adds a baseline reason only when the baseline ratio is twice the topic ratio", () => {
    const without = deriveFinding(
      counts({ publications: 100, software: 2, datasets: 3 }),
      counts({ publications: 100, software: 5, datasets: 5 }),
    );
    const withBaseline = deriveFinding(
      counts({ publications: 100, software: 2, datasets: 3 }),
      counts({ publications: 100, software: 60, datasets: 40 }),
    );
    expect(without.reasons).toHaveLength(2);
    expect(withBaseline.reasons).toHaveLength(3);
    expect(withBaseline.reasons[2]).toBe(
      "The translation ratio is less than half the selected baseline topic.",
    );
  });

  it("renders reasons that reference measured values", () => {
    const result = deriveFinding(
      counts({ publications: 100, software: 2, datasets: 3 }),
    );
    expect(result.reasons[0]).toBe(
      "100 publications were found versus 5 software/data outputs.",
    );
  });
});

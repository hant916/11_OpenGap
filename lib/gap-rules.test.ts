import { describe, expect, it } from "vitest";
import type { MetricCounts } from "./domain";
import { deriveResearchMetrics } from "./derived-metrics";
import {
  deriveFinding,
  MAX_REASONS,
  SPARSE_EVIDENCE_THRESHOLD,
  STRONG_EVIDENCE_THRESHOLD,
} from "./gap-rules";
import {
  FROZEN_GAP_KINDS,
  FUNDING_CAVEAT,
  LOW_EVIDENCE_REASON,
  NO_STRONG_CLARIFICATION,
  REUSE_UNCERTAINTY,
  ZERO_PROJECT_SCAN_COPY,
} from "./result-semantics";
import goldenTopics from "../test/fixtures/golden-topics.json";

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
  it("returns the no-gap state when evidence is too sparse to compare structural signals", () => {
    const result = deriveFinding(counts({ publications: 9, software: 0, datasets: 0 }));
    expect(result.type).toBe("no_strong_structural_gap");
    expect(result.reasons).toContain(LOW_EVIDENCE_REASON);
  });

  it("keeps the no-gap state at the sparse threshold boundary", () => {
    const result = deriveFinding(
      counts({ publications: SPARSE_EVIDENCE_THRESHOLD, software: 40, datasets: 30 }),
    );
    expect(result.type).toBe("no_strong_structural_gap");
    expect(result.reasons).not.toContain(LOW_EVIDENCE_REASON);
  });

  it("flags a potential reuse gap at the strong evidence boundary", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD, software: 1, datasets: 1 }),
    );
    expect(result.type).toBe("potential_reuse_gap");
  });

  it("does not flag a reuse gap just above the reusable ratio floor", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD, software: 2, datasets: 2, projects: 3 }),
    );
    expect(result.type).toBe("potential_funding_gap");
  });

  it("flags a potential funding gap at its project boundary", () => {
    const result = deriveFinding(
      counts({
        publications: STRONG_EVIDENCE_THRESHOLD,
        projects: 3,
        software: 10,
        datasets: 10,
      }),
    );
    expect(result.type).toBe("potential_funding_gap");
  });

  it("falls through to no_strong_structural_gap just above the project floor", () => {
    const result = deriveFinding(
      counts({
        publications: STRONG_EVIDENCE_THRESHOLD,
        projects: 4,
        software: 10,
        datasets: 10,
      }),
    );
    expect(result.type).toBe("no_strong_structural_gap");
  });

  it("falls through to no_strong_structural_gap below strong evidence without sparse evidence", () => {
    const result = deriveFinding(
      counts({ publications: STRONG_EVIDENCE_THRESHOLD - 1, software: 40, datasets: 30 }),
    );
    expect(result.type).toBe("no_strong_structural_gap");
  });

  it("returns no_strong_structural_gap when all conditions pass", () => {
    const result = deriveFinding(counts({ projects: 20, software: 30, datasets: 20 }));
    expect(result).toEqual({
      type: "no_strong_structural_gap",
      title: "No strong structural gap detected",
      summary: "This scan found no strong structural imbalance in the measured signals.",
      reasons: [NO_STRONG_CLARIFICATION],
    });
  });

  it("clarifies that the no-gap state does not mean there are no open research questions", () => {
    const result = deriveFinding(counts({ projects: 20 }));
    expect(result.type).toBe("no_strong_structural_gap");
    expect(result.reasons).toContain(NO_STRONG_CLARIFICATION);
  });

  it("uses the frozen zero-project copy when no project records match", () => {
    const result = deriveFinding(
      counts({ projects: 0, software: 30, datasets: 20 }),
    );
    expect(result.type).toBe("potential_funding_gap");
    expect(result.reasons[0]).toBe(ZERO_PROJECT_SCAN_COPY);
    expect(result.reasons[1]).toBe(FUNDING_CAVEAT);
  });

  it("never produces more than three reasons", () => {
    const result = deriveFinding(
      counts({ publications: 100, projects: 20, software: 2, datasets: 3 }),
      counts({ publications: 100, projects: 20, software: 60, datasets: 40 }),
    );
    expect(result.type).toBe("potential_reuse_gap");
    expect(result.reasons.length).toBeLessThanOrEqual(MAX_REASONS);
  });

  it("adds a baseline reason only when the baseline ratio is twice the topic ratio", () => {
    const without = deriveFinding(
      counts({ projects: 20, software: 2, datasets: 3 }),
      counts({ projects: 20, software: 5, datasets: 5 }),
    );
    const withBaseline = deriveFinding(
      counts({ projects: 20, software: 2, datasets: 3 }),
      counts({ projects: 20, software: 60, datasets: 40 }),
    );
    expect(without.type).toBe("potential_reuse_gap");
    expect(withBaseline.type).toBe("potential_reuse_gap");
    expect(without.reasons).toHaveLength(2);
    expect(withBaseline.reasons).toHaveLength(3);
    expect(withBaseline.reasons[2]).toBe(
      "The software/data output ratio is less than half the selected baseline topic.",
    );
  });

  it("renders reasons that reference measured values in the scan", () => {
    const result = deriveFinding(
      counts({ projects: 20, software: 2, datasets: 3 }),
    );
    expect(result.reasons[0]).toBe(
      "100 publications were found versus 5 software/data outputs in this scan.",
    );
  });

  it("wraps the reuse gap in scan-scoped uncertainty language", () => {
    const result = deriveFinding(
      counts({ projects: 20, software: 2, datasets: 3 }),
    );
    expect(result.type).toBe("potential_reuse_gap");
    expect(result.summary).toContain(REUSE_UNCERTAINTY);
    expect(result.summary).toContain("in this scan");
  });

  it("chooses funding as the primary finding when both imbalances trigger", () => {
    const result = deriveFinding(
      counts({ publications: 100, projects: 0, software: 2, datasets: 3 }),
    );
    expect(result.type).toBe("potential_funding_gap");
    expect(result.reasons[0]).toBe(ZERO_PROJECT_SCAN_COPY);
    expect(result.reasons).not.toContain(REUSE_UNCERTAINTY);
  });
});

describe("golden demo reference signals (pack 0004)", () => {
  const golden = goldenTopics as unknown as Record<string, MetricCounts>;
  const ai = golden.ai_agent_governance;
  const climate = golden.climate_adaptation;
  const quantum = golden.quantum_computing;

  it("AI Agent Governance observed signals map to cautious scan-scoped funding semantics", () => {
    const finding = deriveFinding(ai);
    expect(finding.type).toBe("potential_funding_gap");
    expect(finding.reasons[0]).toBe(ZERO_PROJECT_SCAN_COPY);
    expect(finding.reasons).toContain(FUNDING_CAVEAT);
    const wording = finding.summary + " " + finding.reasons.join(" ");
    expect(wording).toContain("in this scan");
    expect(wording).not.toMatch(/no funded projects exist/i);
  });

  it("Climate Adaptation observed signals classify deterministically and never use translation-gap wording", () => {
    const finding = deriveFinding(climate);
    const wording = finding.summary + " " + finding.reasons.join(" ");
    expect(wording).not.toMatch(/translation gap/i);
    for (const reason of finding.reasons) {
      expect(reason.includes("in this scan") || reason === FUNDING_CAVEAT).toBe(
        true,
      );
    }
  });

  it("validates the observed Climate reusable-output reference ratio without markup coupling", () => {
    const metrics = deriveResearchMetrics(climate);
    expect(metrics.reusableOutputs).toBe(6414);
    expect(metrics.reuseRatio).toBeCloseTo(0.0501, 4);
  });

  it("Climate Adaptation-style reuse signals map to cautious reuse-gap semantics", () => {
    const finding = deriveFinding(
      counts({ publications: 100, projects: 20, software: 2, datasets: 3 }),
    );
    expect(finding.type).toBe("potential_reuse_gap");
    expect(finding.summary).toContain(REUSE_UNCERTAINTY);
    expect(finding.summary).toContain("in this scan");
    const wording = finding.summary + " " + finding.reasons.join(" ");
    expect(wording).not.toMatch(/translation gap/i);
  });

  it("Quantum Computing observed signals classify via the same production classifier", () => {
    const finding = deriveFinding(quantum);
    expect(FROZEN_GAP_KINDS).toContain(finding.type);
    expect(finding.title.length).toBeGreaterThan(0);
  });

  it("Quantum Computing-style strong signals are allowed to produce no_strong_structural_gap", () => {
    const finding = deriveFinding(
      counts({ publications: 100, projects: 20, software: 30, datasets: 20 }),
    );
    expect(finding.type).toBe("no_strong_structural_gap");
    expect(finding.reasons).toContain(NO_STRONG_CLARIFICATION);
  });

  it("frozen copy stays scan-scoped and never reintroduces translation-gap wording", () => {
    const copy = [
      ZERO_PROJECT_SCAN_COPY,
      FUNDING_CAVEAT,
      REUSE_UNCERTAINTY,
      NO_STRONG_CLARIFICATION,
      LOW_EVIDENCE_REASON,
    ].join(" ");
    expect(copy).toContain("in this scan");
    expect(copy).not.toMatch(/translation gap/i);
  });
});

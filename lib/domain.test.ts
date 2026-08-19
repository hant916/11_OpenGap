import { describe, expect, it } from "vitest";
import {
  GAP_TYPE_LABELS,
  TREND_LABELS,
  type AnalysisResult,
  type MetricCounts,
} from "./domain";

describe("domain model", () => {
  it("exposes labels for every gap type", () => {
    expect(GAP_TYPE_LABELS).toMatchObject({
      translation_gap: expect.stringContaining("translation"),
      project_gap: expect.stringContaining("project"),
      sparse_evidence: expect.stringContaining("Sparse"),
      no_strong_gap: expect.stringContaining("No strong"),
    });
  });

  it("exposes a label for every trend", () => {
    expect(Object.keys(TREND_LABELS).sort()).toEqual([
      "declining",
      "growing",
      "insufficient_data",
      "stable",
    ]);
  });

  it("defines the AnalysisResult shape", () => {
    const metrics: MetricCounts = {
      publications: 1,
      projects: 1,
      software: 1,
      datasets: 1,
    };
    const result: AnalysisResult = {
      topic: "AI Agent Governance",
      metrics,
      trend: "growing",
      finding: {
        type: "translation_gap",
        title: "Potential translation gap",
        summary: "Research output is stronger than reusable technical output.",
        reasons: ["Reusable outputs remain sparse."],
      },
      evidence: [],
      methodologyVersion: "mvp-1",
      retrievedAt: "2026-08-19T00:00:00.000Z",
    };
    expect(result.metrics).toEqual(metrics);
    expect(result.methodologyVersion).toBe("mvp-1");
  });
});

import { describe, expect, it } from "vitest";
import {
  RESEARCH_SIGNAL_THRESHOLDS,
  deriveResearchMetrics,
} from "./derived-metrics";

describe("deriveResearchMetrics", () => {
  it("computes reusable outputs as software plus datasets", () => {
    const metrics = deriveResearchMetrics({
      publications: 100,
      projects: 10,
      software: 30,
      datasets: 20,
    });
    expect(metrics.reusableOutputs).toBe(50);
    expect(metrics.reuseRatio).toBe(0.5);
    expect(metrics.projectRatio).toBe(0.1);
  });

  it("keeps ratios undefined instead of NaN or Infinity when publications is zero", () => {
    const metrics = deriveResearchMetrics({
      publications: 0,
      projects: 0,
      software: 0,
      datasets: 0,
    });
    expect(metrics.reuseRatio).toBeUndefined();
    expect(metrics.projectRatio).toBeUndefined();
  });

  it("centralizes the heuristic thresholds with clear names", () => {
    expect(RESEARCH_SIGNAL_THRESHOLDS).toEqual({
      sparseEvidenceMinimumPublications: 10,
      strongEvidenceMinimumPublications: 20,
      minimumReusableOutputFloor: 3,
      minimumProjectRecordsFloor: 3,
      reuseRatioFloor: 0.1,
      projectRatioFloor: 0.15,
    });
  });

  it("centralizes the reusable-output and project-record floors", () => {
    const metrics = deriveResearchMetrics({
      publications: 20,
      projects: 0,
      software: 0,
      datasets: 0,
    });
    expect(metrics.reuseOutputFloor).toBe(3);
    expect(metrics.projectRecordsFloor).toBe(3);
  });
});

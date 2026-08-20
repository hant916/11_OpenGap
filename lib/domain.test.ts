import { describe, expect, it } from "vitest";
import {
  GAP_TYPE_LABELS,
  safeEvidenceUrl,
  TREND_LABELS,
  type AnalysisResult,
  type MetricCounts,
} from "./domain";

describe("domain model", () => {
  it("exposes labels for every frozen gap kind", () => {
    expect(GAP_TYPE_LABELS).toMatchObject({
      potential_funding_gap: expect.stringContaining("funding"),
      potential_reuse_gap: expect.stringContaining("reuse"),
      no_strong_structural_gap: expect.stringContaining("No strong"),
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
        type: "potential_reuse_gap",
        title: "Potential reuse gap",
        summary: "Publications outweigh reusable software and data outputs in this scan.",
        reasons: ["Reusable outputs remain sparse in this scan."],
      },
      evidence: [],
      methodologyVersion: "mvp-1",
      retrievedAt: "2026-08-19T00:00:00.000Z",
      provenance: {
        topic: "AI Agent Governance",
        source: "openaire",
        collectedAt: "2026-08-19T00:00:00.000Z",
      },
    };
    expect(result.metrics).toEqual(metrics);
    expect(result.methodologyVersion).toBe("mvp-1");
    expect(result.provenance.collectedAt).toBe("2026-08-19T00:00:00.000Z");
  });
});

describe("safeEvidenceUrl", () => {
  it("keeps http and https URLs unchanged", () => {
    expect(safeEvidenceUrl("https://doi.org/10.1/x")).toBe(
      "https://doi.org/10.1/x",
    );
    expect(safeEvidenceUrl("http://example.org/record")).toBe(
      "http://example.org/record",
    );
  });

  it("rejects non-http protocols that could execute in a browser", () => {
    expect(safeEvidenceUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeEvidenceUrl("data:text/html,<script>1</script>")).toBeUndefined();
    expect(safeEvidenceUrl("file:///etc/passwd")).toBeUndefined();
    expect(safeEvidenceUrl("vbscript:msgbox(1)")).toBeUndefined();
  });

  it("rejects non-strings, blank strings and malformed URLs", () => {
    expect(safeEvidenceUrl(undefined)).toBeUndefined();
    expect(safeEvidenceUrl(null)).toBeUndefined();
    expect(safeEvidenceUrl(42)).toBeUndefined();
    expect(safeEvidenceUrl("   ")).toBeUndefined();
    expect(safeEvidenceUrl("not a url")).toBeUndefined();
    expect(safeEvidenceUrl("https://")).toBeUndefined();
  });
});

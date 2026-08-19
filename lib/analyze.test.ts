import { describe, expect, it } from "vitest";
import { AnalysisError, analyzeTopic } from "./analyze";
import {
  OpenAireError,
  type OpenAireProvider,
  type OpenAireSnapshot,
} from "./openaire";

const FIXED_NOW = () => new Date("2026-08-19T12:00:00.000Z");

function makeSnapshot(overrides?: Partial<OpenAireSnapshot>): OpenAireSnapshot {
  return {
    counts: {
      publications: 1250,
      projects: 12,
      software: 126,
      datasets: 355,
    },
    yearBuckets: [
      { year: 2022, publications: 70 },
      { year: 2023, publications: 80 },
      { year: 2024, publications: 90 },
      { year: 2025, publications: 100 },
    ],
    evidence: [
      {
        id: "pub1",
        type: "publication",
        title: "AI governance: a review",
        year: 2024,
        source: "openaire",
      },
    ],
    ...overrides,
  };
}

function makeProvider(snap: OpenAireSnapshot): OpenAireProvider {
  return { analyzeTopic: async () => snap };
}

describe("analyzeTopic", () => {
  it("returns a shape-complete AnalysisResult from a provider snapshot", async () => {
    const result = await analyzeTopic(
      { topic: "AI Agent Governance" },
      { provider: makeProvider(makeSnapshot()), now: FIXED_NOW },
    );

    expect(Object.keys(result).sort()).toEqual([
      "evidence",
      "finding",
      "methodologyVersion",
      "metrics",
      "retrievedAt",
      "topic",
      "trend",
    ]);
    expect(result.topic).toBe("AI Agent Governance");
    expect(result.metrics).toEqual({
      publications: 1250,
      projects: 12,
      software: 126,
      datasets: 355,
    });
    expect(result.methodologyVersion).toBe("mvp-1");
    expect(result.retrievedAt).toBe("2026-08-19T12:00:00.000Z");
    expect(result.evidence[0]).toEqual({
      id: "pub1",
      type: "publication",
      title: "AI governance: a review",
      year: 2024,
      source: "openaire",
    });
  });

  it("does not leak provider-specific fields into AnalysisResult", async () => {
    const snapshot = {
      ...makeSnapshot(),
      counts: {
        ...makeSnapshot().counts,
        numFound: 9999,
      },
      header: { numFound: 9999, page: 1 },
    } as unknown as OpenAireSnapshot;

    const result = await analyzeTopic(
      { topic: "AI Agent Governance" },
      { provider: makeProvider(snapshot), now: FIXED_NOW },
    );

    expect(result).not.toHaveProperty("header");
    expect(result.metrics).not.toHaveProperty("numFound");
    expect(JSON.stringify(result)).not.toContain("numFound");
  });

  it("rejects a blank topic with an INVALID_TOPIC analysis error", async () => {
    await expect(
      analyzeTopic(
        { topic: "   " },
        { provider: makeProvider(makeSnapshot()), now: FIXED_NOW },
      ),
    ).rejects.toMatchObject({
      code: "INVALID_TOPIC",
      message: "Enter a research topic.",
    });
  });

  it("surfaces an explicit provider failure instead of a fabricated finding", async () => {
    const provider: OpenAireProvider = {
      analyzeTopic: async () => {
        throw new OpenAireError("OpenAIRE could not be reached.", "OPENAIRE_UNAVAILABLE");
      },
    };

    await expect(
      analyzeTopic({ topic: "AI Agent Governance" }, { provider, now: FIXED_NOW }),
    ).rejects.toMatchObject({
      name: "AnalysisError",
      code: "OPENAIRE_UNAVAILABLE",
      message: "OpenAIRE could not be reached for this analysis.",
    });
  });

  it("wraps an unexpected provider failure as an explicit analysis error", async () => {
    const provider: OpenAireProvider = {
      analyzeTopic: async () => {
        throw new Error("network down");
      },
    };

    await expect(
      analyzeTopic({ topic: "AI Agent Governance" }, { provider, now: FIXED_NOW }),
    ).rejects.toBeInstanceOf(AnalysisError);
    await expect(
      analyzeTopic({ topic: "AI Agent Governance" }, { provider, now: FIXED_NOW }),
    ).rejects.toMatchObject({ code: "OPENAIRE_UNAVAILABLE" });
  });

  it("maps a provider timeout to an explicit timeout error", async () => {
    const provider: OpenAireProvider = {
      analyzeTopic: async () => {
        throw new OpenAireError("OpenAIRE request timed out.", "OPENAIRE_TIMEOUT");
      },
    };

    await expect(
      analyzeTopic({ topic: "AI Agent Governance" }, { provider, now: FIXED_NOW }),
    ).rejects.toMatchObject({ code: "OPENAIRE_TIMEOUT" });
  });

  it("includes a baseline when a baselineTopic is provided", async () => {
    const result = await analyzeTopic(
      { topic: "AI Agent Governance", baselineTopic: "LLM Safety" },
      { provider: makeProvider(makeSnapshot()), now: FIXED_NOW },
    );

    expect(result.baseline).toEqual({
      topic: "LLM Safety",
      metrics: {
        publications: 1250,
        projects: 12,
        software: 126,
        datasets: 355,
      },
    });
  });

  it("derives a truthful sparse evidence finding for tiny publication counts", async () => {
    const result = await analyzeTopic(
      { topic: "Niche Topic" },
      {
        provider: makeProvider(
          makeSnapshot({
            counts: {
              publications: 3,
              projects: 0,
              software: 0,
              datasets: 0,
            },
            yearBuckets: [
              { year: 2022, publications: 1 },
              { year: 2023, publications: 1 },
              { year: 2024, publications: 1 },
              { year: 2025, publications: 1 },
            ],
          }),
        ),
        now: FIXED_NOW,
      },
    );

    expect(result.trend).toBe("insufficient_data");
    expect(result.finding.type).toBe("sparse_evidence");
  });

  it("derives a translation gap when reusable outputs are sparse", async () => {
    const result = await analyzeTopic(
      { topic: "AI Agent Governance" },
      {
        provider: makeProvider(
          makeSnapshot({
            counts: {
              publications: 100,
              projects: 10,
              software: 5,
              datasets: 1,
            },
          }),
        ),
        now: FIXED_NOW,
      },
    );

    expect(result.finding.type).toBe("translation_gap");
    expect(result.finding.reasons.length).toBeGreaterThan(0);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/analyze/route";
import type { MetricCounts } from "@/lib/domain";
import {
  createOpenAireProvider,
  OpenAireError,
  type OpenAireProvider,
  type OpenAireSnapshot,
} from "@/lib/openaire";
import fixtureJson from "./fixtures/openaire-topic.json";

vi.mock("@/lib/openaire", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/openaire")>();
  return {
    ...actual,
    createOpenAireProvider: vi.fn(),
  };
});

const fixture = fixtureJson as unknown as OpenAireSnapshot;
const providerFactory = () => vi.mocked(createOpenAireProvider);

function jsonRequest(body: unknown): NextRequest {
  return {
    method: "POST",
    nextUrl: { searchParams: new URLSearchParams() },
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
  } as unknown as NextRequest;
}

function getRequest(searchParams: Record<string, string>): NextRequest {
  return {
    method: "GET",
    nextUrl: { searchParams: new URLSearchParams(searchParams) },
    headers: new Headers(),
  } as unknown as NextRequest;
}

function successProvider(snapshot: OpenAireSnapshot): OpenAireProvider {
  return { analyzeTopic: async () => snapshot };
}

function failingProvider(err: unknown): OpenAireProvider {
  return {
    analyzeTopic: async () => {
      throw err;
    },
  };
}

function snapshot(counts: MetricCounts): OpenAireSnapshot {
  return {
    counts,
    yearBuckets: [
      { year: 2022, publications: 2 },
      { year: 2023, publications: 3 },
      { year: 2024, publications: 4 },
      { year: 2025, publications: 6 },
    ],
    evidence: [],
  };
}

beforeEach(() => {
  providerFactory().mockReset();
});

describe("analysis route orchestration", () => {
  it("returns a shape-complete 200 result from a successful provider", async () => {
    providerFactory().mockReturnValue(successProvider(fixture));

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.topic).toBe("AI Agent Governance");
    expect(body.metrics).toEqual({
      publications: 15,
      projects: 2,
      software: 4,
      datasets: 6,
    });
    expect(body.finding.type).toBe("no_strong_gap");
    expect(body.methodologyVersion).toBe("mvp-1");
    expect(typeof body.retrievedAt).toBe("string");
    expect(body.evidence.length).toBeGreaterThan(0);
    expect(body.evidence.every((item: { isFixture?: boolean }) => item.isFixture !== true)).toBe(true);
  });

  it("supports GET with a topic query parameter", async () => {
    providerFactory().mockReturnValue(successProvider(fixture));

    const res = await GET(getRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.topic).toBe("AI Agent Governance");
  });

  it("passes a baselineTopic through to the provider and the result", async () => {
    const baselineSnapshot: OpenAireSnapshot = {
      ...fixture,
      counts: { publications: 40, projects: 5, software: 10, datasets: 8 },
    };
    const analyze = vi.fn(async (topic: string) =>
      topic === "AI Agent Governance" ? fixture : baselineSnapshot,
    );
    providerFactory().mockReturnValue({ analyzeTopic: analyze });

    const res = await POST(
      jsonRequest({ topic: "AI Agent Governance", baselineTopic: "LLM Safety" }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.baseline).toEqual({
      topic: "LLM Safety",
      metrics: { publications: 40, projects: 5, software: 10, datasets: 8 },
    });
    expect(analyze).toHaveBeenCalledTimes(2);
  });

  it("rejects a blank topic with 400 INVALID_TOPIC without touching the provider", async () => {
    const res = await POST(jsonRequest({ topic: "   " }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_TOPIC", message: "Enter a research topic." },
    });
  });
});

describe("analysis route error semantics", () => {
  it("maps an explicit provider failure to 502 without fabricating a result", async () => {
    providerFactory().mockReturnValue(
      failingProvider(
        new OpenAireError("OpenAIRE could not be reached.", "OPENAIRE_UNAVAILABLE"),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: {
        code: "OPENAIRE_UNAVAILABLE",
        message: "OpenAIRE could not be reached for this analysis.",
      },
    });
  });

  it("maps a provider timeout to 502 OPENAIRE_TIMEOUT", async () => {
    providerFactory().mockReturnValue(
      failingProvider(
        new OpenAireError("OpenAIRE request timed out.", "OPENAIRE_TIMEOUT"),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe("OPENAIRE_TIMEOUT");
  });

  it("wraps an unexpected provider failure as 502 OPENAIRE_UNAVAILABLE", async () => {
    providerFactory().mockReturnValue(failingProvider(new Error("network down")));

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe("OPENAIRE_UNAVAILABLE");
  });
});

describe("missing or failed metrics do not create a gap", () => {
  it("reports no strong gap when reusable outputs and projects are missing", async () => {
    providerFactory().mockReturnValue(
      successProvider(
        snapshot({ publications: 15, projects: 0, software: 0, datasets: 0 }),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect(res.status).toBe(200);
    expect((await res.json()).finding.type).toBe("no_strong_gap");
  });

  it("flags sparse evidence below the sparse threshold instead of a gap", async () => {
    providerFactory().mockReturnValue(
      successProvider(
        snapshot({ publications: 9, projects: 0, software: 0, datasets: 0 }),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect((await res.json()).finding.type).toBe("sparse_evidence");
  });

  it("does not create a gap at exactly the sparse threshold", async () => {
    providerFactory().mockReturnValue(
      successProvider(
        snapshot({ publications: 10, projects: 0, software: 0, datasets: 0 }),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect((await res.json()).finding.type).toBe("no_strong_gap");
  });

  it("triggers a translation gap at the strong-evidence boundary", async () => {
    providerFactory().mockReturnValue(
      successProvider(
        snapshot({ publications: 20, projects: 0, software: 2, datasets: 0 }),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    const body = await res.json();
    expect(body.finding.type).toBe("translation_gap");
    expect(body.finding.reasons.length).toBeGreaterThan(0);
  });

  it("triggers a project gap only when the translation rule does not match first", async () => {
    providerFactory().mockReturnValue(
      successProvider(
        snapshot({ publications: 20, projects: 2, software: 30, datasets: 20 }),
      ),
    );

    const res = await POST(jsonRequest({ topic: "AI Agent Governance" }));

    expect((await res.json()).finding.type).toBe("project_gap");
  });
});

describe("demo-fixture labeling", () => {
  it("marks every evidence item in the fixture as illustrative demo data", () => {
    expect(fixture.evidence.length).toBeGreaterThan(0);
    for (const item of fixture.evidence) {
      expect(item.isFixture).toBe(true);
      expect(item.id.startsWith("fixture-")).toBe(true);
      expect(item.title).toContain("Illustrative");
      expect(item.url?.startsWith("https://example.invalid/")).toBe(true);
    }
  });
});

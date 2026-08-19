import { describe, expect, it, vi } from "vitest";
import {
  createOpenAireProvider,
  EVIDENCE_PAGE_SIZE,
  normalizeTopic,
  OpenAireError,
  type OpenAireProvider,
} from "./openaire";

const BASE_URL = "https://api.openaire.eu";

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

function errorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

type ProductFixture = {
  numFound: number;
  result?: Record<string, unknown>;
};

function makeFetch(opts: {
  products?: Partial<Record<"publication" | "software" | "dataset", ProductFixture>>;
  projectsNumFound?: number;
  yearCounts?: Record<string, number>;
}) {
  const calls: string[] = [];
  const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    calls.push(url);
    const parsed = new URL(url);
    const type = parsed.searchParams.get("type");
    const year = parsed.searchParams.get("publicationYear");

    if (parsed.pathname.endsWith("/projects")) {
      return jsonResponse({
        header: { numFound: opts.projectsNumFound ?? 0, page: 1, pageSize: 3 },
        results: opts.projectsNumFound
          ? [
              {
                id: "ukri________::proj1",
                code: "2928012",
                acronym: "TAG",
                title: "Topics in Technical AI Governance",
                websiteUrl: "https://example.org/tag",
                startDate: "2024-09-30",
              },
            ]
          : [],
      });
    }

    if (year) {
      const count = opts.yearCounts?.[year] ?? 0;
      return jsonResponse({
        header: { numFound: count, page: 1, pageSize: 1 },
        results: [],
      });
    }

    const fixture = opts.products?.[type as keyof typeof opts.products] ?? {
      numFound: 0,
    };
    const baseResult =
      fixture.result ??
      (type === "software"
        ? { id: `sw::${type}`, mainTitle: "gov-software", type: "software", codeRepositoryUrl: "https://github.com/example/tool" }
        : type === "dataset"
          ? { id: `ds::${type}`, mainTitle: "gov-dataset", type: "dataset", pids: [{ scheme: "doi", value: "10.1/x" }] }
          : {
              id: `pub::${type}`,
              mainTitle: "AI governance: a review",
              type: "publication",
              publicationDate: "2024-06-13",
              pids: [{ scheme: "doi", value: "10.1007/s00146-024-01961-9" }],
            });
    return jsonResponse({
      header: {
        numFound: fixture.numFound,
        page: 1,
        pageSize: 3,
      },
      results: fixture.numFound > 0 ? [baseResult] : [],
    });
  };
  return { fetchImpl, calls };
}

function makeProvider(fetchImpl: typeof fetch): OpenAireProvider {
  return createOpenAireProvider({
    baseUrl: BASE_URL,
    timeoutMs: 10_000,
    now: () => new Date("2026-08-19T12:00:00.000Z"),
    fetchImpl,
  });
}

describe("normalizeTopic", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeTopic("  AI governance  ")).toBe("AI governance");
  });

  it("rejects a blank topic", () => {
    expect(() => normalizeTopic("   ")).toThrowError(OpenAireError);
    expect(() => normalizeTopic("")).toThrowError(/Enter a research topic/);
  });

  it("caps over-long topics at MAX_TOPIC_LENGTH", () => {
    const long = "x".repeat(500);
    expect(normalizeTopic(long)).toHaveLength(200);
  });
});

describe("RestOpenAireProvider", () => {
  it("returns counts, year buckets and evidence from V3 responses", async () => {
    const { fetchImpl, calls } = makeFetch({
      products: {
        publication: { numFound: 1250, result: { id: "pub1", mainTitle: "AI governance: a review", type: "publication", publicationDate: "2024-06-13", pids: [{ scheme: "doi", value: "10.1007/s00146-024-01961-9" }] } },
        software: { numFound: 126 },
        dataset: { numFound: 355 },
      },
      projectsNumFound: 12,
      yearCounts: { "2025": 100, "2024": 90, "2023": 80, "2022": 70 },
    });
    const provider = makeProvider(fetchImpl);

    const snapshot = await provider.analyzeTopic("AI governance");

    expect(snapshot.counts).toEqual({
      publications: 1250,
      software: 126,
      datasets: 355,
      projects: 12,
    });

    expect(snapshot.yearBuckets).toEqual([
      { year: 2022, publications: 70 },
      { year: 2023, publications: 80 },
      { year: 2024, publications: 90 },
      { year: 2025, publications: 100 },
    ]);

    const publication = snapshot.evidence.find((e) => e.type === "publication");
    expect(publication).toMatchObject({
      id: "pub1",
      title: "AI governance: a review",
      year: 2024,
      url: "https://doi.org/10.1007/s00146-024-01961-9",
    });
    const software = snapshot.evidence.find((e) => e.type === "software");
    expect(software?.url).toBe("https://github.com/example/tool");
    const dataset = snapshot.evidence.find((e) => e.type === "dataset");
    expect(dataset?.url).toBe("https://doi.org/10.1/x");
    const project = snapshot.evidence.find((e) => e.type === "project");
    expect(project).toMatchObject({
      title: "TAG: Topics in Technical AI Governance",
      year: 2024,
      url: "https://example.org/tag",
    });

    expect(calls).toHaveLength(8);
    expect(calls.every((call) => call.includes("page=1"))).toBe(true);
    expect(calls.filter((call) => call.includes("publicationYear")).length).toBe(4);
    expect(
      calls
        .filter((call) => !call.includes("publicationYear"))
        .every((call) => call.includes(`pageSize=${EVIDENCE_PAGE_SIZE}`)),
    ).toBe(true);
    expect(
      calls
        .filter((call) => call.includes("publicationYear"))
        .every((call) => call.includes("pageSize=1")),
    ).toBe(true);
    expect(calls.some((call) => call.includes("type=publication") && call.includes("publicationYear=2025"))).toBe(true);
    expect(calls.some((call) => call.includes("publicationYear=2026"))).toBe(false);
  });

  it("does not treat the partial current year as a complete year", async () => {
    const { fetchImpl, calls } = makeFetch({ yearCounts: { "2025": 1, "2024": 1, "2023": 1, "2022": 1 } });
    const provider = makeProvider(fetchImpl);
    const snapshot = await provider.analyzeTopic("AI governance");
    expect(snapshot.yearBuckets.map((b) => b.year)).toEqual([2022, 2023, 2024, 2025]);
    expect(calls.some((call) => call.includes("publicationYear=2026"))).toBe(false);
  });

  it("throws an explicit provider error instead of zeroing metrics", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const provider = makeProvider(fetchImpl as unknown as typeof fetch);
    await expect(provider.analyzeTopic("AI governance")).rejects.toThrowError(
      OpenAireError,
    );
    await expect(provider.analyzeTopic("AI governance")).rejects.toMatchObject({
      code: "OPENAIRE_UNAVAILABLE",
    });
  });

  it("throws on a non-OK provider response", async () => {
    const fetchImpl = async () => errorResponse(503);
    const provider = makeProvider(fetchImpl);
    await expect(provider.analyzeTopic("AI governance")).rejects.toMatchObject({
      code: "OPENAIRE_UNAVAILABLE",
    });
  });

  it("throws an explicit timeout error with a finite timeout", async () => {
    const fetchImpl = (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    const provider = createOpenAireProvider({
      baseUrl: BASE_URL,
      timeoutMs: 5,
      now: () => new Date("2026-08-19T12:00:00.000Z"),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(provider.analyzeTopic("AI governance")).rejects.toMatchObject({
      code: "OPENAIRE_TIMEOUT",
    });
  });

  it("throws when the response has no valid numFound", async () => {
    const fetchImpl = async () =>
      jsonResponse({ header: {}, results: [] });
    const provider = makeProvider(fetchImpl);
    await expect(provider.analyzeTopic("AI governance")).rejects.toMatchObject({
      code: "OPENAIRE_INVALID_RESPONSE",
    });
  });

  it("maps results with missing optional fields to safe fallbacks", async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      const parsed = new URL(url);
      if (parsed.pathname.endsWith("/projects")) {
        return jsonResponse({
          header: { numFound: 1, page: 1, pageSize: 3 },
          results: [
            {
              id: null,
              title: null,
              acronym: null,
              startDate: null,
              websiteUrl: null,
            },
          ],
        });
      }
      if (parsed.searchParams.get("publicationYear")) {
        return jsonResponse({
          header: { numFound: 0, page: 1, pageSize: 1 },
          results: [],
        });
      }
      return jsonResponse({
        header: { numFound: 1, page: 1, pageSize: 3 },
        results: [
          {
            id: null,
            mainTitle: null,
            type: null,
            publicationDate: null,
            pids: null,
            instances: null,
          },
        ],
      });
    };
    const provider = makeProvider(fetchImpl);
    const snapshot = await provider.analyzeTopic("AI governance");

    expect(snapshot.counts).toEqual({
      publications: 1,
      software: 1,
      datasets: 1,
      projects: 1,
    });
    for (const item of snapshot.evidence) {
      expect(item.title).toBeTruthy();
      expect(item.id).toBe("unknown");
    }
    const publication = snapshot.evidence.find((e) => e.type === "publication");
    expect(publication?.year).toBeUndefined();
    expect(publication?.url).toBeUndefined();
    const project = snapshot.evidence.find((e) => e.type === "project");
    expect(project?.title).toBe("Untitled project");
    expect(project?.year).toBeUndefined();
    expect(project?.url).toBeUndefined();
  });

  it("decodes HTML entities in evidence titles", async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("publicationYear")) {
        return jsonResponse({
          header: { numFound: 0, page: 1, pageSize: 1 },
          results: [],
        });
      }
      if (url.includes("/projects")) {
        return jsonResponse({
          header: { numFound: 1, page: 1, pageSize: 3 },
          results: [
            {
              id: "proj1",
              title: "Adaptation &amp; Resilience Framework",
              acronym: "ARF",
              startDate: "2024-01-01",
              websiteUrl: null,
            },
          ],
        });
      }
      return jsonResponse({
        header: { numFound: 1, page: 1, pageSize: 3 },
        results: [
          {
            id: "pub1",
            mainTitle: "Loss &amp; Damage in Climate &lt;Adaptation&gt;",
            type: "publication",
            publicationDate: "2024-06-13",
          },
        ],
      });
    };
    const provider = makeProvider(fetchImpl);
    const snapshot = await provider.analyzeTopic("Climate Adaptation");
    const publication = snapshot.evidence.find((e) => e.type === "publication");
    expect(publication?.title).toBe("Loss & Damage in Climate <Adaptation>");
    const project = snapshot.evidence.find((e) => e.type === "project");
    expect(project?.title).toBe("ARF: Adaptation & Resilience Framework");
  });

  it("fails the whole analysis when a single metric query fails", async () => {
    const base = makeFetch({ products: { publication: { numFound: 5 } } });
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("type=dataset")) {
        throw new Error("boom");
      }
      return base.fetchImpl(input);
    };
    const provider = makeProvider(fetchImpl);
    await expect(provider.analyzeTopic("AI governance")).rejects.toThrowError(
      OpenAireError,
    );
  });
});

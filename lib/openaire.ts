import type {
  EvidenceItem,
  EvidenceType,
  MetricCounts,
  YearBucket,
} from "./domain";

export const DEFAULT_OPENAIRE_BASE_URL = "https://api.openaire.eu";
export const DEFAULT_OPENAIRE_TIMEOUT_MS = 15_000;
export const MAX_TOPIC_LENGTH = 200;
export const EVIDENCE_PAGE_SIZE = 3;

export type OpenAireConfig = {
  baseUrl?: string;
  apiToken?: string;
  timeoutMs?: number;
  now?: () => Date;
  fetchImpl?: typeof fetch;
};

export type OpenAireSnapshot = {
  counts: MetricCounts;
  yearBuckets: YearBucket[];
  evidence: EvidenceItem[];
};

export interface OpenAireProvider {
  analyzeTopic(topic: string): Promise<OpenAireSnapshot>;
}

export class OpenAireError extends Error {
  constructor(
    message: string,
    readonly code: string = "OPENAIRE_UNAVAILABLE",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "OpenAireError";
  }
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&([a-z]+|#\d+|#x[0-9a-f]+);/gi, (match, entity) => {
    if (entity.startsWith("#x")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return HTML_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

type ResearchProductKind = "publication" | "software" | "dataset";

type ResearchProductResult = {
  id?: string | null;
  mainTitle?: string | null;
  type?: string | null;
  publicationDate?: string | null;
  codeRepositoryUrl?: string | null;
  pids?: { scheme?: string; value?: string }[] | null;
  instances?: { urls?: string[] }[] | null;
};

type ProjectResult = {
  id?: string | null;
  title?: string | null;
  acronym?: string | null;
  startDate?: string | null;
  websiteUrl?: string | null;
};

export function normalizeTopic(topic: string): string {
  const trimmed = (topic ?? "").trim();
  if (!trimmed) {
    throw new OpenAireError("Enter a research topic.", "INVALID_TOPIC");
  }
  return trimmed.slice(0, MAX_TOPIC_LENGTH);
}

export class RestOpenAireProvider implements OpenAireProvider {
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly timeoutMs: number;
  private readonly now: () => Date;
  private readonly fetchImpl: typeof fetch;

  constructor(config: OpenAireConfig = {}) {
    const envBaseUrl = process.env.OPENAIRE_BASE_URL;
    this.baseUrl = (
      config.baseUrl ?? envBaseUrl ?? DEFAULT_OPENAIRE_BASE_URL
    ).replace(/\/+$/, "");
    const envToken = process.env.OPENAIRE_API_TOKEN;
    this.apiToken = config.apiToken ?? (envToken || undefined);
    const envTimeout = Number(process.env.OPENAIRE_TIMEOUT_MS);
    this.timeoutMs =
      config.timeoutMs ??
      (Number.isFinite(envTimeout) && envTimeout > 0
        ? envTimeout
        : DEFAULT_OPENAIRE_TIMEOUT_MS);
    this.now = config.now ?? (() => new Date());
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch;
  }

  async analyzeTopic(topic: string): Promise<OpenAireSnapshot> {
    const normalized = normalizeTopic(topic);

    const [publications, software, datasets, projects] = await Promise.all([
      this.fetchResearchProducts(normalized, "publication"),
      this.fetchResearchProducts(normalized, "software"),
      this.fetchResearchProducts(normalized, "dataset"),
      this.fetchProjects(normalized),
    ]);

    const { recent, previous } = this.completeYearWindows(this.now());
    const yearResults = await Promise.all(
      [...recent, ...previous].map(async (year) => ({
        year,
        publications: await this.fetchYearCount(normalized, year),
      })),
    );
    const yearBuckets = yearResults.sort((a, b) => a.year - b.year);

    return {
      counts: {
        publications: publications.count,
        software: software.count,
        datasets: datasets.count,
        projects: projects.count,
      },
      yearBuckets,
      evidence: [
        ...publications.evidence,
        ...software.evidence,
        ...datasets.evidence,
        ...projects.evidence,
      ],
    };
  }

  private async fetchResearchProducts(
    topic: string,
    kind: ResearchProductKind,
  ): Promise<{ count: number; evidence: EvidenceItem[] }> {
    const params = new URLSearchParams({
      search: topic,
      type: kind,
      page: "1",
      pageSize: String(EVIDENCE_PAGE_SIZE),
    });
    const { count, results } =
      await this.fetchCounts<ResearchProductResult>(
        "/graph/v3/research-products",
        params,
      );
    const evidence = results
      .slice(0, EVIDENCE_PAGE_SIZE)
      .map((result) => this.toResearchProductEvidence(result, kind));
    return { count, evidence };
  }

  private async fetchProjects(
    topic: string,
  ): Promise<{ count: number; evidence: EvidenceItem[] }> {
    const params = new URLSearchParams({
      search: topic,
      page: "1",
      pageSize: String(EVIDENCE_PAGE_SIZE),
    });
    const { count, results } = await this.fetchCounts<ProjectResult>(
      "/graph/v3/projects",
      params,
    );
    const evidence = results
      .slice(0, EVIDENCE_PAGE_SIZE)
      .map((result) => this.toProjectEvidence(result));
    return { count, evidence };
  }

  private async fetchYearCount(topic: string, year: number): Promise<number> {
    const params = new URLSearchParams({
      search: topic,
      type: "publication",
      publicationYear: String(year),
      page: "1",
      pageSize: "1",
    });
    const { count } = await this.fetchCounts<ResearchProductResult>(
      "/graph/v3/research-products",
      params,
    );
    return count;
  }

  private completeYearWindows(now: Date): {
    recent: number[];
    previous: number[];
  } {
    const currentYear = now.getFullYear();
    return {
      recent: [currentYear - 1, currentYear - 2],
      previous: [currentYear - 3, currentYear - 4],
    };
  }

  private async fetchCounts<T>(
    path: string,
    params: URLSearchParams,
  ): Promise<{ count: number; results: T[] }> {
    const json = await this.queryJson<{ header?: { numFound?: number | null } }>(
      path,
      params,
    );
    const numFound = json.header?.numFound;
    if (typeof numFound !== "number" || !Number.isFinite(numFound) || numFound < 0) {
      throw new OpenAireError(
        "OpenAIRE response did not include a valid result count.",
        "OPENAIRE_INVALID_RESPONSE",
      );
    }
    const results = (json as { results?: T[] }).results ?? [];
    return { count: numFound, results };
  }

  private async queryJson<T>(path: string, params: URLSearchParams): Promise<T> {
    const qs = params.toString();
    const url = `${this.baseUrl}${path}${qs ? `?${qs}` : ""}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(this.apiToken
            ? { Authorization: `Bearer ${this.apiToken}` }
            : {}),
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (controller.signal.aborted) {
        throw new OpenAireError(
          `OpenAIRE request timed out after ${this.timeoutMs}ms.`,
          "OPENAIRE_TIMEOUT",
        );
      }
      throw new OpenAireError(
        "OpenAIRE could not be reached.",
        "OPENAIRE_UNAVAILABLE",
        err,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new OpenAireError(
        `OpenAIRE responded with HTTP ${res.status}.`,
        "OPENAIRE_UNAVAILABLE",
      );
    }

    try {
      return (await res.json()) as T;
    } catch (err) {
      throw new OpenAireError(
        "OpenAIRE returned an invalid response.",
        "OPENAIRE_INVALID_RESPONSE",
        err,
      );
    }
  }

  private toResearchProductEvidence(
    result: ResearchProductResult,
    kind: ResearchProductKind,
  ): EvidenceItem {
    const item: EvidenceItem = {
      id: result.id ?? "unknown",
      type: kind as EvidenceType,
      title: decodeHtmlEntities(result.mainTitle ?? "Untitled"),
      source: "openaire",
    };
    const year = parseYear(result.publicationDate);
    if (year !== undefined) item.year = year;
    const url = this.researchProductUrl(result);
    if (url) item.url = url;
    return item;
  }

  private toProjectEvidence(result: ProjectResult): EvidenceItem {
    const hasAcronym = typeof result.acronym === "string" && result.acronym !== "";
    const title = result.title ?? result.acronym ?? "Untitled project";
    const item: EvidenceItem = {
      id: result.id ?? "unknown",
      type: "project",
      title: decodeHtmlEntities(
        hasAcronym && result.title ? `${result.acronym}: ${title}` : title,
      ),
      source: "openaire",
    };
    const year = parseYear(result.startDate);
    if (year !== undefined) item.year = year;
    if (typeof result.websiteUrl === "string" && result.websiteUrl) {
      item.url = result.websiteUrl;
    }
    return item;
  }

  private researchProductUrl(result: ResearchProductResult): string | undefined {
    if (result.type === "software" && result.codeRepositoryUrl) {
      return result.codeRepositoryUrl;
    }
    const instanceUrls = (result.instances ?? [])
      .flatMap((instance) => instance.urls ?? [])
      .filter((url) => typeof url === "string" && url !== "");
    if (instanceUrls.length > 0) {
      return instanceUrls[0];
    }
    const doi = (result.pids ?? []).find((pid) => pid.scheme === "doi")?.value;
    return doi ? `https://doi.org/${doi}` : undefined;
  }
}

export function createOpenAireProvider(config?: OpenAireConfig): OpenAireProvider {
  return new RestOpenAireProvider(config);
}

function parseYear(dateString?: string | null): number | undefined {
  if (!dateString) return undefined;
  const year = Number.parseInt(dateString.slice(0, 4), 10);
  return Number.isInteger(year) && year >= 1000 && year <= 2999 ? year : undefined;
}

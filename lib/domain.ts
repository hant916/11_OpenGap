import { GAP_KIND_TITLES } from "./result-semantics";
import type { GapFinding, GapKind } from "./result-semantics";

export type TopicAnalysisRequest = {
  topic: string;
  baselineTopic?: string;
};

export type MetricCounts = {
  publications: number;
  projects: number;
  software: number;
  datasets: number;
};

export type YearBucket = {
  year: number;
  publications: number;
};

export type EvidenceType = "publication" | "project" | "software" | "dataset";

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  title: string;
  year?: number;
  url?: string;
  source: "openaire";
  isFixture?: boolean;
};

export type EvidenceProvenance = {
  topic: string;
  source: EvidenceItem["source"];
  collectedAt: string;
};

export const SOURCE_LABELS: Record<EvidenceItem["source"], string> = {
  openaire: "OpenAIRE",
};

export type GapType = GapKind;
export type { GapFinding };

export type Trend = "growing" | "stable" | "declining" | "insufficient_data";

export type AnalysisResult = {
  topic: string;
  metrics: MetricCounts;
  trend: Trend;
  finding: GapFinding;
  evidence: EvidenceItem[];
  baseline?: {
    topic: string;
    metrics: MetricCounts;
  };
  methodologyVersion: "mvp-1";
  retrievedAt: string;
  provenance: EvidenceProvenance;
};

export const GAP_TYPE_LABELS: Record<GapType, string> = GAP_KIND_TITLES;

export const TREND_LABELS: Record<Trend, string> = {
  growing: "Growing",
  stable: "Stable",
  declining: "Declining",
  insufficient_data: "Insufficient data",
};

const SAFE_URL_PROTOCOL = /^https?:\/\//i;

export function safeEvidenceUrl(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (!SAFE_URL_PROTOCOL.test(trimmed)) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

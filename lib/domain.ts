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

export const SOURCE_LABELS: Record<EvidenceItem["source"], string> = {
  openaire: "OpenAIRE",
};

export type GapType =
  | "translation_gap"
  | "project_gap"
  | "sparse_evidence"
  | "no_strong_gap";

export type GapFinding = {
  type: GapType;
  title: string;
  summary: string;
  reasons: string[];
};

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
};

export const GAP_TYPE_LABELS: Record<GapType, string> = {
  translation_gap: "Potential translation gap",
  project_gap: "Potential project gap",
  sparse_evidence: "Sparse evidence — no reliable gap",
  no_strong_gap: "No strong gap detected",
};

export const TREND_LABELS: Record<Trend, string> = {
  growing: "Growing",
  stable: "Stable",
  declining: "Declining",
  insufficient_data: "Insufficient data",
};

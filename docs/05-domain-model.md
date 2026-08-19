# Domain Model

The MVP deliberately avoids a generic graph/domain model.

## TopicAnalysisRequest

```ts
type TopicAnalysisRequest = {
  topic: string;
  baselineTopic?: string;
};
```

## MetricCounts

```ts
type MetricCounts = {
  publications: number;
  projects: number;
  software: number;
  datasets: number;
};
```

## YearBucket

```ts
type YearBucket = {
  year: number;
  publications: number;
};
```

## EvidenceItem

```ts
type EvidenceType = "publication" | "project" | "software" | "dataset";

type EvidenceItem = {
  id: string;
  type: EvidenceType;
  title: string;
  year?: number;
  url?: string;
  source: "openaire";
};
```

## GapFinding

```ts
type GapType =
  | "translation_gap"
  | "project_gap"
  | "sparse_evidence"
  | "no_strong_gap";

type GapFinding = {
  type: GapType;
  title: string;
  summary: string;
  reasons: string[]; // max 3
};
```

## Trend

```ts
type Trend = "growing" | "stable" | "declining" | "insufficient_data";
```

## AnalysisResult

```ts
type AnalysisResult = {
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
```

## Invariants

- Counts are non-negative integers.
- `reasons.length <= 3`.
- Evidence items are real provider results or explicit demo fixtures.
- `source` is always visible in the data model.
- A failed provider call must not silently become count `0`.
- Unknown/missing data is not equivalent to zero.
- A finding is a *potential gap*, not a recommendation.

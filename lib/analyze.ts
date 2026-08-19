import type {
  AnalysisResult,
  MetricCounts,
  TopicAnalysisRequest,
} from "./domain";
import {
  normalizeTopic,
  OpenAireError,
  type OpenAireProvider,
  type OpenAireSnapshot,
} from "./openaire";
import { deriveFinding } from "./gap-rules";
import { deriveTrend } from "./trend";

export {
  SPARSE_EVIDENCE_THRESHOLD,
  STRONG_EVIDENCE_THRESHOLD,
} from "./gap-rules";
export { TREND_DECLINE_FACTOR, TREND_GROWTH_FACTOR, TREND_MIN_PREVIOUS } from "./trend";

export type AnalyzeDeps = {
  provider: OpenAireProvider;
  now?: () => Date;
};

export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export async function analyzeTopic(
  request: TopicAnalysisRequest,
  deps: AnalyzeDeps,
): Promise<AnalysisResult> {
  const now = deps.now ?? (() => new Date());
  const topic = validateTopic(request.topic);

  const snapshot = await callProvider(() => deps.provider.analyzeTopic(topic));

  let baseline: { topic: string; metrics: MetricCounts } | undefined;
  if (typeof request.baselineTopic === "string" && request.baselineTopic.trim() !== "") {
    const baselineTopic = validateTopic(request.baselineTopic);
    const baselineSnapshot = await callProvider(() =>
      deps.provider.analyzeTopic(baselineTopic),
    );
    baseline = {
      topic: baselineTopic,
      metrics: pickMetrics(baselineSnapshot.counts),
    };
  }

  return {
    topic,
    metrics: pickMetrics(snapshot.counts),
    trend: deriveTrend(snapshot.yearBuckets),
    finding: deriveFinding(snapshot.counts, baseline?.metrics),
    evidence: snapshot.evidence.map(pickEvidence),
    ...(baseline ? { baseline } : {}),
    methodologyVersion: "mvp-1",
    retrievedAt: now().toISOString(),
  };
}

function validateTopic(topic: string): string {
  try {
    return normalizeTopic(topic);
  } catch (err) {
    if (err instanceof OpenAireError && err.code === "INVALID_TOPIC") {
      throw new AnalysisError(err.message, "INVALID_TOPIC", err);
    }
    throw err;
  }
}

async function callProvider<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof OpenAireError) {
      throw new AnalysisError(
        "OpenAIRE could not be reached for this analysis.",
        err.code === "OPENAIRE_TIMEOUT" ? "OPENAIRE_TIMEOUT" : "OPENAIRE_UNAVAILABLE",
        err,
      );
    }
    throw new AnalysisError(
      "OpenAIRE could not be reached for this analysis.",
      "OPENAIRE_UNAVAILABLE",
      err,
    );
  }
}

function pickMetrics(counts: MetricCounts): MetricCounts {
  return {
    publications: counts.publications,
    projects: counts.projects,
    software: counts.software,
    datasets: counts.datasets,
  };
}

function pickEvidence(
  item: OpenAireSnapshot["evidence"][number],
): AnalysisResult["evidence"][number] {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    ...(item.year !== undefined ? { year: item.year } : {}),
    ...(item.url !== undefined ? { url: item.url } : {}),
    source: item.source,
  };
}



import type { MetricCounts } from "./domain";
import {
  RESEARCH_SIGNAL_THRESHOLDS,
  deriveResearchMetrics,
} from "./derived-metrics";
import {
  FUNDING_CAVEAT,
  GAP_KIND_TITLES,
  LOW_EVIDENCE_REASON,
  NO_STRONG_CLARIFICATION,
  REUSE_UNCERTAINTY,
  ZERO_PROJECT_SCAN_COPY,
  type GapFinding,
} from "./result-semantics";

export const SPARSE_EVIDENCE_THRESHOLD =
  RESEARCH_SIGNAL_THRESHOLDS.sparseEvidenceMinimumPublications;
export const STRONG_EVIDENCE_THRESHOLD =
  RESEARCH_SIGNAL_THRESHOLDS.strongEvidenceMinimumPublications;
export const REUSE_RATIO_MIN = RESEARCH_SIGNAL_THRESHOLDS.reuseRatioFloor;
export const PROJECT_RATIO_MIN = RESEARCH_SIGNAL_THRESHOLDS.projectRatioFloor;
export const MAX_REASONS = 3;

export function deriveFinding(
  counts: MetricCounts,
  baseline?: MetricCounts,
): GapFinding {
  const metrics = deriveResearchMetrics(counts);
  const { publications } = metrics;

  if (publications < SPARSE_EVIDENCE_THRESHOLD) {
    return {
      type: "no_strong_structural_gap",
      title: GAP_KIND_TITLES.no_strong_structural_gap,
      summary: "This scan found no strong structural imbalance in the measured signals.",
      reasons: [LOW_EVIDENCE_REASON, NO_STRONG_CLARIFICATION],
    };
  }

  const hasStrongEvidence = publications >= STRONG_EVIDENCE_THRESHOLD;

  if (hasStrongEvidence && metrics.projects <= metrics.projectRecordsFloor) {
    const reasons =
      metrics.projects === 0
        ? [ZERO_PROJECT_SCAN_COPY, FUNDING_CAVEAT]
        : [
            `${publications} publications were found versus ${metrics.projects} funded project records in this scan.`,
            `Project records represent about ${Math.round((metrics.projects / publications) * 100)}% of the publication count in this scan.`,
            FUNDING_CAVEAT,
          ];
    return {
      type: "potential_funding_gap",
      title: GAP_KIND_TITLES.potential_funding_gap,
      summary: "Publications outweigh directly matching funded project records in this scan.",
      reasons,
    };
  }

  if (hasStrongEvidence && metrics.reusableOutputs <= metrics.reuseOutputFloor) {
    const reasons = [
      `${publications} publications were found versus ${metrics.reusableOutputs} software/data outputs in this scan.`,
      `Reusable outputs represent about ${Math.round((metrics.reusableOutputs / publications) * 100)}% of the publication count in this scan.`,
    ];
    if (baseline && baseline.publications > 0) {
      const baseRatio =
        (baseline.software + baseline.datasets) / baseline.publications;
      const topicRatio = metrics.reusableOutputs / publications;
      if (baseRatio > 0 && topicRatio < baseRatio * 0.5) {
        reasons.push(
          "The software/data output ratio is less than half the selected baseline topic.",
        );
      }
    }
    return {
      type: "potential_reuse_gap",
      title: GAP_KIND_TITLES.potential_reuse_gap,
      summary: `Publications outweigh reusable software and data outputs in this scan. ${REUSE_UNCERTAINTY}`,
      reasons: reasons.slice(0, MAX_REASONS),
    };
  }

  return {
    type: "no_strong_structural_gap",
    title: GAP_KIND_TITLES.no_strong_structural_gap,
    summary: "This scan found no strong structural imbalance in the measured signals.",
    reasons: [NO_STRONG_CLARIFICATION],
  };
}

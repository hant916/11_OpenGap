import { GAP_TYPE_LABELS } from "./domain";
import type { GapFinding, MetricCounts } from "./domain";

export const SPARSE_EVIDENCE_THRESHOLD = 10;
export const STRONG_EVIDENCE_THRESHOLD = 20;
export const TRANSLATION_RATIO_MIN = 0.1;
export const PROJECT_RATIO_MIN = 0.15;
export const MAX_REASONS = 3;

export function deriveFinding(
  counts: MetricCounts,
  baseline?: MetricCounts,
): GapFinding {
  const { publications, projects, software, datasets } = counts;
  const reusableOutputs = software + datasets;

  if (publications < SPARSE_EVIDENCE_THRESHOLD) {
    return {
      type: "sparse_evidence",
      title: GAP_TYPE_LABELS.sparse_evidence,
      summary: "The available evidence is too limited for the MVP heuristic.",
      reasons: [
        `${publications} publication${publications === 1 ? "" : "s"} were found across the query.`,
      ],
    };
  }

  if (
    publications >= STRONG_EVIDENCE_THRESHOLD &&
    reusableOutputs <= Math.max(3, Math.round(publications * TRANSLATION_RATIO_MIN))
  ) {
    const reasons = [
      `${publications} publications were found versus ${reusableOutputs} software/data outputs.`,
      `Reusable outputs represent about ${Math.round((reusableOutputs / publications) * 100)}% of the publication count in this query.`,
    ];
    if (baseline && baseline.publications > 0) {
      const baseRatio =
        (baseline.software + baseline.datasets) / baseline.publications;
      const topicRatio = reusableOutputs / publications;
      if (baseRatio > 0 && topicRatio < baseRatio * 0.5) {
        reasons.push(
          "The translation ratio is less than half the selected baseline topic.",
        );
      }
    }
    return {
      type: "translation_gap",
      title: GAP_TYPE_LABELS.translation_gap,
      summary: "Research output is stronger than reusable technical output.",
      reasons: reasons.slice(0, MAX_REASONS),
    };
  }

  if (
    publications >= STRONG_EVIDENCE_THRESHOLD &&
    projects <= Math.max(3, Math.round(publications * PROJECT_RATIO_MIN))
  ) {
    return {
      type: "project_gap",
      title: GAP_TYPE_LABELS.project_gap,
      summary: "Research output is stronger than funded project activity.",
      reasons: [
        `${publications} publications were found versus ${projects} funded projects.`,
        `Projects represent about ${Math.round((projects / publications) * 100)}% of the publication count in this query.`,
      ],
    };
  }

  return {
    type: "no_strong_gap",
    title: GAP_TYPE_LABELS.no_strong_gap,
    summary: "No strong gap was detected by the MVP heuristic.",
    reasons: [],
  };
}

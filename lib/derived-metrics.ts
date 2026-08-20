import type { MetricCounts } from "./domain";

export const RESEARCH_SIGNAL_THRESHOLDS = {
  sparseEvidenceMinimumPublications: 10,
  strongEvidenceMinimumPublications: 20,
  minimumReusableOutputFloor: 3,
  minimumProjectRecordsFloor: 3,
  reuseRatioFloor: 0.1,
  projectRatioFloor: 0.15,
} as const;

export type ResearchMetrics = {
  publications: number;
  projects: number;
  software: number;
  datasets: number;
  reusableOutputs: number;
  reuseRatio: number | undefined;
  projectRatio: number | undefined;
  reuseOutputFloor: number;
  projectRecordsFloor: number;
};

export function deriveResearchMetrics(counts: MetricCounts): ResearchMetrics {
  const { publications, projects, software, datasets } = counts;
  const reusableOutputs = software + datasets;
  return {
    publications,
    projects,
    software,
    datasets,
    reusableOutputs,
    reuseRatio: publications > 0 ? reusableOutputs / publications : undefined,
    projectRatio: publications > 0 ? projects / publications : undefined,
    reuseOutputFloor: Math.max(
      RESEARCH_SIGNAL_THRESHOLDS.minimumReusableOutputFloor,
      Math.round(publications * RESEARCH_SIGNAL_THRESHOLDS.reuseRatioFloor),
    ),
    projectRecordsFloor: Math.max(
      RESEARCH_SIGNAL_THRESHOLDS.minimumProjectRecordsFloor,
      Math.round(publications * RESEARCH_SIGNAL_THRESHOLDS.projectRatioFloor),
    ),
  };
}

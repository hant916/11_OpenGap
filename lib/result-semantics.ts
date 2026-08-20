export const FROZEN_GAP_KINDS = [
  "potential_funding_gap",
  "potential_reuse_gap",
  "no_strong_structural_gap",
] as const;

export type GapKind = (typeof FROZEN_GAP_KINDS)[number];

export type GapFinding = {
  type: GapKind;
  title: string;
  summary: string;
  reasons: string[];
};

export const GAP_KIND_TITLES: Record<GapKind, string> = {
  potential_funding_gap: "Potential funding gap",
  potential_reuse_gap: "Potential reuse gap",
  no_strong_structural_gap: "No strong structural gap detected",
};

export const WHY_HEADING = "Why OpenGap flagged this";

export const EVIDENCE_MEASURED_FROM_COPY =
  "Measured from OpenAIRE records for this topic scan.";

export const ZERO_PROJECT_SCAN_COPY =
  "0 directly matching project records found in this scan.";

export const FUNDING_CAVEAT =
  "This could reflect an underfunded area, but it could also be a terminology mismatch between the topic and project records in this scan.";

export const REUSE_UNCERTAINTY =
  "Output patterns vary by field, so this imbalance is not proof of under-translation.";

export const NO_STRONG_CLARIFICATION =
  "This does not mean there are no open research questions.";

export const LOW_EVIDENCE_REASON =
  "This scan found too few records for the MVP heuristic to compare structural signals.";

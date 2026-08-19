export type RefinementKind = "narrower" | "adjacent";

export type Refinement = {
  kind: RefinementKind;
  facet: string;
  topic: string;
  note: string;
};

export const MIN_REFINEMENTS = 3;
export const MAX_REFINEMENTS = 5;

const NARROWER_FACETS = [
  "methods and frameworks",
  "evaluation and benchmarks",
  "applications and case studies",
];

const ADJACENT_FACETS = [
  "policy and regulation",
  "limitations and open challenges",
];

export function deriveRefinements(topic: string): Refinement[] {
  const base = topic.trim();
  if (!base) return [];

  const narrower: Refinement[] = NARROWER_FACETS.map((facet) => ({
    kind: "narrower",
    facet,
    topic: `${base}: ${facet}`,
    note: "A narrower facet of this topic to scan next.",
  }));

  const adjacent: Refinement[] = ADJACENT_FACETS.map((facet) => ({
    kind: "adjacent",
    facet,
    topic: `${base}: ${facet}`,
    note: "An adjacent facet of this topic to scan next.",
  }));

  return [...narrower, ...adjacent];
}

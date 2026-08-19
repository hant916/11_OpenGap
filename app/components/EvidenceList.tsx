"use client";

import type { EvidenceItem } from "@/lib/domain";
import { SOURCE_LABELS } from "@/lib/domain";

const EVIDENCE_TYPE_LABELS: Record<EvidenceItem["type"], string> = {
  publication: "Publication",
  project: "Project",
  software: "Software",
  dataset: "Dataset",
};

const DEFAULT_MAX_ITEMS = 6;

type EvidenceListProps = {
  items: EvidenceItem[];
  maxItems?: number;
};

export function EvidenceList({
  items,
  maxItems = DEFAULT_MAX_ITEMS,
}: EvidenceListProps) {
  if (items.length === 0) {
    return null;
  }

  const visible = items.slice(0, maxItems);
  const truncated = items.length > visible.length;

  return (
    <ul className="result-evidence">
      {visible.map((item) => (
        <li key={item.id} className="result-evidence-item">
          <span className="result-evidence-type">
            {EVIDENCE_TYPE_LABELS[item.type] ?? item.type}
          </span>
          <span className="result-evidence-title">{item.title}</span>
          {item.year !== undefined && (
            <span className="result-evidence-year">{item.year}</span>
          )}
          {item.isFixture === true && (
            <span className="result-evidence-fixture">Demo fixture data</span>
          )}
          <span className="result-evidence-source">
            {SOURCE_LABELS[item.source] ?? item.source}
          </span>
          {item.url ? (
            <a
              className="result-evidence-link"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              Open record
            </a>
          ) : (
            <span className="result-evidence-id">ID: {item.id}</span>
          )}
        </li>
      ))}
      {truncated && (
        <li className="result-evidence-item result-evidence-more">
          … and {items.length - visible.length} more from {SOURCE_LABELS.openaire}
        </li>
      )}
    </ul>
  );
}

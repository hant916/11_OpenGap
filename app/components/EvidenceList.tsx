"use client";

import type { EvidenceItem, MetricCounts } from "@/lib/domain";
import { safeEvidenceUrl, SOURCE_LABELS } from "@/lib/domain";
import { ZERO_PROJECT_SCAN_COPY } from "@/lib/result-semantics";

const EVIDENCE_TYPE_LABELS: Record<EvidenceItem["type"], string> = {
  publication: "Publication",
  project: "Project",
  software: "Software",
  dataset: "Dataset",
};

const METRIC_KEY: Record<EvidenceItem["type"], keyof MetricCounts> = {
  publication: "publications",
  project: "projects",
  software: "software",
  dataset: "datasets",
};

const GROUP_ORDER: EvidenceItem["type"][] = [
  "publication",
  "project",
  "software",
  "dataset",
];

const DEFAULT_MAX_ITEMS = 6;

type EvidenceListProps = {
  items: EvidenceItem[];
  maxItems?: number;
  projectsCount?: number;
  metrics?: MetricCounts;
};

export function EvidenceList({
  items,
  maxItems = DEFAULT_MAX_ITEMS,
  projectsCount,
  metrics,
}: EvidenceListProps) {
  if (items.length === 0 && projectsCount !== 0) {
    return null;
  }

  return (
    <ul className="result-evidence">
      {GROUP_ORDER.map((type) => {
        const groupItems = items.filter((item) => item.type === type);
        const showZeroProjects =
          type === "project" && projectsCount === 0 && groupItems.length === 0;

        if (groupItems.length === 0 && !showZeroProjects) {
          return null;
        }

        const visible = groupItems.slice(0, maxItems);
        const aggregateCount = metrics ? metrics[METRIC_KEY[type]] : undefined;
        const remaining =
          aggregateCount !== undefined
            ? Math.max(0, aggregateCount - visible.length)
            : Math.max(0, groupItems.length - visible.length);
        const showMore = remaining > 0;

        const safeVisible = visible.map((item) => ({
          ...item,
          url: safeEvidenceUrl(item.url),
        }));

        return (
          <li key={type} className="result-evidence-group">
            <h4 className="result-evidence-group-title">
              {EVIDENCE_TYPE_LABELS[type]}
              {aggregateCount !== undefined && (
                <span className="result-evidence-group-count">
                  {aggregateCount.toLocaleString()}
                </span>
              )}
            </h4>
            {groupItems.length === 0 ? (
              <p className="result-evidence-group-empty">
                {ZERO_PROJECT_SCAN_COPY}
              </p>
            ) : (
              <ul className="result-evidence">
                {safeVisible.map((item) => (
                  <li key={item.id} className="result-evidence-item">
                    <span className="result-evidence-title">{item.title}</span>
                    {item.year !== undefined && (
                      <span className="result-evidence-year">{item.year}</span>
                    )}
                    {item.isFixture === true && (
                      <span className="result-evidence-fixture">
                        Demo fixture data
                      </span>
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
                {showMore && (
                  <li className="result-evidence-item result-evidence-more">
                    … and {remaining.toLocaleString()} more{" "}
                    {EVIDENCE_TYPE_LABELS[type].toLowerCase()} records in{" "}
                    {SOURCE_LABELS.openaire}
                  </li>
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

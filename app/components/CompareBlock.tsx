"use client";

import type { MetricCounts } from "@/lib/domain";

const METRIC_LABELS = [
  { key: "publications", label: "Publications" },
  { key: "projects", label: "Projects" },
  { key: "software", label: "Software" },
  { key: "datasets", label: "Datasets" },
] as const;

type CompareBlockProps = {
  metrics: MetricCounts;
  baseline: { topic: string; metrics: MetricCounts };
};

function ratioLabel(topicValue: number, baselineValue: number): string {
  if (baselineValue <= 0) return "—";
  const ratio = topicValue / baselineValue;
  return `${ratio.toFixed(2)}×`;
}

export function CompareBlock({ metrics, baseline }: CompareBlockProps) {
  return (
    <section className="result-section">
      <h3 className="result-section-title">Compare with {baseline.topic}</h3>
      <ul className="result-compare">
        {METRIC_LABELS.map(({ key, label }) => (
          <li key={key} className="result-compare-row">
            <span className="result-compare-label">{label}</span>
            <span className="result-compare-value">{metrics[key]}</span>
            <span className="result-compare-value result-compare-base">
              {baseline.metrics[key]}
            </span>
            <span className="result-compare-ratio">
              {ratioLabel(metrics[key], baseline.metrics[key])}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

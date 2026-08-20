"use client";

import type { AnalysisResult as AnalysisResultData } from "@/lib/domain";
import { TREND_LABELS } from "@/lib/domain";
import { EVIDENCE_MEASURED_FROM_COPY, WHY_HEADING } from "@/lib/result-semantics";
import { deriveRefinements } from "@/lib/refine";
import { CompareBlock } from "./CompareBlock";
import { EvidenceList } from "./EvidenceList";

type Status = "loading" | "error" | "result";

type ResultProps = {
  status: Status;
  result: AnalysisResultData | null;
  error: { code: string; message: string } | null;
  onRetry: () => void;
  onReset: () => void;
  onSelectSuggestion: (topic: string) => void;
};

const METRIC_LABELS = [
  { key: "publications", label: "Publications" },
  { key: "projects", label: "Projects" },
  { key: "software", label: "Software" },
  { key: "datasets", label: "Datasets" },
] as const;

export function AnalysisResult({
  status,
  result,
  error,
  onRetry,
  onReset,
  onSelectSuggestion,
}: ResultProps) {
  if (status === "loading") {
    return (
      <section className="result result-loading" aria-live="polite">
        <span className="result-spinner" aria-hidden="true" />
        <p className="result-loading-text">
          Checking publications, projects, software and datasets in OpenAIRE…
        </p>
      </section>
    );
  }

  if (status === "error" || !result) {
    return (
      <section className="result result-error" aria-live="polite">
        <p className="result-error-message">
          {error?.message ??
            "OpenAIRE could not be reached for this analysis."}
        </p>
        <p className="result-error-note">No finding was generated.</p>
        <button type="button" className="home-submit" onClick={onRetry}>
          Try again
        </button>
      </section>
    );
  }

  const refinements = deriveRefinements(result.topic);

  return (
    <section className="result" aria-live="polite">
      <h2 className="result-topic">{result.topic}</h2>

      <article className="result-finding">
        <span className="result-finding-label">Finding</span>
        <h3 className="result-finding-title">{result.finding.title}</h3>
        <p className="result-finding-summary">{result.finding.summary}</p>
      </article>

      <section className="result-section">
        <h3 className="result-section-title">{WHY_HEADING}</h3>
        {result.finding.reasons.length > 0 ? (
          <ul className="result-reasons">
            {result.finding.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="result-empty">
            No specific reason is available for this finding.
          </p>
        )}
      </section>

      <section className="result-section">
        <h3 className="result-section-title">Measured signals</h3>
        <ul className="result-signals">
          {METRIC_LABELS.map(({ key, label }) => (
            <li key={key} className="result-signal">
              <span className="result-signal-value">
                {result.metrics[key].toLocaleString()}
              </span>
              <span className="result-signal-label">{label}</span>
            </li>
          ))}
          <li className="result-signal">
            <span className="result-signal-value">
              {TREND_LABELS[result.trend]}
            </span>
            <span className="result-signal-label">Trend</span>
          </li>
        </ul>
        <p className="result-trend-note">
          {result.trend === "insufficient_data"
            ? "Insufficient publication history in this scan to estimate a trend."
            : "Trend compares the two most recent complete years against the two preceding ones in this scan."}
        </p>
      </section>

      {result.baseline && (
        <CompareBlock metrics={result.metrics} baseline={result.baseline} />
      )}

      {refinements.length > 0 && (
        <section className="result-section">
          <h3 className="result-section-title">Suggested next scans</h3>
          <ul className="result-refinements">
            {refinements.map((refinement) => (
              <li key={refinement.facet} className="result-refinement">
                <button
                  type="button"
                  className="result-refinement-button"
                  onClick={() => onSelectSuggestion(refinement.topic)}
                >
                  <span className="result-refinement-kind">
                    {refinement.kind}
                  </span>
                  <span className="result-refinement-topic">
                    {refinement.topic}
                  </span>
                  <span className="result-refinement-note">
                    {refinement.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="result-section">
        <h3 className="result-section-title">Evidence</h3>
        {result.provenance && (
          <p className="result-provenance">
            {EVIDENCE_MEASURED_FROM_COPY}
            {result.provenance.collectedAt
              ? ` on ${result.provenance.collectedAt.slice(0, 10)}`
              : ""}
          </p>
        )}
        <EvidenceList
          items={result.evidence}
          projectsCount={result.metrics.projects}
          metrics={result.metrics}
        />
      </section>

      <div className="result-actions">
        <button type="button" className="home-submit" onClick={onReset}>
          New analysis
        </button>
      </div>
    </section>
  );
}

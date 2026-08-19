"use client";

import { useState, type FormEvent } from "react";
import type { AnalysisResult as AnalysisResultData } from "@/lib/domain";
import { AnalysisResult } from "./AnalysisResult";

const EXAMPLE_TOPICS = [
  "AI Agent Governance",
  "Climate Adaptation",
  "Quantum Computing",
];

type AnalyzeError = {
  code: string;
  message: string;
};

type Status = "idle" | "loading" | "error" | "result";

export default function AnalysisForm() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState<AnalyzeError | null>(null);

  async function analyze(rawTopic: string): Promise<void> {
    const trimmed = rawTopic.trim();
    if (!trimmed) return;

    setTopic(trimmed);
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });

      if (res.ok) {
        const data = (await res.json()) as AnalysisResultData;
        setResult(data);
        setStatus("result");
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: AnalyzeError;
      } | null;
      setError(
        body?.error ?? {
          code: "ANALYSIS_FAILED",
          message: "The analysis could not be completed.",
        },
      );
      setStatus("error");
    } catch {
      setError({
        code: "ANALYSIS_FAILED",
        message: "The analysis could not be completed.",
      });
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void analyze(topic);
  }

  function handleExample(example: string): void {
    void analyze(example);
  }

  function reset(): void {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return (
    <>
      <form className="home-form" onSubmit={handleSubmit}>
        <label className="home-label" htmlFor="topic">
          Research topic
        </label>
        <div className="home-form-row">
          <input
            id="topic"
            name="topic"
            type="text"
            className="home-input"
            placeholder="e.g. AI Agent Governance"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={status === "loading"}
            required
          />
          <button
            type="submit"
            className="home-submit"
            disabled={status === "loading"}
          >
            Find gaps
          </button>
        </div>
      </form>

      <p className="home-try">Try:</p>
      <ul className="home-examples">
        {EXAMPLE_TOPICS.map((example) => (
          <li key={example}>
            <button
              type="button"
              className="home-example"
              onClick={() => handleExample(example)}
            >
              {example}
            </button>
          </li>
        ))}
      </ul>

      {status !== "idle" && (
        <AnalysisResult
          status={status}
          result={result}
          error={error}
          onRetry={() => void analyze(topic)}
          onReset={reset}
        />
      )}
    </>
  );
}

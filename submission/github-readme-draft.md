# OpenGap

**Find what's missing in research — and show the evidence.**

OpenGap is an evidence-first OpenAIRE hackathon app that helps researchers turn a vague research idea into a potential, inspectable research-gap hypothesis.

## Problem

Researchers can search publications, but forming a view of a topic's research ecosystem still means manually comparing papers, funded projects, software and datasets. OpenGap asks whether OpenAIRE can turn those records into a transparent, evidence-backed hypothesis.

## Why OpenAIRE

OpenAIRE aggregates publications, funded projects, software and datasets into one Graph, so one scan can compare how a topic is published, funded and translated into reusable outputs from a single source of record.

## How it works

```text
Topic
  ↓
OpenAIRE scan (publications / projects / software / datasets + trend)
  ↓
Normalized entity signals (counts and ratios)
  ↓
Deterministic heuristic rules
  ↓
Evidence-backed potential finding + reasons + evidence
```

## Why this is not another research chatbot

- The core finding is deterministic.
- Measured values are shown.
- Evidence records remain inspectable.
- Missing provider data is not treated as zero; no finding is generated when OpenAIRE is unavailable.
- Evidence URLs are restricted to safe http/https links.
- The product says “potential gap”, not “this should be funded”.

## Demo topics

- **AI Agent Governance** — cautious funding signal.
- **Climate Adaptation** — reuse-signal reading of the measured outputs.
- **Quantum Computing** — normal control case.

OpenGap does not claim any result proves a gap; it flags a measurable signal and shows why.

## Run locally

```bash
npm install
npm run dev
```

Add environment variables described in `.env.example` when running against a custom OpenAIRE endpoint.

## Validate

```bash
npm run lint
npm run test
npm run build
```

## Methodology

See `docs/07-gap-detection-rules.md`.

## Limitations

Search-count heuristics are topic/query dependent and are not scientometric proof. OpenGap is designed to identify signals worth further investigation.

## License

Submission documentation: CC BY 4.0.

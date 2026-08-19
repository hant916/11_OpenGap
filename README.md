# OpenGap

**Find what's missing in research — and show the evidence.**

OpenGap is an evidence-first OpenAIRE hackathon app that helps a researcher turn a vague research idea into a potential, inspectable research-gap hypothesis. Enter a topic, and OpenGap queries OpenAIRE for publications, projects, software and datasets, measures a recent publication trend, and applies a small deterministic rule engine to return at most one **potential gap** — with the exact numbers and OpenAIRE evidence behind it.

- Live app: https://11-open-gap.vercel.app/
- Demo topics: `AI Agent Governance`, `Climate Adaptation`, `Quantum Computing`

## Why OpenAIRE

OpenAIRE aggregates publications, funded projects, software and datasets into one Graph, so a topic scan can compare how research is published, funded and translated into reusable outputs from a single source of record. OpenGap uses that cross-entity view to surface a measurable ecosystem signal instead of re-wording another paper search.

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

OpenGap is one small Next.js (App Router) application. There is no database and no separate backend service; the server-side `/api/analyze` route calls OpenAIRE Graph API V3 and returns a stable `AnalysisResult` contract.

## Why this is not another research chatbot

- The core finding is **deterministic code**, not an LLM judgment.
- Measured values are shown next to the finding.
- Evidence records remain inspectable and link to their source.
- Missing provider data is never converted to `0`, and no finding is generated when OpenAIRE is unavailable.
- Evidence URLs are restricted to safe `http`/`https` links.
- The product says **potential gap** — a signal worth investigating, not proof that a field is novel or fundable.

## Methodology

Gap detection follows `docs/07-gap-detection-rules.md`. In short:

- `reusable_outputs = software + datasets`
- `translation_ratio = reusable_outputs / publications`
- Rule order: sparse evidence (too little data) → potential project/funding signal → potential reuse signal → no strong gap.
- Trend compares the two most recent complete years against the two preceding ones (growing / stable / declining / insufficient data).
- At most three human-readable reasons are templated from the measured values.

## Limitations

Search-count heuristics are topic- and query-dependent and are **not** scientometric proof. OpenGap is designed to surface signals for further investigation, not to prove scientific novelty, funding quality, unmet societal need, or commercial value. OpenAIRE metadata coverage and query wording directly affect every count. A detected signal is a flag to investigate further; it does not claim to prove a gap exists.

## Run locally

```bash
npm install
npm run dev
```

Optional environment variables are described in `.env.example` (an OpenAIRE API token is not required for the demo).

## Validate

```bash
npm run lint
npm run test
npm run build
```

## Production demo (verified 19 Aug 2026)

Three demo topics are wired into the homepage examples and pass the golden demo contract tests:

- **AI Agent Governance** demonstrates a cautious funding signal — measured publications strongly outnumber directly matching project records, and the finding is phrased as a signal worth checking, not as proof.
- **Climate Adaptation** is the reuse-signal demo topic — its measured signals show publications vastly outweighing reusable software/data outputs, and the narrative shows how to read that reusable-output imbalance from the evidence.
- **Quantum Computing** is the normal-control case: it runs through the same deterministic classifier and the result is read as-is, whether that resolves to a gap signal or a no-strong-gap result.

A live analysis for `Quantum Computing` has returned a gap finding from 66,546 publications, 816 projects, 544 software records and 1,549 datasets; the exact classification can change because live OpenAIRE data remains authoritative. The rendered result includes the finding, reasons, measured signals, refinements and representative OpenAIRE evidence records.

OpenGap does **not** claim any of these results prove a gap. It flags a measurable signal and shows why — the numbers and evidence remain inspectable.

- Evidence links resolve to reachable OpenAIRE records (verified HTTP 200); the API response contains no OpenAIRE token.
- Screenshots: `submission/screenshots/`.

**Live status (19 Aug 2026):** the deployed app serves the homepage, and any scan whose OpenAIRE call fails returns a clean, structured error (`OPENAIRE_UNAVAILABLE`) with no stack trace or raw API error shown. When the deployment cannot reach the OpenAIRE Graph, results are not fabricated — run locally (`npm run dev`) for live scans against `api.openaire.eu`.

## Next steps (post-hackathon)

Field-aware baselines, geographic/institutional graph signals, richer funding relationships, and evidence-backed facet exploration are intentionally left for later work.

## License

Submission documentation is under CC BY 4.0 (see `LICENSE.md`).

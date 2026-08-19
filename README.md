# OpenGap

**Find what's missing in research — and show the evidence.**

OpenGap is an evidence-first OpenAIRE hackathon app that helps a researcher turn a vague research idea into a potential, inspectable research-gap hypothesis. Enter a topic, and OpenGap queries OpenAIRE for publications, projects, software and datasets, measures a recent publication trend, and applies a small deterministic rule engine to return at most one **potential gap** — with the exact numbers and OpenAIRE evidence behind it.

- Live app: https://11-open-gap.vercel.app/
- Golden topic: `Quantum Computing`

## How it works

```text
Topic
  ↓
OpenAIRE publications / projects / software / datasets + trend
  ↓
Simple deterministic gap rules
  ↓
Potential finding + reasons + evidence
```

OpenGap is one small Next.js (App Router) application. There is no database and no separate backend service; the server-side `/api/analyze` route calls OpenAIRE Graph API V3 and returns a stable `AnalysisResult` contract.

## Why this is not another research chatbot

- The core finding is **deterministic code**, not an LLM judgment.
- Measured values are shown next to the finding.
- Evidence records remain inspectable and link to their source.
- Missing provider data is never converted to `0`, and no finding is generated when OpenAIRE is unavailable.
- The product says **potential gap** — a signal worth investigating, not proof that a field is novel or fundable.

## Methodology

Gap detection follows `docs/07-gap-detection-rules.md`. In short:

- `reusable_outputs = software + datasets`
- `translation_ratio = reusable_outputs / publications`
- Rule order: sparse evidence (too little data) → potential translation gap → potential project gap → no strong gap.
- Trend compares the two most recent complete years against the two preceding ones (growing / stable / declining / insufficient data).
- At most three human-readable reasons are templated from the measured values.

## Limitations

Search-count heuristics are topic- and query-dependent and are **not** scientometric proof. OpenGap is designed to surface signals for further investigation, not to prove scientific novelty, funding quality, unmet societal need, or commercial value. OpenAIRE metadata coverage and query wording directly affect every count.

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

- The live analysis for `Quantum Computing` returned a growing `Potential translation gap` from 66,546 publications, 816 projects, 544 software records and 1,549 datasets.
- The rendered result includes the finding, reasons, measured signals, refinements and six representative OpenAIRE evidence records.
- The six visible evidence links were verified reachable (HTTP 200); the API response contains no OpenAIRE token.
- Screenshots: `submission/screenshots/`.

## License

Submission documentation is under CC BY 4.0 (see `LICENSE.md`).

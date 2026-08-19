# OpenGap

**Find what's missing in research — and show the evidence.**

OpenGap is an evidence-first OpenAIRE hackathon app that helps researchers turn a vague research idea into a potential, inspectable research-gap hypothesis.

## How it works

```text
Topic
  ↓
OpenAIRE publications / projects / software / datasets
  ↓
Simple deterministic gap rules
  ↓
Potential finding + reasons + evidence
```

## Why this is not another research chatbot

- The core finding is deterministic.
- Measured values are shown.
- Evidence records remain inspectable.
- Missing provider data is not treated as zero.
- The product says “potential gap”, not “this should be funded”.

## Run locally

```bash
npm install
npm run dev
```

Add environment variables described in `.env.example` when the implementation pack creates them.

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

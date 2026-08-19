# OpenGap — OpenAIRE AI Hackathon Impl Pack

**Goal:** ship a working, evidence-first OpenAIRE hackathon MVP before the **20 August 2026, 23:59 CET** submission deadline.

## Product in one sentence

**OpenGap helps a researcher turn a vague research idea into an evidence-backed hypothesis by showing a potential research gap, why it may exist, and the OpenAIRE records behind the finding.**

## Core user loop

```text
IDEA → ANALYZE → POTENTIAL GAP → WHY → EVIDENCE → REFINE
```

The MVP deliberately does **not** attempt to be a research intelligence platform, generalized agent framework, funding analytics suite, or graph explorer.

## Hard delivery reality

At package generation time (19 Aug 2026 morning, France), the official deadline is the next day. Treat the usable engineering window as roughly **40 hours**, not a comfortable 48 hours. Do not plan against an extra timezone hour; target submission by **20 Aug 2026 22:30 France local time at the latest**, leaving buffer for upload/form failures.

## Recommended implementation stack

- **Next.js App Router + TypeScript**
- One deployable web application; no separate backend service
- Native `fetch` for OpenAIRE
- Minimal CSS; no design-system dependency required
- Server-side OpenAIRE calls through a small provider boundary
- **Timebox OpenAIRE MCP/Alien integration first (maximum 90 minutes)**; use it as the primary provider when it works cleanly
- Keep OpenAIRE Graph API V3 behind the same provider contract as the deterministic fallback so MCP setup cannot consume the submission
- No database; in-memory/request cache only

## MVP result

Given a topic such as `AI Agent Governance`, return:

1. counts for publications, projects, software and datasets;
2. a simple recent publication trend;
3. at most one primary **potential gap**;
4. 2–3 deterministic reasons;
5. a small set of OpenAIRE evidence records;
6. optional comparison with one baseline topic;
7. one-click topic refinement suggestions.

## Package layout

```text
README.md
PACK-MANIFEST.json
LICENSE.md
docs/                       Product, UX, architecture, rules, delivery docs
schemas/                    Stable MVP data contracts + fixture
prompts/                    Tiny optional LLM prompts
references/                 Official OpenAIRE/Hackathon references
sdd/task-dir/               EverRun impl-pack.v3.convergence executable TODOs
submission/                 Story, form answers, demo and final submission assets
scripts/                    Pack validators / delivery checks
```

## Execution order

Run task packs sequentially:

```text
0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007 → 0008 → 0009 → 0010 → 0011 → 0012
```

The pack is intentionally sequential because the schedule is too short for broad parallel architecture work.

## P0 definition of done

The artifact is shippable only when all are true:

- user can enter a research topic;
- application retrieves real OpenAIRE data;
- result shows counts for 4 entity/output classes;
- deterministic logic produces a potential gap or explicitly says evidence is insufficient;
- reasons are derived from the same measured values;
- evidence records link back to OpenAIRE/source identifiers;
- one known demo topic works repeatedly;
- empty/rate-limit/error states are understandable;
- production build passes;
- public deployment works in an incognito browser;
- GitHub README explains methodology and limitations;
- 1–2 page hackathon story is complete;
- licensing and submission checklist are complete.

## Red lines

- No multi-agent system.
- No EVERRUN runtime integration in the MVP critical path.
- No AILUROS control plane.
- No graph database.
- No vector database/RAG pipeline.
- No auth, accounts, saved projects, alerts or scheduled radar.
- No arbitrary “AI opportunity score”.
- No claim that a detected gap proves a field is scientifically valuable or fundable.
- No invented OpenAIRE records or metrics.
- No LLM dependency for the core gap decision.

See `docs/10-48h-delivery-plan.md` before implementation.

## Production demo

- **Live app:** https://11-open-gap.vercel.app/
- **Golden topic:** `Quantum Computing`
- **Production smoke:** 19 Aug 2026 — the live analysis returned a growing
  `translation_gap` from 66,546 publications, 816 projects, 544 software
  records, and 1,549 datasets. The rendered result includes the finding,
  reasons, measured signals, refinements, and six representative evidence
  records without unfinished UI.
- **Evidence check:** the six visible Quantum Computing evidence links were
  verified as reachable (HTTP 200). The API response contains no OpenAIRE token.

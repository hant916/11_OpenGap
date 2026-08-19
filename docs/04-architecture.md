# Architecture — KISS

## Target

One deployable Next.js application.

```text
Browser
  │
  ▼
Next.js page
  │
  ▼
POST /api/analyze
  │
  ├─ normalize topic
  ├─ call OpenAIRE provider
  ├─ aggregate counts/trend/evidence
  ├─ run deterministic gap rules
  └─ return AnalysisResult
```

## Logical modules

```text
app/
  page.tsx
  result UI components
  api/analyze/route.ts

lib/
  domain.ts
  openaire.ts
  analyze.ts
  gap-rules.ts
  trend.ts
  refine.ts
```

Keep boundaries small. A module is justified only when it has a clear contract and can be tested independently.

## OpenAIRE provider

Minimum contract:

```ts
interface OpenAireProvider {
  analyzeTopic(topic: string): Promise<OpenAireSnapshot>;
}
```

`OpenAireSnapshot` contains only what the product consumes:

- counts;
- year buckets;
- representative evidence.

### MCP-first timebox

Spend at most 90 minutes validating the supplied OpenAIRE MCP/Alien quick-start. If it works cleanly, use it as the primary `OpenAireProvider`. If it does not, stop the spike and preserve the product schedule.

### API fallback

Stable deterministic fallback:

- `GET /v3/research-products?search=<topic>&type=publication...`
- same endpoint for `type=software` and `type=dataset`;
- `GET /v3/projects?search=<topic>...`.

OpenAIRE V3 responses expose `header.numFound`, allowing the MVP to fetch a few evidence records while obtaining a total count from the same request.

### Provider rule

Both paths, if present, implement the same tiny provider contract. Do not restructure the product around MCP protocol details, and do not keep debugging MCP past the 90-minute kill trigger.

## No database

No persistence is required. The analysis request is reproducible from:

- topic;
- baseline topic, if any;
- methodology version;
- retrieval timestamp.

## Resilience

- request timeout;
- explicit error result;
- no fabricated fallback metrics;
- optional short-lived in-memory/fetch cache;
- demo fixture path must be clearly labelled and disabled by default in production.

## Architecture decision

Complexity is a defect in this deadline. Prefer duplicated 5-line mapping code over a premature generic scholarly-data framework.

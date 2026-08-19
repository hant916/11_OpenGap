# Testing and Quality

## Quality strategy

The deadline does not justify weak correctness. It justifies a small test surface.

## Unit tests — P0

### Gap rules

Test at least:

- sparse evidence;
- translation-gap boundary;
- project-gap boundary;
- no-strong-gap path;
- zero publications;
- baseline strengthens reason but does not create fabricated counts.

### Trend

Test:

- growing;
- stable;
- declining;
- insufficient previous evidence;
- partial current year excluded by caller/fixture.

### OpenAIRE mapping

Test fixture mapping for:

- `header.numFound`;
- result title/id/year extraction;
- missing optional fields;
- provider error does not become zero count.

## Integration test — P0

One route-level test with a mocked provider:

```text
POST /api/analyze
→ deterministic AnalysisResult
```

## Manual smoke — P0

Pre-test three topics:

- AI Agent Governance
- Climate Adaptation
- Quantum Computing

Pick **one** as the official golden demo topic only after observing which produces a clear, defensible live result.

## Production smoke

In incognito/private browser:

1. open deployed URL;
2. run golden topic;
3. open at least two evidence links;
4. run one empty/invalid input;
5. refresh result flow;
6. verify mobile width;
7. verify no secrets appear in browser bundle/network payloads.

## Data honesty gates

Release is rejected if:

- a displayed count is not traceable to OpenAIRE response metadata;
- a demo fixture is presented as live data;
- a missing provider response is represented as zero;
- the UI claims a definitive scientific/funding opportunity from heuristic counts.

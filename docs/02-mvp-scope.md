# MVP Scope

## In scope — P0

- Single topic text input.
- Optional one-topic baseline comparison.
- OpenAIRE research-product search.
- OpenAIRE project search.
- Counts: publications, projects, software, datasets.
- Recent publication trend.
- Deterministic gap rule engine.
- At most one primary gap result.
- 2–3 deterministic “why” reasons.
- Evidence drill-down with representative records.
- Refine-topic suggestions.
- Clear insufficient-data state.
- Clear OpenAIRE/API failure state.
- Demo fixture mode for presentation safety, visibly labelled as demo data when used.
- Production deployment.
- README + methodology + limitations.
- Hackathon 1–2 page story and submission assets.

## P1 — only after P0 is green

- Copy summary.
- Export analysis JSON.
- Small horizontal comparison visualization.
- One tiny sparkline/mini trend chart.
- Query-result cache.
- OpenAIRE MCP/Alien adapter if credentials and quick-start path are already available.

## Explicitly out of scope

- User accounts.
- Persistence/database.
- Saved analyses.
- Scheduled radar/notifications.
- Multi-agent orchestration.
- EVERRUN runtime integration.
- AILUROS runtime governance.
- Generic claim state machine.
- Organization/person graph exploration.
- Collaboration recommendations.
- Full funding-flow analytics.
- Funding euro totals unless directly reliable from the selected OpenAIRE queries.
- Graph visualization.
- Vector DB / embeddings / RAG.
- General web search fallback.
- Autonomous iterative investigation.
- “Opportunity score”.
- Scientific/funding recommendation claims.

## Scope-kill rule

If a feature does not improve one of these four questions, cut it:

```text
What did you find?
Why?
Can I inspect the evidence?
What do I do next?
```

# Hard-Deadline Delivery Plan

## Important correction

The official OpenAIRE AI Hackathon deadline is **20 August 2026 at 23:59 CET**. From the morning of 19 August in France, the effective window is roughly **40 hours**, not 48. Treat **20 Aug 22:30 France local time** as the internal submission cutoff.

## Allocation

### Block A — Hours 0–4: Freeze + scaffold

- Read this pack.
- Freeze product wording and red lines.
- Create repo/application scaffold.
- Put core docs in repo.
- Confirm deployment target.
- Confirm live OpenAIRE V3 request works.

**Exit gate:** homepage builds + one OpenAIRE request returns real data.

### Block B — Hours 4–12: Core data path

- Implement domain types.
- Implement OpenAIRE provider.
- Get four counts.
- Collect evidence records.
- Implement timeout/error semantics.

**Exit gate:** CLI/test or API route returns real `AnalysisResult` snapshot minus final gap logic.

### Block C — Hours 12–18: Gap engine

- Implement trend.
- Implement gap rules.
- Implement deterministic reasons.
- Add rule tests.

**Exit gate:** fixture tests fully green; no LLM required.

### Block D — Hours 18–26: UX

- Home input.
- Result card.
- Why section.
- Counts/trend.
- Evidence list.
- Error/loading states.

**Exit gate:** golden path usable end-to-end locally.

### Block E — Hours 26–31: Low-cost polish

Only after P0 green:

- baseline compare;
- refine suggestions;
- copy/export JSON;
- tiny visual polish.

**Exit gate:** no regression to P0.

### Block F — Hours 31–35: Test + deploy

- provider fixtures;
- route test;
- production build;
- deploy;
- incognito smoke;
- choose golden demo topic.

### Block G — Hours 35–38: Submission assets

- final README;
- 1–2 page story;
- screenshots;
- 3-minute demo script;
- form answers;
- license statement.

### Block H — Hours 38–40: Submission buffer

- final public URL check;
- final repo visibility check;
- submit;
- reopen submission if possible and verify fields/links;
- preserve confirmation evidence.

## Feature kill order when behind

Kill in this exact order:

1. copy/export;
2. refine suggestions;
3. baseline comparison;
4. trend visualization (keep raw trend label if already working);
5. MCP adapter.

Never kill:

- live OpenAIRE data;
- deterministic gap logic;
- why reasons;
- evidence records;
- error honesty;
- deploy + story + submission.

## Stop condition

At internal cutoff minus 4 hours, **no new product feature may start**. Remaining work is defects, deploy, screenshots and submission only.

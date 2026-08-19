# Gap Detection Rules — MVP v1

## Principle

Gap detection is **deterministic code**, not an LLM judgment.

The output is intentionally phrased as a **potential** gap because record counts alone cannot prove scientific novelty, funding quality, unmet societal need, or commercial value.

## Derived values

```text
reusable_outputs = software + datasets
translation_ratio = reusable_outputs / publications
project_ratio = projects / publications
```

Division is evaluated only when publications > 0.

## Rule order

Run in this order. Stop after the first matching rule.

### R0 — Sparse evidence

```text
publications < 10
```

Finding:

```text
Sparse evidence — no reliable gap
```

Reason: the available evidence base is too small for the MVP heuristic.

### R1 — Potential translation gap

Candidate when:

```text
publications >= 20
AND reusable_outputs <= max(3, round(publications * 0.10))
```

If a baseline is present, strengthen the reason only when:

```text
baseline.translation_ratio > 0
AND topic.translation_ratio < baseline.translation_ratio * 0.5
```

Finding:

```text
Potential translation gap
```

### R2 — Potential project gap

Candidate when:

```text
publications >= 20
AND projects <= max(3, round(publications * 0.15))
```

Finding:

```text
Potential project gap
```

### R3 — No strong gap

Everything else:

```text
No strong gap detected
```

## Trend

Use recent publication buckets only.

MVP preferred comparison:

```text
recent = publications in latest 2 complete years
previous = publications in preceding 2 complete years
```

Rules:

```text
if previous < 5: insufficient_data
else if recent >= previous * 1.25: growing
else if recent <= previous * 0.75: declining
else stable
```

Do not treat the partial current year as a complete year.

## Reasons

Reasons are templates populated from measured values. Maximum 3.

Examples:

```text
"{publications} publications were found versus {reusable_outputs} software/data outputs."
"Reusable outputs represent about {ratio}% of the publication count in this query."
"Publication activity is growing across the compared year windows."
"The translation ratio is less than half the selected baseline topic."
```

## Methodological warning

Search count comparisons are query-dependent and not a scientometric proof. The UI and submission story must state that OpenGap identifies **signals for further investigation**, not definitive research-policy conclusions.
